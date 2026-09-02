import { useState, useEffect } from 'react';
import {
  User, onAuthStateChanged, signInWithPopup, signInWithRedirect,
  getRedirectResult, signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Handle redirect result on app load (iOS Safari standalone/PWA mode).
    // Safe to call even when no redirect is pending — returns null in that case.
    getRedirectResult(auth).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return;
      }
      // iOS Safari in standalone (PWA) mode blocks popups — fall back to redirect.
      if (err.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr: unknown) {
          const rErr = redirectErr as { code?: string; message?: string };
          setAuthError(`로그인 오류 (${rErr.code ?? 'unknown'}): ${rErr.message ?? ''}`);
        }
        return;
      }
      setAuthError(`로그인 오류 (${err.code ?? 'unknown'}): ${err.message ?? ''}`);
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return { user, loading, authError, signInWithGoogle, logout };
}
