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

export interface UserPortfolioItem {
  id: string;
  title: string;
  description: string;
  category: TaskCategory | string;
  imageUrl?: string;
  linkUrl?: string;
  completedAt?: string;
}

export interface UserLanguage {
  language: string;
  level: 'native' | 'fluent' | 'intermediate';
}

export interface UserCertification {
  id: string;
  title: string;
  score: number;
  passedAt: string;
  category: string;
}

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
  hasActiveSubscription?: boolean;
  subscriptionExpiresAt?: string;
  freeTasksRemaining?: number;

  // Worker Extended Profile (Tâches.ma Verified Performer)
  headline?: string;
  bio?: string;
  city?: string;
  phone?: string;
  whatsappEnabled?: boolean;
  cin?: string;
  cinVerified?: boolean;
  cinDocumentFrontUrl?: string;
  cinDocumentBackUrl?: string;
  kycStatus?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  kycSubmittedAt?: string;
  kycRejectionReason?: string;
  languages?: UserLanguage[];
  skills?: string[];
  specializedCategories?: string[];
  minTaskReward?: number;
  isAvailableForHire?: boolean;

  // Banking & Payout (Morocco)
  bankName?: string;
  bankRib?: string;
  bankAccountHolder?: string;

  // Portfolio & Certs
  portfolio?: UserPortfolioItem[];
  certifications?: UserCertification[];

  // Notification Preferences
  notifyWhatsapp?: boolean;
  notifyEmail?: boolean;

  // Customer Specific
  customerRating: number;
  customerTotalSpent: number;
  customerTasksPosted: number;

  // Admin Role
  isAdmin?: boolean;
}

export interface KycSubmissionItem {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  cin?: string;
  cinDocumentFrontUrl?: string;
  cinDocumentBackUrl?: string;
  kycStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  kycSubmittedAt?: string;
  kycRejectionReason?: string;
  avatarUrl?: string;
  performerTier?: string;
  createdAt?: string;
}

export interface TaskMessage {
  id: string;
  taskId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId?: string;
  content: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface TaskReview {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  targetUserId: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
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
  category?: TaskCategory | string;
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
  subCategory?: string;
  locationMode?: 'online' | 'in_person';
  city?: string;
  taskMode?: 'single' | 'multi';
  targetExecutionsCount?: number;
  unitPriceDH?: number;
  antiSpamKeyword?: string;
  executionsApprovedCount?: number;
  executionsReservedCount?: number;
  referenceLinks?: string[];
  verificationQuestion?: string;
  applicantsCount: number;
  assignedToId?: string;
  assignedToName?: string;
  assignedAt?: string;
  completedAt?: string;
  settlementProposal?: {
    percentage: number;
    amountDH: number;
    reason: string;
    proposedBy: 'CUSTOMER' | 'PERFORMER';
    rating?: number;
    reviewComment?: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
  };
  finalPayoutPercentage?: number;
  finalPerformerAmountDH?: number;
  finalClientRefundDH?: number;
  submission?: TaskProofSubmission;
  createdAt: string;
}

export type SubscriptionPlanType = '1_MONTH' | '3_MONTHS' | '1_YEAR';

export interface PerformerSubscription {
  id: string;
  userId: string;
  planType: SubscriptionPlanType;
  startsAt: string;
  expiresAt: string;
  amountPaidDH: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
}

export type ExecutionStatus = 'RESERVED' | 'SUBMITTED' | 'APPROVED' | 'REWORK_REQUESTED' | 'REJECTED' | 'EXPIRED';

export interface TaskExecution {
  id: string;
  taskId: string;
  performerId: string;
  performerName?: string;
  performerAvatar?: string;
  performerRating?: number;
  status: ExecutionStatus;
  reservedAt: string;
  reservedUntil: string;
  submittedAt?: string;
  reportText?: string;
  proofUrls?: string[];
  antiSpamEntered?: string;
  clientFeedback?: string;
  reviewedAt?: string;
  unitRewardDH: number;
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
  isVerified?: boolean;
  isOwnBid?: boolean;
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
      messages: {
        Row: TaskMessage;
        Insert: Partial<TaskMessage>;
        Update: Partial<TaskMessage>;
      };
      reviews: {
        Row: TaskReview;
        Insert: Partial<TaskReview>;
        Update: Partial<TaskReview>;
      };
      transactions: {
        Row: WalletTransaction;
        Insert: Partial<WalletTransaction>;
        Update: Partial<WalletTransaction>;
      };
    };
  };
}

