import { createContext, useContext, useEffect, useState } from "react";
import { getDatabase, onValue, ref, set } from "firebase/database";

import { app } from "@/firebaseConfig";
import { useAuth } from "@/context/AuthContext";

interface MaskContextValue {
  masked: boolean;
  toggleMask: () => void;
}

const MaskContext = createContext<MaskContextValue | null>(null);

/**
 * MaskProvider
 *
 * Manages the amount-masking toggle for the app. Reads the saved preference
 * from Firebase on login and writes back on every toggle. Defaults to masked
 * (eye closed) when no preference is stored.
 *
 * Firebase path: /expenses/users/{uid}/preferences/maskAmounts
 *
 * @param {{ children: React.ReactNode }} props
 */
export const MaskProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const [masked, setMasked] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setMasked(true);
      return;
    }
    const db = getDatabase(app);
    const prefRef = ref(db, `expenses/users/${currentUser.uid}/preferences/maskAmounts`);
    const unsub = onValue(prefRef, (snapshot) => {
      setMasked(snapshot.exists() ? (snapshot.val() as boolean) : true);
    });
    return () => unsub();
  }, [currentUser]);

  /**
   * toggleMask
   *
   * Flips the masked state and persists the new value to Firebase.
   * Falls back to local-only toggle when no user is authenticated.
   */
  const toggleMask = () => {
    const next = !masked;
    setMasked(next);
    if (!currentUser) return;
    const db = getDatabase(app);
    set(ref(db, `expenses/users/${currentUser.uid}/preferences/maskAmounts`), next).catch(
      (err) => console.error("Failed to save mask preference:", err)
    );
  };

  return (
    <MaskContext.Provider value={{ masked, toggleMask }}>
      {children}
    </MaskContext.Provider>
  );
};

/**
 * useMask
 *
 * Returns the current masked state and the toggleMask function.
 * Must be used inside a MaskProvider.
 *
 * @returns {{ masked: boolean; toggleMask: () => void }}
 */
export const useMask = () => {
  const ctx = useContext(MaskContext);
  if (!ctx) throw new Error("useMask must be used within MaskProvider");
  return ctx;
};
