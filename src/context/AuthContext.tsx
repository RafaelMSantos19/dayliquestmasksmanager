import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { sound } from '../utils/audio';

interface AuthContextType {
  currentUser: User | null;
  loadingAuth: boolean;
  signInWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loadingAuth: true,
  signInWithGoogle: async () => null,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      sound.playClick();
      const result = await signInWithPopup(auth, googleProvider);
      sound.playLevelUp();
      return result.user;
    } catch (error) {
      console.error('Google Sign-in failed:', error);
      alert('Não foi possível entrar com o Google. Verifique se o popup foi permitido no navegador.');
      return null;
    }
  };

  const logout = async () => {
    sound.playClick();
    await fbSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loadingAuth, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
