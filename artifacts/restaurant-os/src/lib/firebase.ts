import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase web config is not secret — it is safe to ship in the client bundle.
// Real access control is enforced by Firestore Security Rules keyed on auth uid.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

/**
 * Every deployment of this app serves exactly one public-facing storefront.
 * That storefront's data always lives under this fixed tenant id in Firestore.
 * The very first person to sign up claims it automatically (see auth.tsx).
 * Any additional signups become fully isolated, independent tenants — data is
 * walled off per restaurantId and ready for a future multi-storefront rollout,
 * but only the "default" tenant is rendered by *this* running app instance.
 */
export const DEFAULT_RESTAURANT_ID = "default";
