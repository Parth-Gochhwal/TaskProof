import type { Transaction, RewardProof } from '../types/models';
import { apiClient } from './apiClient';

export interface WalletData {
  userId: string;
  balance: number;
  reserved: number;
  totalEarned: number;
  totalSpent: number;
  address: string;
  transactions: Transaction[];
}

export const RewardLedger = {
  async getWallet(): Promise<WalletData> {
    try {
      return await apiClient.get<WalletData>('/wallet');
    } catch {
      return { userId: '', balance: 0, reserved: 0, totalEarned: 0, totalSpent: 0, address: '', transactions: [] };
    }
  },

  async getTransactionHistory(): Promise<Transaction[]> {
    return apiClient.get<Transaction[]>('/wallet/transactions');
  },

  async getProof(transactionId: string): Promise<RewardProof | null> {
    try {
      return await apiClient.get<RewardProof>(`/wallet/transactions/${transactionId}/proof`);
    } catch {
      return null;
    }
  },

  async verifyTransaction(transactionId: string): Promise<{ verified: boolean; proof?: RewardProof }> {
    const proof = await this.getProof(transactionId);
    if (!proof) return { verified: false };
    return { verified: proof.status === 'verified', proof };
  }
};
