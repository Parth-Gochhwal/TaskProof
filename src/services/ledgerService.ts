/**
 * RewardLedger — Blockchain abstraction interface.
 * Currently implemented as a local mock.
 * Can be replaced with Hardhat/Solidity implementation without changing callers.
 */

import type { Transaction, RewardProof } from '../types/models';
import { DEMO_CONTRIBUTOR_WALLET, DEMO_BUSINESS_WALLET } from '../data/seed';

// In-memory ledger state (simulates on-chain state)
let contributorBalance = DEMO_CONTRIBUTOR_WALLET.balance;
let businessBalance = DEMO_BUSINESS_WALLET.balance;
let businessReserved = DEMO_BUSINESS_WALLET.reserved;

const transactionLog: Transaction[] = [...DEMO_CONTRIBUTOR_WALLET.transactions];
const proofRegistry: Map<string, RewardProof> = new Map();

function generateHash(): string {
  return '0x' + Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('') + '...';
}

function generateTxId(): string {
  return 'tx-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}

export const RewardLedger = {
  /**
   * Get current balance for a user
   */
  getBalance(userId: string): number {
    if (userId === 'user-contributor-demo') return contributorBalance;
    if (userId === 'user-business-demo') return businessBalance;
    return 0;
  },

  /**
   * Reserve funds from business budget before task runs
   */
  reserveReward(businessId: string, amount: number): { success: boolean; error?: string } {
    if (businessId !== 'user-business-demo') return { success: false, error: 'Unknown business' };
    if (businessBalance < amount) return { success: false, error: 'Insufficient balance' };
    businessBalance -= amount;
    businessReserved += amount;
    return { success: true };
  },

  /**
   * Release reserved reward to contributor after approval
   */
  releaseReward(params: {
    taskId: string;
    submissionId: string;
    contributorId: string;
    businessId: string;
    amount: number;
    taskTitle: string;
  }): { success: boolean; transactionId?: string; proofHash?: string; error?: string } {
    const { taskId, submissionId, contributorId, amount, taskTitle } = params;

    if (businessReserved < amount) {
      // Try direct balance if not reserved
      if (businessBalance < amount) {
        return { success: false, error: 'Insufficient reserved funds' };
      }
      businessBalance -= amount;
    } else {
      businessReserved -= amount;
    }

    if (contributorId === 'user-contributor-demo') {
      contributorBalance += amount;
    }

    const txId = generateTxId();
    const proofHash = generateHash();
    const timestamp = new Date().toISOString();

    const tx: Transaction = {
      id: txId,
      type: 'task_reward',
      amount,
      direction: 'credit',
      label: 'Task Reward',
      taskId,
      taskTitle,
      submissionId,
      status: 'confirmed',
      proofHash,
      network: 'TaskProof Local Network',
      timestamp,
    };

    transactionLog.unshift(tx);

    const proof: RewardProof = {
      transactionId: txId,
      taskId,
      submissionId,
      contributorId,
      businessId: params.businessId,
      reward: amount,
      timestamp,
      proofHash,
      network: 'TaskProof Local Network',
      status: 'verified',
      blockNumber: Math.floor(Math.random() * 1000000) + 500000,
    };

    proofRegistry.set(txId, proof);

    return { success: true, transactionId: txId, proofHash };
  },

  /**
   * Get full transaction history for a user
   */
  getTransactionHistory(_userId: string): Transaction[] {
    return [...transactionLog];
  },

  /**
   * Get proof for a specific transaction
   */
  getProof(transactionId: string): RewardProof | null {
    return proofRegistry.get(transactionId) || null;
  },

  /**
   * Verify that a transaction is valid
   */
  verifyTransaction(transactionId: string): { verified: boolean; proof?: RewardProof } {
    const proof = proofRegistry.get(transactionId);
    if (!proof) return { verified: false };
    return { verified: proof.status === 'verified', proof };
  },

  /**
   * Get business reserved amount
   */
  getReserved(_businessId: string): number {
    return businessReserved;
  },
};
