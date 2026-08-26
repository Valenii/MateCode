import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile, AuthCredentials } from '../types/user';
import {
  registerUser,
  loginUser,
  logoutUser,
  onAuthChange,
} from '../features/auth/authService';
import { isFirebaseConfigured } from '../services/firebase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  isFirebaseReady: boolean;
  login: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: AuthCredentials & { displayName?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(!isFirebaseConfigured);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser, demoMode) => {
      setUser(currentUser);
      setIsDemo(demoMode);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const login = async (credentials: AuthCredentials) => {
    setLoading(true);
    const result = await loginUser(credentials);
    if (result.success && result.user) {
      setUser(result.user);
    }
    setLoading(false);
    return result;
  };

  const register = async (credentials: AuthCredentials & { displayName?: string }) => {
    setLoading(true);
    const result = await registerUser(credentials);
    if (result.success && result.user) {
      setUser(result.user);
    }
    setLoading(false);
    return result;
  };

  const logout = async () => {
    setLoading(true);
    await logoutUser();
    setUser(null);
    setLoading(false);
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        loading,
        isDemo,
        isFirebaseReady: isFirebaseConfigured,
        login,
        register,
        logout,
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
