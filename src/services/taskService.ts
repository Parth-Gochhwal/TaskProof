import type { Task } from '../types/models';
import { apiClient } from './apiClient';

export const taskService = {
  async getAll(params?: { category?: string; difficulty?: string; q?: string }): Promise<Task[]> {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== 'all') searchParams.append('category', params.category);
    if (params?.difficulty) searchParams.append('difficulty', params.difficulty);
    if (params?.q) searchParams.append('q', params.q);
    
    const qs = searchParams.toString();
    const endpoint = qs ? `/tasks?${qs}` : '/tasks';
    return apiClient.get<Task[]>(endpoint);
  },

  async getById(id: string): Promise<Task | null> {
    try {
      return await apiClient.get<Task>(`/tasks/${id}`);
    } catch (e) {
      return null;
    }
  },

  async getByBusiness(): Promise<Task[]> {
    return apiClient.get<Task[]>('/business/tasks');
  },

  async search(query: string): Promise<Task[]> {
    return this.getAll({ q: query });
  },

  async filterByCategory(category: string): Promise<Task[]> {
    return this.getAll({ category });
  },

  async create(params: Omit<Task, 'id' | 'remainingSlots' | 'qualityScore' | 'createdAt' | 'status' | 'businessId'>): Promise<Task> {
    return apiClient.post<Task>('/tasks', params);
  },

  async update(taskId: string, patch: Partial<Task>): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${taskId}`, patch);
  },
};
