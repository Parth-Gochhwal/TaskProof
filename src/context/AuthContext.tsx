import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole, ContributorProfile, BusinessProfile } from '../types/models';
import {
  DEMO_CONTRIBUTOR_USER,
  DEMO_BUSINESS_USER,
  DEMO_CONTRIBUTOR_PROFILE,
  DEMO_BUSINESS_PROFILE,
} from '../data/seed';
import { RewardLedger } from '../services/ledgerService';

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  contributorProfile: ContributorProfile | null;
  businessProfile: BusinessProfile | null;
  balance: number;
  isAuthenticated: boolean;
  loginAsContributor: () => void;
  loginAsBusiness: () => void;
  logout: () => void;
  refreshBalance: () => void;
  updateContributorProfile: (patch: Partial<ContributorProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [contributorProfile, setContributorProfile] = useState<ContributorProfile | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [balance, setBalance] = useState(0);

  const loginAsContributor = useCallback(() => {
    setUser(DEMO_CONTRIBUTOR_USER);
    setRole('contributor');
    setContributorProfile(DEMO_CONTRIBUTOR_PROFILE);
    setBusinessProfile(null);
    setBalance(RewardLedger.getBalance(DEMO_CONTRIBUTOR_USER.id));
  }, []);

  const loginAsBusiness = useCallback(() => {
    setUser(DEMO_BUSINESS_USER);
    setRole('business');
    setContributorProfile(null);
    setBusinessProfile(DEMO_BUSINESS_PROFILE);
    setBalance(RewardLedger.getBalance(DEMO_BUSINESS_USER.id));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setRole(null);
    setContributorProfile(null);
    setBusinessProfile(null);
    setBalance(0);
  }, []);

  const refreshBalance = useCallback(() => {
    if (user) {
      setBalance(RewardLedger.getBalance(user.id));
    }
  }, [user]);

  const updateContributorProfile = useCallback((patch: Partial<ContributorProfile>) => {
    setContributorProfile(prev => prev ? { ...prev, ...patch } : null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      role,
      contributorProfile,
      businessProfile,
      balance,
      isAuthenticated: user !== null,
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
