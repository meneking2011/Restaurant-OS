import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, DEFAULT_RESTAURANT_ID } from "./firebase";
import { startTenantSync, stopTenantSync } from "./tenantSync";

interface AuthContextValue {
  user: User | null;
  restaurantId: string | null;
  /** True while Firebase is resolving the initial auth state or a tenant is loading. */
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Multi-tenant onboarding: every owner UID maps to exactly one isolated restaurantId.
 * The first person ever to sign in claims the "default" tenant, which is the one this
 * running app instance renders publicly. Anyone signing up afterwards is automatically
 * provisioned a brand-new, fully isolated restaurant — ready for a future multi-storefront
 * rollout, even though only "default" is served by this particular deployment today.
 */
async function resolveRestaurantId(uid: string, email: string | null): Promise<string> {
  const ownerRef = doc(db, "owners", uid);
  const ownerSnap = await getDoc(ownerRef);
  if (ownerSnap.exists()) {
    return ownerSnap.data().restaurantId as string;
  }

  const defaultSnap = await getDoc(doc(db, "restaurants", DEFAULT_RESTAURANT_ID));
  const restaurantId = defaultSnap.exists() ? crypto.randomUUID() : DEFAULT_RESTAURANT_ID;

  await setDoc(ownerRef, { restaurantId, email: email ?? "", createdAt: new Date().toISOString() });
  return restaurantId;
}

function mapAuthError(code?: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "That email address looks invalid.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account with that email already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setError(null);
      setLoading(true);
      try {
        if (!firebaseUser) {
          // Anonymous visitor — render the site's own (default) tenant data.
          setUser(null);
          setRestaurantId(null);
          await startTenantSync(DEFAULT_RESTAURANT_ID);
          return;
        }
        const rid = await resolveRestaurantId(firebaseUser.uid, firebaseUser.email);
        await startTenantSync(rid);
        setUser(firebaseUser);
        setRestaurantId(rid);
      } catch (err) {
        console.error("Auth/tenant resolution failed:", err);
        setError("Failed to load your restaurant data. Please try again.");
        setUser(null);
        setRestaurantId(null);
      } finally {
        setLoading(false);
      }
    });
    return () => {
      unsubscribe();
      stopTenantSync();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(mapAuthError(code));
      throw err;
    }
  };

  const signup = async (email: string, password: string) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(mapAuthError(code));
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        setError(mapAuthError(code));
      }
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, restaurantId, loading, error, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
