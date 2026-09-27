export type UserRole = 'CUSTOMER' | 'PERFORMER';

export type TaskStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'UNDER_REVIEW'
  | 'REVISION_REQUESTED'
  | 'COMPLETED'
  | 'ARBITRATION'
  | 'CANCELLED';

export type TaskCategory =
  | 'assistance'
  | 'copywriting'
  | 'design'
  | 'development'
  | 'marketing'
  | 'micro';

export type PerformerTier = 'level_1' | 'level_2' | 'level_3' | 'level_4' | 'level_5';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  activeRole: UserRole;
  balanceAvailable: number;
  balanceEscrow: number;
  createdAt: string;

  // Performer Specific
  performerTier: PerformerTier;
  performerXp: number;
  performerRating: number;
  performerReviewsCount: number;
  performerCompletedTasks: number;
  passedQualification: boolean;

  // Customer Specific
  customerRating: number;
  customerTotalSpent: number;
  customerTasksPosted: number;
}

export interface TaskRequirement {
  id: string;
  text: string;
  completed?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  reward: number; // What the performer receives
  platformFee: number; // Escrow commission
  totalBudget: number; // Total paid by client (reward + fee)
  timeLimitHours: number; // Allowed completion time once assigned
  deadline?: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  clientRating: number;
  clientHireRate: number; // e.g. 96%
  minLevelRequired: number; // 1 to 5
  requiredProofs: string[]; // e.g. ["Screenshot of confirmed account", "Profile URL link"]
  applicantsCount: number;
  assignedToId?: string;
  assignedToName?: string;
  assignedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface TaskBid {
  id: string;
  taskId: string;
  performerId: string;
  performerName: string;
  performerAvatar?: string;
  performerTier: PerformerTier;
  performerRating: number;
  performerCompletedCount: number;
  pitch: string;
  proposedHours: number;
  createdAt: string;
}

export interface TaskProofSubmission {
  id: string;
  taskId: string;
  performerId: string;
  reportText: string;
  proofUrls: string[];
  submittedAt: string;
  clientFeedback?: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'ESCROW_LOCK' | 'ESCROW_RELEASE' | 'REFUND' | 'COMMISSION';
  amount: number;
  currency: string;
  description: string;
  createdAt: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile;
        Insert: Partial<UserProfile>;
        Update: Partial<UserProfile>;
      };
      tasks: {
        Row: Task;
        Insert: Partial<Task>;
        Update: Partial<Task>;
      };
      bids: {
        Row: TaskBid;
        Insert: Partial<TaskBid>;
        Update: Partial<TaskBid>;
      };
      submissions: {
        Row: TaskProofSubmission;
        Insert: Partial<TaskProofSubmission>;
        Update: Partial<TaskProofSubmission>;
      };
      transactions: {
        Row: WalletTransaction;
        Insert: Partial<WalletTransaction>;
        Update: Partial<WalletTransaction>;
      };
    };
  };
}
