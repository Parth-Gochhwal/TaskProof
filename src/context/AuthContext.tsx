import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, UserRole, ContributorProfile, BusinessProfile } from '../types/models';
import { apiClient } from '../services/apiClient';
import { RewardLedger } from '../services/ledgerService';

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  contributorProfile: ContributorProfile | null;
  businessProfile: BusinessProfile | null;
  balance: number;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsContributor: () => Promise<void>;
  loginAsBusiness: () => Promise<void>;
  logout: () => void;
  refreshBalance: () => Promise<void>;
  updateContributorProfile: (patch: Partial<ContributorProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [contributorProfile, setContributorProfile] = useState<ContributorProfile | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (currentRole: UserRole) => {
    try {
      const profile = await apiClient.get<any>('/users/me/profile');
      if (currentRole === 'contributor') {
        setContributorProfile(profile as ContributorProfile);
      } else {
        setBusinessProfile(profile as BusinessProfile);
      }
    } catch (e) {
      console.error("Failed to fetch profile", e);
    }
  };

  const refreshBalance = useCallback(async () => {
    try {
      const wallet = await RewardLedger.getWallet();
      setBalance(wallet.balance || 0);
    } catch (e) {
      console.error("Failed to fetch balance", e);
    }
  }, []);

  const handleAuthSuccess = async (res: any) => {
    if (res.token) {
      apiClient.setToken(res.token);
    }
    const newUser: User = {
      id: res.userId,
      email: res.email,
      name: res.name,
      role: res.role as UserRole,
      avatar: res.avatar,
      createdAt: new Date().toISOString(), // Fallback if missing
    };
    setUser(newUser);
    setRole(res.role as UserRole);
    
    await fetchProfile(res.role as UserRole);
    await refreshBalance();
  };

  useEffect(() => {
    // Check initial auth state
    const initAuth = async () => {
      if (!apiClient.getToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await apiClient.get<any>('/auth/me');
        await handleAuthSuccess(me);
      } catch (e) {
        apiClient.setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [refreshBalance]);

  const loginAsContributor = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.post<any>('/auth/demo/contributor');
      await handleAuthSuccess(res);
    } finally {
      setIsLoading(false);
    }
  }, [refreshBalance]);

  const loginAsBusiness = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.post<any>('/auth/demo/business');
      await handleAuthSuccess(res);
    } finally {
      setIsLoading(false);
    }
  }, [refreshBalance]);

  const logout = useCallback(() => {
    apiClient.setToken(null);
    setUser(null);
    setRole(null);
    setContributorProfile(null);
    setBusinessProfile(null);
    setBalance(0);
  }, []);

  const updateContributorProfile = useCallback(async (patch: Partial<ContributorProfile>) => {
    try {
      const updated = await apiClient.patch<ContributorProfile>('/users/me/profile', patch);
      setContributorProfile(updated);
    } catch (e) {
      console.error("Failed to update profile", e);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      role,
      contributorProfile,
      businessProfile,
      balance,
      isAuthenticated: user !== null,
      isLoading,
      loginAsContributor,
      loginAsBusiness,
      logout,
      refreshBalance,
      updateContributorProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
