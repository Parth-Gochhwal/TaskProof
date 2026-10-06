import type { Task } from '../types/models';
import { SEED_TASKS } from '../data/seed';

let tasks: Task[] = [...SEED_TASKS];

export const taskService = {
  getAll(): Task[] {
    return tasks.filter(t => t.status === 'active');
  },

  getById(id: string): Task | null {
    return tasks.find(t => t.id === id) || null;
  },

  getByBusiness(businessId: string): Task[] {
    return tasks.filter(t => t.businessId === businessId);
  },

  search(query: string): Task[] {
    const q = query.toLowerCase();
    return tasks.filter(t =>
      t.status === 'active' &&
      (t.title.toLowerCase().includes(q) ||
        t.category.includes(q) ||
        t.tags.some(tag => tag.includes(q)) ||
        t.description.toLowerCase().includes(q))
    );
  },

  filterByCategory(category: string): Task[] {
    if (category === 'all') return tasks.filter(t => t.status === 'active');
    return tasks.filter(t => t.status === 'active' && t.category === category);
  },

  create(params: Omit<Task, 'id' | 'remainingSlots' | 'qualityScore' | 'createdAt'>): Task {
    const task: Task = {
      ...params,
      id: 'task-' + Date.now().toString(36),
      remainingSlots: params.slots,
      qualityScore: 0,
      createdAt: new Date().toISOString(),
    };
    tasks = [task, ...tasks];
    return task;
  },

  decrementSlot(taskId: string): void {
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx !== -1 && tasks[idx].remainingSlots > 0) {
      tasks[idx] = { ...tasks[idx], remainingSlots: tasks[idx].remainingSlots - 1 };
    }
  },

  update(taskId: string, patch: Partial<Task>): void {
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...patch };
    }
  },
};
