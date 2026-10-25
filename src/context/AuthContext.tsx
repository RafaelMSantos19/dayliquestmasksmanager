import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
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
  isIOSStandaloneIssue?: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  loadingAuth: boolean;
  authError: AuthErrorInfo | null;
  clearAuthError: () => void;
  signInWithGoogle: (preferRedirect?: boolean) => Promise<User | null>;
  signInWithEmail: (email: string, pass: string) => Promise<User | null>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<User | null>;
  resetPassword: (email: string) => Promise<void>;
  signInWithRedirectFlow: () => Promise<void>;
  logout: () => Promise<void>;
  isStandalone: boolean;
  isIOS: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loadingAuth: true,
  authError: null,
  clearAuthError: () => {},
  signInWithGoogle: async () => null,
  signInWithEmail: async () => null,
  signUpWithEmail: async () => null,
  resetPassword: async () => {},
  signInWithRedirectFlow: async () => {},
  logout: async () => {},
  isStandalone: false,
  isIOS: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);

  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(standalone);

      const ua = window.navigator.userAgent.toLowerCase();
      const ios = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsIOS(ios);
    }
  }, []);

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

    // Handle incoming redirect authentication
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
          isIOSStandaloneIssue: isIOS && isStandalone,
        });
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isIOS, isStandalone]);

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
        isIOSStandaloneIssue: isIOS && isStandalone,
      });
    }
  };

  const signInWithGoogle = async (preferRedirect = false): Promise<User | null> => {
    try {
      sound.playClick();
      clearAuthError();

      // Only redirect if explicitly requested
      if (preferRedirect) {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }

      // Try popup first (works on desktop, Android, and WebKit without kicking out to Safari)
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
        isIOSStandaloneIssue: isIOS && isStandalone,
      });

      return null;
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<User | null> => {
    try {
      sound.playClick();
      clearAuthError();
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      sound.playLevelUp();
      return res.user;
    } catch (err: unknown) {
      console.error('Email sign-in failed:', err);
      const fbErr = err as AuthError;
      const code = fbErr?.code || 'unknown';
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      setAuthError({
        code,
        message: getFriendlyAuthErrorMessage(code, fbErr?.message),
        domain: hostname,
        isUnauthorizedDomain: false,
        isPopupBlocked: false,
      });
      return null;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string): Promise<User | null> => {
    try {
      sound.playClick();
      clearAuthError();
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name && res.user) {
        await updateProfile(res.user, { displayName: name.trim() });
      }
      sound.playLevelUp();
      return res.user;
    } catch (err: unknown) {
      console.error('Email sign-up failed:', err);
      const fbErr = err as AuthError;
      const code = fbErr?.code || 'unknown';
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      setAuthError({
        code,
        message: getFriendlyAuthErrorMessage(code, fbErr?.message),
        domain: hostname,
        isUnauthorizedDomain: false,
        isPopupBlocked: false,
      });
      return null;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      sound.playClick();
      clearAuthError();
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: unknown) {
      console.error('Password reset failed:', err);
      const fbErr = err as AuthError;
      const code = fbErr?.code || 'unknown';
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      setAuthError({
        code,
        message: getFriendlyAuthErrorMessage(code, fbErr?.message),
        domain: hostname,
        isUnauthorizedDomain: false,
        isPopupBlocked: false,
      });
      throw err;
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
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signInWithRedirectFlow,
        logout,
        isStandalone,
        isIOS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

function getFriendlyAuthErrorMessage(code: string, rawMessage?: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos. Verifique suas credenciais.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado. Tente entrar em vez de criar uma nova conta.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'Formato de e-mail inválido.';
    case 'auth/operation-not-allowed':
      return 'Login com E-mail/Senha ainda não foi ativado no painel do Firebase Console.';
    default:
      return rawMessage || 'Erro ao realizar autenticação.';
  }
}
