import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useRestaurantStore, getTenantSyncableState, DEFAULT_TENANT_STATE } from "@/store/restaurantStore";

let unsubscribe: (() => void) | null = null;
let activeRestaurantId: string | null = null;
let suppressNextWrite = false;
let writeTimer: ReturnType<typeof setTimeout> | null = null;

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
    await setDoc(ref, DEFAULT_TENANT_STATE);
  }

  unsubscribe = useRestaurantStore.subscribe(() => {
    if (activeRestaurantId !== restaurantId) return;
    if (suppressNextWrite) {
      suppressNextWrite = false;
      return;
    }
    if (writeTimer) clearTimeout(writeTimer);
    writeTimer = setTimeout(() => {
      setDoc(doc(db, "restaurants", restaurantId), getTenantSyncableState()).catch((err) => {
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
