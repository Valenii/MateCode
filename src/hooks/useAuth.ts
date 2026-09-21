import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile, AuthCredentials, SavedAccount } from '../types/user';
import {
  registerUser,
  loginUser,
  logoutUser,
  onAuthChange,
  signInWithGoogle,
  resetPassword as resetPasswordService,
  getSavedAccounts,
  removeSavedAccount as removeSavedAccountService,
} from '../features/auth/authService';
import { isFirebaseConfigured } from '../services/firebase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  isFirebaseReady: boolean;
  savedAccounts: SavedAccount[];
  login: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (credentials: AuthCredentials & { displayName?: string; photoURL?: string }) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  removeAccount: (email: string) => void;
  refreshAccounts: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(!isFirebaseConfigured);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);

  const refreshAccounts = () => {
    const list = getSavedAccounts();
    setSavedAccounts(list);
  };

  useEffect(() => {
    refreshAccounts();
    const unsubscribe = onAuthChange((currentUser, demoMode) => {
      setUser(currentUser);
      setIsDemo(demoMode);
      setLoading(false);
      refreshAccounts();
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const login = async (credentials: AuthCredentials) => {
    const result = await loginUser(credentials);
    if (result.success && result.user) {
      setUser(result.user);
      refreshAccounts();
    }
    return result;
  };

  const loginWithGoogle = async () => {
    const result = await signInWithGoogle();
    if (result.success && result.user) {
      setUser(result.user);
      refreshAccounts();
    }
    return result;
  };

  const register = async (credentials: AuthCredentials & { displayName?: string; photoURL?: string }) => {
    const result = await registerUser(credentials);
    if (result.success && result.user) {
      setUser(result.user);
      refreshAccounts();
    }
    return result;
  };

  const resetPassword = async (email: string) => {
    return await resetPasswordService(email);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    refreshAccounts();
  };

  const removeAccount = (email: string) => {
    const updated = removeSavedAccountService(email);
    setSavedAccounts(updated);
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        loading,
        isDemo,
        isFirebaseReady: isFirebaseConfigured,
        savedAccounts,
        login,
        loginWithGoogle,
        register,
        resetPassword,
        logout,
        removeAccount,
        refreshAccounts,
      },
    },
    children
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

