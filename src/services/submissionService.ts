import type { Submission } from '../types/models';
import { apiClient } from './apiClient';

export const submissionService = {
  async getMine(): Promise<Submission[]> {
    return apiClient.get<Submission[]>('/submissions/mine');
  },

  async getForBusiness(): Promise<Submission[]> {
    return apiClient.get<Submission[]>('/submissions');
  },

  async getById(id: string): Promise<Submission | null> {
    try {
      return await apiClient.get<Submission>(`/submissions/${id}`);
    } catch {
      return null;
    }
  },

  async create(taskId: string, data: Record<string, string | string[]>): Promise<Submission> {
    return apiClient.post<Submission>(`/tasks/${taskId}/submissions`, { data });
  },

  async approve(submissionId: string, feedback?: string): Promise<{ success: boolean; reward?: number; transactionId?: string; proofHash?: string; error?: string }> {
    try {
      const res = await apiClient.post<any>(`/submissions/${submissionId}/approve`, { feedback });
      return { 
        success: true, 
        reward: res.reward, 
        transactionId: res.transaction_id, 
        proofHash: res.proof_hash 
      };
    } catch (e: any) {
      return { success: false, error: e.message || 'Approval failed' };
    }
  },

  async reject(submissionId: string, feedback: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiClient.post<any>(`/submissions/${submissionId}/reject`, { feedback });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Rejection failed' };
    }
  }
};
