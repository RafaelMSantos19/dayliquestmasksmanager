import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged,
  AuthError,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { sound } from '../utils/audio';

export interface AuthErrorInfo {
  code: string;
  message: string;
  domain: string;
  isUnauthorizedDomain: boolean;
  isPopupBlocked: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  loadingAuth: boolean;
  authError: AuthErrorInfo | null;
  clearAuthError: () => void;
  signInWithGoogle: (preferRedirect?: boolean) => Promise<User | null>;
  signInWithRedirectFlow: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loadingAuth: true,
  authError: null,
  clearAuthError: () => {},
  signInWithGoogle: async () => null,
  signInWithRedirectFlow: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);

  const clearAuthError = () => setAuthError(null);

  // Check for redirect result on page load (e.g. after signInWithRedirect)
  useEffect(() => {
    let isMounted = true;

    // Standard auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isMounted) {
        setCurrentUser(user);
        setLoadingAuth(false);
      }
    });

    // Handle incoming redirect authentication from tablet/mobile
    getRedirectResult(auth)
      .then((result) => {
        if (isMounted && result?.user) {
          setCurrentUser(result.user);
          sound.playLevelUp();
        }
      })
      .catch((err: unknown) => {
        console.error('Firebase Auth getRedirectResult error:', err);
        const fbErr = err as AuthError;
        const code = fbErr?.code || 'unknown';
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        setAuthError({
          code,
          message: fbErr?.message || 'Erro de autenticação no redirecionamento',
          domain: hostname,
          isUnauthorizedDomain: code === 'auth/unauthorized-domain',
          isPopupBlocked: false,
        });
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithRedirectFlow = async () => {
    try {
      sound.playClick();
      clearAuthError();
      await signInWithRedirect(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Firebase Auth signInWithRedirect error:', err);
      const fbErr = err as AuthError;
      const code = fbErr?.code || 'unknown';
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      setAuthError({
        code,
        message: fbErr?.message || 'Falha ao redirecionar para o Google.',
        domain: hostname,
        isUnauthorizedDomain: code === 'auth/unauthorized-domain',
        isPopupBlocked: false,
      });
    }
  };

  const signInWithGoogle = async (preferRedirect = false): Promise<User | null> => {
    try {
      sound.playClick();
      clearAuthError();

      // If explicit redirect requested or standalone PWA where popups usually fail
      const isStandalone =
        typeof window !== 'undefined' &&
        (window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as unknown as { standalone?: boolean }).standalone === true);

      if (preferRedirect || isStandalone) {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }

      const result = await signInWithPopup(auth, googleProvider);
      sound.playLevelUp();
      return result.user;
    } catch (err: unknown) {
      console.error('Google Sign-in failed:', err);
      const fbErr = err as AuthError;
      const code = fbErr?.code || 'unknown';
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

      const isUnauthorizedDomain = code === 'auth/unauthorized-domain';
      const isPopupBlocked =
        code === 'auth/popup-blocked' ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request';

      setAuthError({
        code,
        message: fbErr?.message || 'Erro ao realizar login com Google',
        domain: hostname,
        isUnauthorizedDomain,
        isPopupBlocked,
      });

      return null;
    }
  };

  const logout = async () => {
    sound.playClick();
    clearAuthError();
    await fbSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loadingAuth,
        authError,
        clearAuthError,
        signInWithGoogle,
        signInWithRedirectFlow,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
