import type { Submission, AutomatedCheck, SubmissionStatus } from '../types/models';
import { SEED_SUBMISSIONS } from '../data/seed';
import { RewardLedger } from './ledgerService';

// In-memory store
let submissions: Submission[] = [...SEED_SUBMISSIONS];

export const submissionService = {
  getAll(): Submission[] {
    return submissions;
  },

  getByContributor(contributorId: string): Submission[] {
    return submissions.filter(s => s.contributorId === contributorId);
  },

  getByTask(taskId: string): Submission[] {
    return submissions.filter(s => s.taskId === taskId);
  },

  getForBusiness(_businessId: string, taskIds: string[]): Submission[] {
    return submissions.filter(s => taskIds.includes(s.taskId));
  },

  getById(id: string): Submission | null {
    return submissions.find(s => s.id === id) || null;
  },

  create(params: {
    taskId: string;
    taskTitle: string;
    contributorId: string;
    contributorName: string;
    contributorLevel: number;
    data: Record<string, string | string[]>;
  }): Submission {
    // Run automated checks
    const automatedChecks: AutomatedCheck[] = runAutomatedChecks(params.data);
    const allPassed = automatedChecks.every(c => c.passed);

    const submission: Submission = {
      id: 'sub-' + Date.now().toString(36),
      taskId: params.taskId,
      taskTitle: params.taskTitle,
      contributorId: params.contributorId,
      contributorName: params.contributorName,
      contributorLevel: params.contributorLevel,
      data: params.data,
      status: allPassed ? 'under_review' : 'submitted',
      automatedChecks,
      submittedAt: new Date().toISOString(),
    };

    submissions = [submission, ...submissions];
    return submission;
  },

  approve(submissionId: string, reviewerId: string, feedback?: string): { success: boolean; error?: string } {
    const idx = submissions.findIndex(s => s.id === submissionId);
    if (idx === -1) return { success: false, error: 'Submission not found' };

    const sub = submissions[idx];
    if (sub.status !== 'under_review') return { success: false, error: 'Cannot approve — not under review' };

    // Find task reward (use 50 TCR default for demo)
    const reward = 50; // In real app, look up from task

    const result = RewardLedger.releaseReward({
      taskId: sub.taskId,
      submissionId: sub.id,
      contributorId: sub.contributorId,
      businessId: reviewerId,
      amount: reward,
      taskTitle: sub.taskTitle,
    });

    if (!result.success) return { success: false, error: result.error };

    submissions[idx] = {
      ...sub,
      status: 'rewarded',
      reward,
      transactionId: result.transactionId,
      review: {
        reviewerId,
        status: 'approved',
        feedback,
        reviewedAt: new Date().toISOString(),
      },
    };

    return { success: true };
  },

  reject(submissionId: string, reviewerId: string, feedback: string): { success: boolean; error?: string } {
    const idx = submissions.findIndex(s => s.id === submissionId);
    if (idx === -1) return { success: false, error: 'Submission not found' };

    const sub = submissions[idx];
    if (sub.status !== 'under_review') return { success: false, error: 'Cannot reject — not under review' };

    submissions[idx] = {
      ...sub,
      status: 'rejected',
      review: {
        reviewerId,
        status: 'rejected',
        feedback,
        reviewedAt: new Date().toISOString(),
      },
    };

    return { success: true };
  },

  updateStatus(submissionId: string, status: SubmissionStatus): void {
    const idx = submissions.findIndex(s => s.id === submissionId);
    if (idx !== -1) {
      submissions[idx] = { ...submissions[idx], status };
    }
  },
};

function runAutomatedChecks(data: Record<string, string | string[]>): AutomatedCheck[] {
  const checks: AutomatedCheck[] = [];

  // Check 1: Required fields
  const hasEmpty = Object.values(data).some(v =>
    v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0)
  );
  checks.push({
    id: 'ac-required',
    label: 'Required fields complete',
    passed: !hasEmpty,
    detail: hasEmpty ? 'Some required fields are empty.' : undefined,
  });

  // Check 2: Duplicate (simplified — always passes in demo)
  checks.push({ id: 'ac-dup', label: 'No duplicate detected', passed: true });

  // Check 3: Format valid
  checks.push({ id: 'ac-format', label: 'Format valid', passed: true });

  // Check 4: Task constraints
  checks.push({ id: 'ac-constraints', label: 'Task constraints satisfied', passed: !hasEmpty });

  return checks;
}
