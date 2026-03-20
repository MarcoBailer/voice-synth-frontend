'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { SessionProvider } from 'next-auth/react';
import { User, CreditInfo } from '@/types';
import { voiceService } from '@/services/voiceService';

interface AuthContextType {
  user: User | null;
  credits: CreditInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | undefined;
  refreshCredits: () => Promise<void>;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [credits, setCredits] = useState<CreditInfo | null>(null);

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !session?.error;

  const user: User | null = isAuthenticated && session?.user
    ? {
        id: session.user.id ?? session.user.email ?? '',
        email: session.user.email ?? '',
        name: session.user.name ?? session.user.email?.split('@')[0] ?? '',
        credits: credits?.current ?? 0,
      }
    : null;

  const refreshCredits = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await voiceService.getCredits();
      setCredits(response);
    } catch {
      // Non-fatal — credits stay from previous fetch
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshCredits();
    } else {
      setCredits(null);
    }
  }, [isAuthenticated, refreshCredits]);

  const login = useCallback(() => {
    signIn('voice-cloner');
  }, []);

  const logout = useCallback(() => {
    signOut({ callbackUrl: '/' });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        credits,
        isLoading,
        isAuthenticated,
        accessToken: session?.accessToken,
        refreshCredits,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
