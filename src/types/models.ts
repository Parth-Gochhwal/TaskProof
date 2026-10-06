// ============================
// Core Types & Models for TaskProof
// ============================

export type UserRole = 'contributor' | 'business';

export type TaskCategory =
  | 'data-labeling'
  | 'survey'
  | 'content-review'
  | 'research'
  | 'testing'
  | 'ai-evaluation'
  | 'custom';

export type TaskDifficulty = 'easy' | 'medium' | 'hard';

export type TaskStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'automated_check'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'rewarded';

export type TransactionType = 'task_reward' | 'task_funding' | 'platform_fee' | 'transfer';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

// ============================
// User & Profile
// ============================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface ContributorProfile {
  userId: string;
  username: string;
  bio?: string;
  college?: string;
  skills: string[];
  level: number;
  levelName: string;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  tasksCompleted: number;
  qualityScore: number;
  rating: number;
  totalEarned: number;
  badges: Badge[];
  walletAddress: string;
  joinedAt: string;
}

export interface BusinessProfile {
  userId: string;
  companyName: string;
  industry: string;
  website?: string;
  tasksCreated: number;
  totalSpent: number;
  approvalRate: number;
  joinedAt: string;
}

// ============================
// Task
// ============================

export interface TaskRequirement {
  id: string;
  description: string;
  type: 'instruction' | 'acceptance_criteria' | 'example';
}

export interface TaskInputField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'radio' | 'textarea' | 'rating' | 'checkbox';
  options?: string[];
  required: boolean;
  placeholder?: string;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  description: string;
  shortDescription: string;
  reward: number; // TCR
  estimatedMinutes: number;
  difficulty: TaskDifficulty;
  slots: number;
  remainingSlots: number;
  requirements: TaskRequirement[];
  inputFields: TaskInputField[];
  qualityScore: number;
  status: TaskStatus;
  businessId: string;
  businessName: string;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

// ============================
// Submission
// ============================

export interface AutomatedCheck {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
}

export interface Review {
  reviewerId: string;
  status: 'approved' | 'rejected';
  feedback?: string;
  reviewedAt: string;
}

export interface Submission {
  id: string;
  taskId: string;
  taskTitle: string;
  contributorId: string;
  contributorName: string;
  contributorLevel: number;
  data: Record<string, string | string[]>;
  status: SubmissionStatus;
  automatedChecks: AutomatedCheck[];
  review?: Review;
  reward?: number;
  transactionId?: string;
  submittedAt: string;
}

// ============================
// Wallet & Ledger
// ============================

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  direction: 'credit' | 'debit';
  label: string;
  taskId?: string;
  taskTitle?: string;
  submissionId?: string;
  status: TransactionStatus;
  proofHash?: string;
  network: string;
  timestamp: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  reserved: number;
  totalEarned: number;
  totalSpent: number;
  address: string;
  transactions: Transaction[];
}

// ============================
// Leaderboard
// ============================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  level: number;
  levelName: string;
  tasksCompleted: number;
  qualityScore: number;
  totalEarned: number;
  isCurrentUser?: boolean;
}

// ============================
// Badge & Achievement
// ============================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  earnedAt?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

// ============================
// Notification
// ============================

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'reward' | 'review' | 'system' | 'achievement';
  read: boolean;
  createdAt: string;
}

// ============================
// Analytics
// ============================

export interface BusinessAnalytics {
  tasksCreated: number;
  totalSubmissions: number;
  approved: number;
  rejected: number;
  underReview: number;
  completionRate: number;
  approvalRate: number;
  avgReviewTimeHours: number;
  avgReward: number;
  totalSpent: number;
  qualityScore: number;
  submissionsOverTime: { date: string; count: number }[];
  approvalRateOverTime: { date: string; rate: number }[];
}

// ============================
// Proof (Blockchain abstraction)
// ============================

export interface RewardProof {
  transactionId: string;
  taskId: string;
  submissionId: string;
  contributorId: string;
  businessId: string;
  reward: number;
  timestamp: string;
  proofHash: string;
  network: string;
  status: 'verified' | 'pending' | 'unavailable';
  blockNumber?: number;
}

// ============================
// Demo Session
// ============================

export interface DemoSession {
  role: UserRole;
  user: User;
  contributorProfile?: ContributorProfile;
  businessProfile?: BusinessProfile;
}
