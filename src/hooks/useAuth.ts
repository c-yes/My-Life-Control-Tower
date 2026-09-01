import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const isMobileBrowser = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Handle the result of signInWithRedirect (mobile) on page load.
    // onAuthStateChanged below also fires after a redirect, so we only
    // need getRedirectResult to catch errors from the redirect flow.
    getRedirectResult(auth).catch((e: unknown) => {
      const err = e as { code?: string; message?: string };
      if (err.code && err.code !== 'auth/popup-closed-by-user') {
        setAuthError(`로그인 오류 (${err.code ?? 'unknown'}): ${err.message ?? ''}`);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    setAuthError(null);
    try {
      if (isMobileBrowser) {
        // Popups are often blocked on mobile browsers — redirect flow is more reliable.
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      // Ignore user-cancelled popup
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
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
