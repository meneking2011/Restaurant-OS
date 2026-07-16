import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useRestaurantStore, getTenantSyncableState, DEFAULT_TENANT_STATE } from "@/store/restaurantStore";

let unsubscribe: (() => void) | null = null;
let activeRestaurantId: string | null = null;
let suppressNextWrite = false;
let writeTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Recursively strips `undefined` values from an object so Firestore never
 * receives them (Firestore throws on any undefined field).
 * - Object keys with undefined values are omitted entirely.
 * - Array entries that are undefined are replaced with null.
 */
function sanitizeForFirestore(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map((item) => (item === undefined ? null : sanitizeForFirestore(item)));
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (v !== undefined) {
      out[k] = sanitizeForFirestore(v);
    }
  }
  return out;
}

function getSanitizedState() {
  return sanitizeForFirestore(getTenantSyncableState()) as Record<string, unknown>;
}

/**
 * Immediately writes the current store state to Firestore (no debounce).
 * Use for an explicit "Publish" action.
 */
export async function forceSyncNow(): Promise<void> {
  if (!activeRestaurantId) return;
  if (writeTimer) { clearTimeout(writeTimer); writeTimer = null; }
  await setDoc(doc(db, "restaurants", activeRestaurantId), getSanitizedState());
}

/**
 * Loads a tenant's data from Firestore into the store (seeding it on first use),
 * then keeps Firestore in sync with subsequent local edits.
 */
export async function startTenantSync(restaurantId: string) {
  stopTenantSync();
  activeRestaurantId = restaurantId;
  const ref = doc(db, "restaurants", restaurantId);

  const snap = await getDoc(ref);
  if (snap.exists()) {
    suppressNextWrite = true;
    useRestaurantStore.getState().hydrateFromTenant(snap.data() as never);
  } else {
    await setDoc(ref, sanitizeForFirestore(DEFAULT_TENANT_STATE) as Record<string, unknown>);
  }

  unsubscribe = useRestaurantStore.subscribe(() => {
    if (activeRestaurantId !== restaurantId) return;
    if (suppressNextWrite) {
      suppressNextWrite = false;
      return;
    }
    if (writeTimer) clearTimeout(writeTimer);
    writeTimer = setTimeout(() => {
      setDoc(doc(db, "restaurants", restaurantId), getSanitizedState()).catch((err) => {
        console.error("Failed to sync restaurant data to Firestore:", err);
      });
    }, 600);
  });
}

export function stopTenantSync() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  if (writeTimer) {
    clearTimeout(writeTimer);
    writeTimer = null;
  }
  activeRestaurantId = null;
}
