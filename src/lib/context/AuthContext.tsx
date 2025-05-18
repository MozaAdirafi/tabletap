"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, UserCredential } from "firebase/auth";
import {
  loginWithEmail,
  registerWithEmail,
  logout as firebaseLogout,
  resetPassword as firebaseResetPassword,
  onAuthStateChange,
  signInWithGoogle,
  signInWithGoogleRedirect,
  handleRedirectResult,
} from "../firebase/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  loginWithGoogleRedirect: () => Promise<void>;
  register: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {
    throw new Error("login function not initialized");
  },
  loginWithGoogle: async () => {
    throw new Error("loginWithGoogle function not initialized");
  },
  loginWithGoogleRedirect: async () => {
    throw new Error("loginWithGoogleRedirect function not initialized");
  },
  register: async () => {
    throw new Error("register function not initialized");
  },
  logout: async () => {
    throw new Error("logout function not initialized");
  },
  resetPassword: async () => {
    throw new Error("resetPassword function not initialized");
  },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Check for redirect result when the component mounts
    const checkRedirectResult = async () => {
      try {
        const result = await handleRedirectResult();
        if (result) {
          // The signed-in user info
          setUser(result.user);
        }
      } catch (error) {
        console.error("Error handling redirect result:", error);
      }
    };

    checkRedirectResult();
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    return loginWithEmail(email, password);
  };

  const loginWithGoogle = async () => {
    return signInWithGoogle();
  };

  const loginWithGoogleRedirect = async () => {
    return signInWithGoogleRedirect();
  };

  const register = async (email: string, password: string) => {
    return registerWithEmail(email, password);
  };

  const logout = async () => {
    return firebaseLogout();
  };

  const resetPassword = async (email: string) => {
    return firebaseResetPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        loginWithGoogleRedirect,
        register,
        logout,
        resetPassword,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
