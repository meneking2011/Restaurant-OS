import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { useRestaurantStore, getTenantSyncableState, DEFAULT_TENANT_STATE } from "@/store/restaurantStore";

let storeUnsubscribe: (() => void) | null = null;
let firestoreUnsubscribe: (() => void) | null = null;
let activeRestaurantId: string | null = null;
let writeTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Suppress the next Zustand subscription callback (so hydrating the store
 * from a Firestore snapshot doesn't immediately echo back as a write).
 */
let suppressNextStoreWrite = false;

/**
 * Suppress the next onSnapshot hydration (so our own Firestore writes
 * don't echo back and overwrite any local state the admin just changed).
 */
let suppressNextHydration = false;
let suppressHydrationTimer: ReturnType<typeof setTimeout> | null = null;

// ─── Firestore sanitizer ─────────────────────────────────────────────────────
// Recursively strips `undefined` values — Firestore throws on any undefined field.

function sanitizeForFirestore(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map((item) => (item === undefined ? null : sanitizeForFirestore(item)));
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (v !== undefined) out[k] = sanitizeForFirestore(v);
  }
  return out;
}

function getSanitizedState(): Record<string, unknown> {
  return sanitizeForFirestore(getTenantSyncableState()) as Record<string, unknown>;
}

// ─── Write helpers ───────────────────────────────────────────────────────────

function scheduleWrite(restaurantId: string) {
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    writeTimer = null;
    // Suppress the onSnapshot echo-back that will arrive after this write
    suppressNextHydration = true;
    if (suppressHydrationTimer) clearTimeout(suppressHydrationTimer);
    // Safety valve: clear suppression after 6 s if the snapshot never fires
    suppressHydrationTimer = setTimeout(() => {
      suppressNextHydration = false;
      suppressHydrationTimer = null;
    }, 6000);

    setDoc(doc(db, "restaurants", restaurantId), getSanitizedState()).catch((err) => {
      console.error("[tenantSync] Firestore write failed:", err);
      suppressNextHydration = false;
    });
  }, 600);
}

/**
 * Immediately flush the current store state to Firestore (no debounce).
 * Exported for the "Publish Changes" button.
 */
export async function forceSyncNow(): Promise<void> {
  if (!activeRestaurantId) return;
  if (writeTimer) { clearTimeout(writeTimer); writeTimer = null; }

  suppressNextHydration = true;
  if (suppressHydrationTimer) clearTimeout(suppressHydrationTimer);
  suppressHydrationTimer = setTimeout(() => {
    suppressNextHydration = false;
    suppressHydrationTimer = null;
  }, 6000);

  await setDoc(doc(db, "restaurants", activeRestaurantId), getSanitizedState());
}

// ─── Main API ────────────────────────────────────────────────────────────────

/**
 * Starts a **real-time** Firestore listener on the restaurant document.
 *
 * - Initial snapshot: hydrates the store from Firestore (or seeds Firestore
 *   with default state on first launch).
 * - Subsequent snapshots: hydrate the store so any change made from another
 *   session (e.g. a customer placing an order) appears instantly without a
 *   page refresh.
 * - Local store mutations trigger a debounced write back to Firestore.
 * - Echo-back suppression flags prevent the two sides from looping.
 */
export async function startTenantSync(restaurantId: string) {
  stopTenantSync();
  activeRestaurantId = restaurantId;
  const ref = doc(db, "restaurants", restaurantId);

  // Block until the initial snapshot arrives so the UI always renders
  // real data rather than defaults.
  await new Promise<void>((resolve) => {
    let resolved = false;

    firestoreUnsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          if (!suppressNextHydration) {
            // Remote change (or initial load) — update the store.
            // Mark the resulting store-change as a hydration so we don't
            // immediately write it back to Firestore.
            suppressNextStoreWrite = true;
            useRestaurantStore.getState().hydrateFromTenant(snap.data() as never);
          } else {
            // Echo-back from our own write — ignore and clear the flag.
            suppressNextHydration = false;
            if (suppressHydrationTimer) {
              clearTimeout(suppressHydrationTimer);
              suppressHydrationTimer = null;
            }
          }
        } else if (!resolved) {
          // No document yet — this is the very first launch.
          // Seed Firestore with the defaults and suppress the resulting echo.
          suppressNextHydration = true;
          if (suppressHydrationTimer) clearTimeout(suppressHydrationTimer);
          suppressHydrationTimer = setTimeout(() => {
            suppressNextHydration = false;
            suppressHydrationTimer = null;
          }, 6000);
          setDoc(ref, sanitizeForFirestore(DEFAULT_TENANT_STATE) as Record<string, unknown>).catch(
            (err) => { console.error("[tenantSync] Initial seed failed:", err); }
          );
        }

        if (!resolved) {
          resolved = true;
          resolve();
        }
      },
      (err) => {
        console.error("[tenantSync] Firestore listener error:", err);
        if (!resolved) {
          resolved = true;
          resolve(); // don't block the app if Firestore is unavailable
        }
      }
    );
  });

  // Subscribe to local store changes and write them to Firestore.
  storeUnsubscribe = useRestaurantStore.subscribe(() => {
    if (activeRestaurantId !== restaurantId) return;

    if (suppressNextStoreWrite) {
      // This change came from hydrateFromTenant — skip writing it back.
      suppressNextStoreWrite = false;
      return;
    }

    scheduleWrite(restaurantId);
  });
}

export function stopTenantSync() {
  if (storeUnsubscribe)   { storeUnsubscribe();   storeUnsubscribe = null;   }
  if (firestoreUnsubscribe) { firestoreUnsubscribe(); firestoreUnsubscribe = null; }
  if (writeTimer)          { clearTimeout(writeTimer);          writeTimer = null;          }
  if (suppressHydrationTimer) { clearTimeout(suppressHydrationTimer); suppressHydrationTimer = null; }
  activeRestaurantId    = null;
  suppressNextStoreWrite = false;
  suppressNextHydration  = false;
}
