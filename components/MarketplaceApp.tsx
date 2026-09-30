'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getLocalizedTask } from '@/lib/mockData';
import { Task, UserProfile, UserRole, WalletTransaction } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Locale } from '@/lib/i18n/types';
import { getTaskSlug, extractTaskIdFromSlug } from '@/lib/slug';
import {
  fetchDynamicTasks,
  fetchDynamicTaskById,
  createDynamicTask,
  updateDynamicTask,
  submitDynamicProof,
  fetchDynamicTransactions,
  recordDynamicTransaction,
  executeDynamicDeposit,
  executeDynamicWithdrawal
} from '@/lib/supabaseService';
import {
  PLATFORM_PERFORMER_COMMISSION_RATE,
  MAD_TO_EUR_RATE
} from '@/lib/payoutService';
import { Header } from '@/components/Header';
import { TaskCard } from '@/components/TaskCard';
import { TaskMiniCard } from '@/components/TaskMiniCard';
import { TaskRow } from '@/components/TaskRow';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { ProofSubmissionDrawer } from '@/components/ProofSubmissionDrawer';
import { WalletModal } from '@/components/WalletModal';
import { WalletPageContent } from '@/components/WalletPageContent';
import { QualificationModal } from '@/components/QualificationModal';
import { TaskExamplesPage } from '@/components/TaskExamplesPage';
import { TaskExample } from '@/lib/taskExamplesData';
import { ConceptExplainerPage } from '@/components/ConceptExplainerPage';
import { ProfilePageContent } from '@/components/ProfilePageContent';
import { FloatingMessengerWidget } from '@/components/FloatingMessengerWidget';
import { WorkzillaTaskTabs, WorkzillaTab } from '@/components/WorkzillaTaskTabs';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import {
  WorkzillaHero,
  WorkzillaProofBar,
  WorkzillaCategoryGrid,
  WorkzillaHowItWorks,
  WorkzillaTrustSection,
  WorkzillaCompletedFeed,
  WorkzillaHelpCenter,
  WorkzillaFooter
} from '@/components/WorkzillaLandingSections';
import { useAuth } from '@/lib/auth/AuthContext';

import {
  FiSearch,
  FiShield,
  FiClock,
  FiPlus,
  FiCheck,
  FiRefreshCw,
  FiArrowRight,
  FiArrowLeft,
  FiLock,
  FiUser,
  FiList,
  FiGrid,
  FiMessageSquare
} from 'react-icons/fi';

interface MarketplaceAppProps {
  forcedLocale?: Locale;
  initialSlug?: string;
  initialTaskId?: string;
  viewMode?: 'home' | 'tasks' | 'wallet' | 'concepts' | 'profile';
}

function MarketplaceAppContent({ forcedLocale, initialSlug, initialTaskId, viewMode = 'home' }: MarketplaceAppProps) {
  const { t, locale, isRTL, getCategoryLabel } = useLanguage();
  const {
    isAuthenticated,
    profile,
    user: authUser,
    loading: authLoading,
    openAuthModal,
    updateProfile,
    toggleRole,
  } = useAuth();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const defaultGuestUser: UserProfile = {
    id: 'guest',
    email: 'contact@taches.ma',
    fullName: 'Utilisateur Tâches.ma',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
    activeRole: 'PERFORMER',
    balanceAvailable: 0,
    balanceEscrow: 0,
    isAdmin: false,
    performerTier: 'level_1',
    performerXp: 0,
    performerRating: 5.0,
    performerReviewsCount: 0,
    performerCompletedTasks: 0,
    passedQualification: false,
    customerRating: 5.0,
    customerTotalSpent: 0,
    customerTasksPosted: 0,
    createdAt: new Date().toISOString(),
  };

  // Active User Profile (Supabase Auth profile or guest fallback)
  const user: UserProfile = profile || defaultGuestUser;
  const isCustomer = user.activeRole === 'CUSTOMER';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);

  // Floating Chat Widget State
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState<boolean>(false);
  const [chatActiveTaskId, setChatActiveTaskId] = useState<string | null>(null);

  // Work-zilla Pre-filled Task Input State
  const [prefillTaskTitle, setPrefillTaskTitle] = useState<string>('');
  const [prefillTaskDesc, setPrefillTaskDesc] = useState<string>('');
  const [prefillTaskBudget, setPrefillTaskBudget] = useState<number | undefined>(undefined);
  const [prefillTaskCategory, setPrefillTaskCategory] = useState<string | undefined>(undefined);

  // Copy Task Example handler
  const handleCopyTaskExample = (example: TaskExample) => {
    const title = example.title[locale] || example.title.fr;
    const description = example.description[locale] || example.description.fr;
    const budget = example.priceDH;
    const cat = example.category;
    const city = example.city || '';
    const params = new URLSearchParams({
      title,
      description,
      category: cat,
      budget: budget.toString(),
      ...(city ? { city } : {}),
    });
    router.push(`/${locale}/tasks/new?${params.toString()}`);
  };

  // View & Filter State: default to 'live' so users see real tasks immediately on /tasks
  const tabParam = searchParams.get('tab');
  const activeTab = (tabParam as 'examples' | 'live' | 'explore' | 'my-tasks' | 'new' | 'open' | 'history') || 'live';
  const [workzillaSubTab, setWorkzillaSubTab] = useState<WorkzillaTab>('new');

  // Synchronize sub-tab from query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'open') {
      setWorkzillaSubTab('open');
    } else if (tab === 'history') {
      setWorkzillaSubTab('history');
    } else if (tab === 'my-tasks') {
      setWorkzillaSubTab(isCustomer ? 'new' : 'open');
    } else if (tab === 'new' || tab === 'live' || tab === 'explore' || !tab) {
      setWorkzillaSubTab('new');
    }
  }, [searchParams, isCustomer]);

  const [viewLayout, setViewLayout] = useState<'list' | 'grid'>('list');
  const [myTasksStatusFilter, setMyTasksStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'under_review' | 'completed'>('all');
  const [filterUrgent, setFilterUrgent] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categories = ['all', 'development', 'design', 'assistance', 'copywriting', 'marketing', 'micro'] as const;

  // Extract task ID from URL path e.g. /fr/task/title-timestamp or from query param ?task=...
  const pathSlug = useMemo(() => {
    if (initialSlug) return initialSlug;
    if (pathname && pathname.includes('/task/')) {
      return pathname.split('/task/')[1];
    }
    return null;
  }, [pathname, initialSlug]);

  const selectedTaskId = useMemo(() => {
    if (pathSlug) {
      const extracted = extractTaskIdFromSlug(pathSlug, tasks);
      if (extracted) return extracted;
    }
    if (initialTaskId) return initialTaskId;
    return searchParams.get('task') || searchParams.get('taskId') || null;
  }, [pathSlug, tasks, initialTaskId, searchParams]);

  // Modal State from Query Parameters
  const isCreateModalOpen = searchParams.get('create') === 'true';
  const proofTaskId = searchParams.get('proof') || null;
  const isWalletOpen = searchParams.get('wallet') === 'true';
  const isQualificationOpen = searchParams.get('test') === 'true';

  // Guard ?create=true if not authenticated
  useEffect(() => {
    if (isCreateModalOpen && !isAuthenticated && !authLoading) {
      updateQuery({ create: null });
      openAuthModal('login', 'Connectez-vous pour publier une tâche');
    }
  }, [isCreateModalOpen, isAuthenticated, authLoading]);

  // Redirect ?create=true or ?action=create to dedicated standalone tasks/new page
  useEffect(() => {
    if (searchParams.get('create') === 'true' || searchParams.get('action') === 'create') {
      router.push(`/${locale}/tasks/new`);
    }
  }, [searchParams, locale, router]);

  // If ?wallet=true query param is present and not on wallet page, redirect smoothly to dedicated page
  useEffect(() => {
    if (isWalletOpen && viewMode !== 'wallet') {
      router.push(`/${locale}/wallet`);
    }
  }, [isWalletOpen, viewMode, locale, router]);

  // Feedback Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Helper to update query parameters smoothly
  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    router.push(`${pathname}${query}`, { scroll: false });
  };

  // Direct Post from Hero
  const handleDirectHeroPost = (title: string) => {
    router.push(`/${locale}/tasks/new?title=${encodeURIComponent(title)}`);
  };

  const handleOpenCreateTask = () => {
    router.push(`/${locale}/tasks/new`);
  };

  // Open Chat for specific task
  const handleOpenChatForTask = (task: Task) => {
    setChatActiveTaskId(task.id);
    setIsChatWidgetOpen(true);
  };

  // Navigate to task details modal route: /:locale/task/:slug
  const handleOpenTask = (task: Task) => {
    const slug = getTaskSlug(task);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    router.push(`/${locale}/task/${slug}${query}`, { scroll: false });
  };

  // Close task details modal route back to /:locale or /:locale/tasks
  const handleCloseTask = () => {
    if (pathname && pathname.includes('/task/')) {
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      if (viewMode === 'tasks') {
        router.push(`/${locale}/tasks${query}`, { scroll: false });
      } else {
        router.push(`/${locale}${query}`, { scroll: false });
      }
    } else {
      updateQuery({ task: null, taskId: null });
    }
  };

  // Initial Dynamic Fetch from Supabase
  const loadSupabaseData = async () => {
    setIsSyncing(true);
    try {
      const res = await fetchDynamicTasks();
      if (res.tasks && Array.isArray(res.tasks)) {
        setTasks(res.tasks);
      }
      const txs = await fetchDynamicTransactions(profile?.id);
      if (Array.isArray(txs)) {
        setTransactions(txs);
      }
    } catch (err) {
      console.error('Supabase fetch failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadSupabaseData();
  }, []);

  // Fetch individual task dynamically if navigating directly to a task slug / ID
  useEffect(() => {
    if (selectedTaskId && !tasks.find(t => t.id === selectedTaskId)) {
      fetchDynamicTaskById(selectedTaskId).then((task) => {
        if (task) {
          setTasks((prev) => {
            if (prev.find((t) => t.id === task.id)) return prev;
            return [task, ...prev];
          });
        }
      });
    }
  }, [selectedTaskId, tasks]);

  // Handlers for Task Lifecycle
  const handleRoleToggle = async (role: UserRole) => {
    await toggleRole(role);
    showToast(role === 'CUSTOMER' ? t('toastRoleCustomer') : t('toastRolePerformer'));
  };

  const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'applicantsCount' | 'createdAt'>) => {
    if (!isAuthenticated || !profile) {
      openAuthModal('login', 'Connectez-vous pour publier une tâche');
      return;
    }

    const newId = `tsk_${Date.now()}`;
    const newTask: Task = {
      ...newTaskData,
      id: newId,
      clientId: profile.id,
      clientName: `${profile.fullName} (Vous)`,
      clientAvatar: profile.avatarUrl,
      applicantsCount: 0,
      createdAt: t('justNow'),
    };

    // Optimistic UI Update
    setTasks(prev => [newTask, ...prev]);

    // Deduct escrow balance
    await updateProfile({
      customerTasksPosted: (profile.customerTasksPosted || 0) + 1,
      balanceEscrow: (profile.balanceEscrow || 0) + newTaskData.totalBudget,
      balanceAvailable: Math.max(0, (profile.balanceAvailable || 0) - newTaskData.totalBudget),
    });

    // Record Escrow lock transaction
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: profile.id,
      type: 'ESCROW_LOCK',
      amount: newTaskData.totalBudget,
      currency: 'EUR',
      description: `${t('escrowLockedTooltip')} #${newId} "${newTaskData.title.slice(0, 30)}..."`,
      createdAt: t('justNow'),
      status: 'COMPLETED',
    };
    setTransactions(prev => [newTx, ...prev]);

    showToast(t('toastTaskCreated', { amount: Math.round(newTaskData.totalBudget * 10) }));

    // Supabase Persistence
    const res = await createDynamicTask(newTask);
    if (res.task) {
      setTasks(prev => prev.map(t => t.id === newId ? res.task! : t));
    }

    await recordDynamicTransaction({
      userId: profile.id,
      type: 'ESCROW_LOCK',
      amount: newTaskData.totalBudget,
      currency: 'EUR',
      description: newTx.description,
      status: 'COMPLETED',
    });
  };

  const handleApply = async (taskId: string, pitch: string) => {
    if (!isAuthenticated || !profile) {
      openAuthModal('login', 'Connectez-vous pour postuler à cette tâche');
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Check if qualification passed
    if (!profile.passedQualification) {
      updateQuery({ test: 'true' });
      return;
    }

    // Increment applicants count
    const updated: Task = {
      ...task,
      applicantsCount: (task.applicantsCount || 0) + 1,
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    showToast(t('toastApplied'));

    // Record bid in backend
    try {
      await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          performerId: profile.id,
          pitch,
          proposedHours: task.timeLimitHours || 24,
        }),
      });
    } catch (err) {
      console.warn('Bid post error:', err);
    }
  };

  const handleAssignPerformer = async (taskId: string, performerId: string, performerName: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const assignedAt = new Date().toISOString();
    const updated: Task = {
      ...task,
      status: 'IN_PROGRESS',
      assignedToId: performerId,
      assignedToName: performerName,
      assignedAt,
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    showToast(`Prestataire ${performerName} assigné avec succès !`);

    // Supabase Persistence
    await updateDynamicTask(taskId, {
      status: 'IN_PROGRESS',
      assignedToId: performerId,
      assignedToName: performerName,
      assignedAt,
    });
  };

  const handleCancelTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated: Task = {
      ...task,
      status: 'CANCELLED',
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));

    // Refund escrow amount back to available balance
    if (profile) {
      await updateProfile({
        balanceEscrow: Math.max(0, (profile.balanceEscrow || 0) - task.totalBudget),
        balanceAvailable: (profile.balanceAvailable || 0) + task.totalBudget,
      });

      const refundTx: WalletTransaction = {
        id: `tx_${Date.now()}`,
        userId: profile.id,
        type: 'REFUND',
        amount: task.totalBudget,
        currency: 'EUR',
        description: `Remboursement séquestre commande annulée #${taskId.slice(0, 8)} (${Math.round(task.totalBudget * 10)} DH)`,
        createdAt: t('justNow'),
        status: 'COMPLETED',
      };
      setTransactions(prev => [refundTx, ...prev]);

      await recordDynamicTransaction({
        userId: profile.id,
        type: 'REFUND',
        amount: task.totalBudget,
        currency: 'EUR',
        description: refundTx.description,
        status: 'COMPLETED',
      });
    }

    showToast(`Commande annulée : ${Math.round(task.totalBudget * 10)} DH restitués à votre solde disponible.`);
    await updateDynamicTask(taskId, { status: 'CANCELLED' });
  };

  const handleRequestArbitration = async (taskId: string, reason: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated: Task = {
      ...task,
      status: 'ARBITRATION',
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    showToast('Demande d’arbitrage transmise aux modérateurs Tâches.ma.');

    await updateDynamicTask(taskId, { status: 'ARBITRATION' });

    if (profile) {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          senderId: profile.id,
          senderName: profile.fullName || 'Utilisateur',
          senderAvatar: profile.avatarUrl || '',
          content: `⚖️ Litige ouvert en arbitrage. Motif : ${reason}`,
        }),
      });
    }
  };

  const handleRequestRevision = async (taskId: string, feedback: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated: Task = {
      ...task,
      status: 'REVISION_REQUESTED',
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    showToast('Demande de retouche transmise au freelance.');

    await updateDynamicTask(taskId, { status: 'REVISION_REQUESTED' });

    // Send revision feedback message into task chat
    if (profile) {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          senderId: profile.id,
          senderName: profile.fullName || 'Client',
          senderAvatar: profile.avatarUrl || '',
          content: `⚠️ Demande de retouche : ${feedback}`,
        }),
      });
    }
  };

  const handleSubmitProof = async (taskId: string, reportText: string, proofUrls: string[]) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated: Task = {
      ...task,
      status: 'UNDER_REVIEW',
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    showToast(t('toastProofSubmitted'));

    // Supabase Persistence
    await submitDynamicProof(taskId, profile?.id || user.id, reportText, proofUrls);
    await updateDynamicTask(taskId, { status: 'UNDER_REVIEW' });
  };

  const handleApproveWork = async (taskId: string, review?: { rating: number; comment: string }) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated: Task = {
      ...task,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));

    const commissionRate = PLATFORM_PERFORMER_COMMISSION_RATE; // 15%
    const grossRewardEur = task.reward;
    const commissionEur = Number((grossRewardEur * commissionRate).toFixed(2));
    const netRewardEur = Number((grossRewardEur - commissionEur).toFixed(2));

    const grossRewardDH = Math.round(grossRewardEur * 10);
    const netRewardDH = Math.round(netRewardEur * 10);
    const commissionDH = Math.round(commissionEur * 10);

    // Release escrow to performer or complete customer order
    if (isAuthenticated && profile) {
      if (profile.activeRole === 'CUSTOMER') {
        await updateProfile({
          balanceEscrow: Math.max(0, (profile.balanceEscrow || 0) - task.totalBudget),
          customerTotalSpent: (profile.customerTotalSpent || 0) + task.totalBudget,
        });
      } else {
        await updateProfile({
          balanceAvailable: (profile.balanceAvailable || 0) + netRewardEur,
          performerCompletedTasks: (profile.performerCompletedTasks || 0) + 1,
        });
      }
    }

    showToast(t('toastTaskApproved', { amount: netRewardDH }));

    // Supabase Persistence
    await updateDynamicTask(taskId, { status: 'COMPLETED', completedAt: updated.completedAt });
    
    // Record escrow release transaction
    await recordDynamicTransaction({
      userId: task.assignedToId || profile?.id || user.id,
      type: 'ESCROW_RELEASE',
      amount: grossRewardEur,
      currency: 'EUR',
      description: `Gains validés pour mission #${taskId.slice(0, 8)} (${grossRewardDH} DH)`,
      status: 'COMPLETED',
    });

    // Record platform commission entry
    await recordDynamicTransaction({
      userId: task.assignedToId || profile?.id || user.id,
      type: 'COMMISSION',
      amount: -commissionEur,
      currency: 'EUR',
      description: `Commission de service Tâches.ma (15%) • -${commissionDH} DH`,
      status: 'COMPLETED',
    });

    // Save review if provided
    if (review && task.assignedToId && profile) {
      try {
        await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId,
            authorId: profile.id,
            authorName: profile.fullName || 'Client',
            targetUserId: task.assignedToId,
            rating: review.rating,
            comment: review.comment,
          }),
        });
      } catch (err) {
        console.warn('Failed to save review:', err);
      }
    }
  };

  const handleProposePartialSettlement = async (
    taskId: string,
    percentage: number,
    reason: string,
    rating: number,
    reviewComment: string
  ) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const amountDH = Math.round(task.reward * 10 * (percentage / 100));

    const proposal = {
      percentage,
      amountDH,
      reason,
      proposedBy: 'CUSTOMER' as const,
      rating,
      reviewComment,
      status: 'PENDING' as const,
      createdAt: new Date().toISOString(),
    };

    const updated: Task = {
      ...task,
      settlementProposal: proposal,
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    showToast(`Proposition de règlement à ${percentage}% (${amountDH} DH) transmise au freelance.`);

    await updateDynamicTask(taskId, {
      settlementProposal: proposal,
    } as any);

    if (profile) {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          senderId: profile.id,
          senderName: profile.fullName || 'Client',
          senderAvatar: profile.avatarUrl || '',
          content: `🤝 Proposition d'accord amiable : Règlement partiel de ${percentage}% (${amountDH} DH). Motif : « ${reason} »`,
        }),
      });
    }
  };

  const handleAcceptPartialSettlement = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.settlementProposal) return;

    const proposal = task.settlementProposal;
    const percentage = proposal.percentage;
    const totalGrossEur = task.reward;
    const performerGrossEur = Number((totalGrossEur * (percentage / 100)).toFixed(2));
    const clientRefundEur = Number((totalGrossEur - performerGrossEur).toFixed(2));
    
    const commissionRate = PLATFORM_PERFORMER_COMMISSION_RATE; // 15%
    const commissionEur = Number((performerGrossEur * commissionRate).toFixed(2));
    const performerNetEur = Number((performerGrossEur - commissionEur).toFixed(2));

    const performerGrossDH = Math.round(performerGrossEur * 10);
    const performerNetDH = Math.round(performerNetEur * 10);
    const clientRefundDH = Math.round(clientRefundEur * 10);
    const commissionDH = Math.round(commissionEur * 10);

    const updatedProposal = {
      ...proposal,
      status: 'ACCEPTED' as const,
    };

    const updated: Task = {
      ...task,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      settlementProposal: updatedProposal,
      finalPayoutPercentage: percentage,
      finalPerformerAmountDH: performerGrossDH,
      finalClientRefundDH: clientRefundDH,
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));

    // Update balances
    if (isAuthenticated && profile) {
      if (profile.activeRole === 'CUSTOMER') {
        await updateProfile({
          balanceEscrow: Math.max(0, (profile.balanceEscrow || 0) - task.totalBudget),
          balanceAvailable: (profile.balanceAvailable || 0) + clientRefundEur,
          customerTotalSpent: (profile.customerTotalSpent || 0) + (task.totalBudget - clientRefundEur),
        });
      } else {
        await updateProfile({
          balanceAvailable: (profile.balanceAvailable || 0) + performerNetEur,
          performerCompletedTasks: (profile.performerCompletedTasks || 0) + 1,
        });
      }
    }

    showToast(`Accord amiable validé : ${performerNetDH} DH encaissés, ${clientRefundDH} DH remboursés au client.`);

    // Persist in Supabase
    await updateDynamicTask(taskId, {
      status: 'COMPLETED',
      completedAt: updated.completedAt,
      settlementProposal: updatedProposal,
      finalPayoutPercentage: percentage,
      finalPerformerAmountDH: performerGrossDH,
      finalClientRefundDH: clientRefundDH,
    } as any);

    // Record Escrow release for Performer portion
    await recordDynamicTransaction({
      userId: task.assignedToId || profile?.id || user.id,
      type: 'ESCROW_RELEASE',
      amount: performerGrossEur,
      currency: 'EUR',
      description: `Règlement partiel (${percentage}%) mission #${taskId.slice(0, 8)} (${performerGrossDH} DH)`,
      status: 'COMPLETED',
    });

    // Record Commission for Performer portion
    if (commissionEur > 0) {
      await recordDynamicTransaction({
        userId: task.assignedToId || profile?.id || user.id,
        type: 'COMMISSION',
        amount: -commissionEur,
        currency: 'EUR',
        description: `Commission Tâches.ma (15%) sur règlement partiel • -${commissionDH} DH`,
        status: 'COMPLETED',
      });
    }

    // Record Refund for Customer portion
    if (clientRefundEur > 0) {
      await recordDynamicTransaction({
        userId: task.clientId || profile?.id || user.id,
        type: 'REFUND',
        amount: clientRefundEur,
        currency: 'EUR',
        description: `Remboursement partiel suite à accord (${100 - percentage}%) mission #${taskId.slice(0, 8)} (+${clientRefundDH} DH)`,
        status: 'COMPLETED',
      });
    }

    // Save review if client provided one in proposal
    if (proposal.rating && task.assignedToId) {
      try {
        await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId,
            authorId: task.clientId || profile?.id,
            authorName: task.clientName || 'Client',
            targetUserId: task.assignedToId,
            rating: proposal.rating,
            comment: proposal.reviewComment || 'Règlement partiel accepté d’un commun accord.',
          }),
        });
      } catch (err) {
        console.warn('Failed to save settlement review:', err);
      }
    }

    // Announce in chat
    if (profile) {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          senderId: profile.id,
          senderName: profile.fullName || 'Utilisateur',
          senderAvatar: profile.avatarUrl || '',
          content: `✅ Accord mutuel finalisé : ${percentage}% (${performerGrossDH} DH) versés au prestataire, ${clientRefundDH} DH restitués au client. Mission terminée.`,
        }),
      });
    }
  };

  const handleRejectPartialSettlement = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedProposal = task.settlementProposal
      ? { ...task.settlementProposal, status: 'REJECTED' as const }
      : undefined;

    const updated: Task = {
      ...task,
      status: 'ARBITRATION',
      settlementProposal: updatedProposal,
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    showToast('Proposition refusée. Dossier transmis aux arbitres Tâches.ma.');

    await updateDynamicTask(taskId, {
      status: 'ARBITRATION',
      settlementProposal: updatedProposal,
    } as any);

    if (profile) {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          senderId: profile.id,
          senderName: profile.fullName || 'Prestataire',
          senderAvatar: profile.avatarUrl || '',
          content: `❌ Proposition de règlement partiel refusée. Escalade automatique vers l'arbitrage pour décision du modérateur.`,
        }),
      });
    }
  };

  const handleDeposit = async (amountDH: number) => {
    if (!isAuthenticated || !profile) {
      openAuthModal('login', 'Connectez-vous pour effectuer un dépôt');
      return;
    }

    const amountEur = Number((amountDH * MAD_TO_EUR_RATE).toFixed(2));
    await updateProfile({
      balanceAvailable: (profile.balanceAvailable || 0) + amountEur,
    });

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: profile.id,
      type: 'DEPOSIT',
      amount: amountEur,
      currency: 'EUR',
      description: `${t('tabDeposit')} (${amountDH} DH / ${amountEur} €)`,
      createdAt: t('justNow'),
      status: 'COMPLETED',
    };
    setTransactions(prev => [newTx, ...prev]);
    showToast(t('toastDepositSuccess', { amount: amountDH }));

    await executeDynamicDeposit({
      userId: profile.id,
      amountDH,
      depositMethod: 'CARD',
    });
  };

  const handleWithdraw = async (amountDH: number, details?: any) => {
    if (!isAuthenticated || !profile) {
      openAuthModal('login', 'Connectez-vous pour effectuer un retrait');
      return;
    }

    const amountEur = Number((amountDH * MAD_TO_EUR_RATE).toFixed(2));
    if (amountEur > (profile.balanceAvailable || 0)) return;

    await updateProfile({
      balanceAvailable: Math.max(0, (profile.balanceAvailable || 0) - amountEur),
    });

    const payoutMethod = details?.method || 'RIB';
    const netAmountDH = details?.netAmountDH || (amountDH - 15);
    const feeDH = details?.feeDH || 15;

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: profile.id,
      type: 'WITHDRAWAL',
      amount: -amountEur,
      currency: 'EUR',
      description: `Retrait ${payoutMethod} - Net: ${netAmountDH} DH (Frais: ${feeDH} DH)`,
      createdAt: t('justNow'),
      status: 'PENDING',
    };
    setTransactions(prev => [newTx, ...prev]);
    showToast(t('toastWithdrawalInitiated', { amount: amountDH }));

    await executeDynamicWithdrawal({
      userId: profile.id,
      amountDH,
      payoutMethod,
      speedTier: details?.speed || 'STANDARD',
      payoutDetails: details || {},
    });
  };

  // Localized Tasks List
  const localizedTasks = useMemo(() => {
    return tasks.map(t => getLocalizedTask(t, locale));
  }, [tasks, locale]);

  // Current active modal task objects
  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    const raw = tasks.find(t => t.id === selectedTaskId);
    return raw ? getLocalizedTask(raw, locale) : null;
  }, [selectedTaskId, tasks, locale]);

  const proofTask = useMemo(() => {
    if (!proofTaskId) return null;
    const raw = tasks.find(t => t.id === proofTaskId);
    return raw ? getLocalizedTask(raw, locale) : null;
  }, [proofTaskId, tasks, locale]);

  return (
    <div className="min-h-screen bg-surface-soft text-slate-900 flex flex-col font-sans">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className={`fixed top-18 ${isRTL ? 'left-5' : 'right-5'} z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-xl border border-emerald-500/40 text-xs animate-in slide-in-from-top-3`}>
          <FiCheck className="text-emerald-400 text-base shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Unified Global Header */}
      <Header
        user={profile}
        onRoleToggle={handleRoleToggle}
        onOpenCreateTask={handleOpenCreateTask}
        onOpenWallet={() => {
          if (!isAuthenticated) {
            openAuthModal('login', 'Connectez-vous pour accéder à votre portefeuille');
            return;
          }
          if (viewMode === 'wallet') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            router.push(`/${locale}/wallet`);
          }
        }}
        onOpenQualification={() => {
          if (!isAuthenticated) {
            openAuthModal('login', 'Connectez-vous pour passer le test de qualification');
            return;
          }
          updateQuery({ test: 'true' });
        }}
        onViewMyWork={() => {
          if (!isAuthenticated) {
            openAuthModal('login', 'Connectez-vous pour voir vos missions');
            return;
          }
          if (viewMode === 'tasks') {
            updateQuery({ tab: 'my-tasks' });
          } else {
            router.push(`/${locale}/tasks?tab=my-tasks`);
          }
        }}
        activeTab={activeTab === 'my-tasks' ? 'my-tasks' : activeTab === 'live' ? 'live' : 'explore'}
        setActiveTab={(tab) => {
          if (tab === 'my-tasks' && !isAuthenticated) {
            openAuthModal('login', 'Connectez-vous pour voir vos missions');
            return;
          }
          if (viewMode === 'tasks') {
            updateQuery({ tab: tab === 'explore' ? null : tab });
          } else {
            router.push(`/${locale}/tasks${tab === 'my-tasks' ? '?tab=my-tasks' : tab === 'live' ? '?tab=live' : ''}`);
          }
        }}
      />

      {viewMode === 'profile' ? (
        /* DEDICATED WORKER / CUSTOMER PROFILE PAGE */
        <ProfilePageContent />
      ) : viewMode === 'tasks' ? (
        /* DEDICATED ALL TASKS CATALOG / WORK-ZILLA TABS VIEW */
        <main className="flex-1 py-6 sm:py-10 bg-slate-50">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* Top Navigation Mode Pills */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => updateQuery({ tab: 'live' })}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab !== 'examples'
                      ? 'bg-white text-brand-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🔴 Tableau de bord des missions
                </button>
                <button
                  type="button"
                  onClick={() => updateQuery({ tab: 'examples' })}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'examples' ? 'bg-white text-brand-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚡ Modèles & Exemples
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenCreateTask}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold px-4 py-2 text-xs shadow-xs transition cursor-pointer"
                >
                  <FiPlus className="text-sm font-black" />
                  <span>Publier une mission</span>
                </button>

                <button
                  type="button"
                  onClick={loadSupabaseData}
                  disabled={isSyncing}
                  className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  title="Synchroniser"
                >
                  <FiRefreshCw className={`text-xs ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'examples' ? (
              <TaskExamplesPage
                onCopyTask={handleCopyTaskExample}
                onPostNewTask={handleOpenCreateTask}
              />
            ) : (
              <WorkzillaTaskTabs
                tasks={localizedTasks}
                user={user}
                activeTab={workzillaSubTab}
                onTabChange={(st) => {
                  setWorkzillaSubTab(st);
                  updateQuery({ tab: st });
                }}
                onSelectTask={handleOpenTask}
                onOpenCreateTask={handleOpenCreateTask}
                onOpenChatForTask={handleOpenChatForTask}
                onOpenProofDrawer={(task) => updateQuery({ proof: task.id })}
                onApproveTask={(task) => handleApproveWork(task.id)}
                onRequestRevision={(task) => handleRequestRevision(task.id, 'Veuillez effectuer les corrections demandées.')}
                onCancelTask={(task) => handleCancelTask(task.id)}
              />
            )}
          </div>
        </main>
      ) : viewMode === 'wallet' ? (
        /* DEDICATED WALLET & ESCROW PAGE */
        !isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 min-h-[60vh]">
            <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 p-8 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 text-2xl mb-4">
                <FiLock />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Portefeuille Daman sécurisé</h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Veuillez vous connecter à votre compte tâches.ma pour consulter votre solde, vos garanties sous séquestre et effectuer vos dépôts ou retraits bancaires.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => openAuthModal('login', 'Connectez-vous pour accéder à votre portefeuille')}
                  className="w-full sm:w-auto rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold px-6 py-2.5 text-xs shadow-xs transition cursor-pointer"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => openAuthModal('signup', 'Créez un compte pour accéder à votre portefeuille')}
                  className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-2.5 text-xs transition cursor-pointer"
                >
                  Créer un compte
                </button>
              </div>
            </div>
          </div>
        ) : (
          <WalletPageContent
            user={user}
            transactions={transactions}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
          />
        )
      ) : viewMode === 'concepts' ? (
        /* DEDICATED CONCEPTS & ARCHITECTURE EXPLAINER PAGE */
        <ConceptExplainerPage />
      ) : (
        /* HOME PAGE VIEW - AUTHENTIC WORKZILLA EXPERIENCE */
        <>
          {/* 1. Work-zilla Direct Task Action Stage */}
          <WorkzillaHero
            onDirectPost={handleDirectHeroPost}
            onExploreFeed={() => {
              router.push(`/${locale}/tasks`);
            }}
          />

          {/* 2. Key Metrics Proof Bar */}
          <WorkzillaProofBar />

          {/* 3. Universal Categories Grid */}
          <WorkzillaCategoryGrid
            onSelectCategory={(catKey) => {
              router.push(`/${locale}/tasks/new?category=${encodeURIComponent(catKey)}`);
            }}
          />

          {/* 4. Simple 3-Step Process (Work-zilla Model) */}
          <WorkzillaHowItWorks
            onPostTask={handleOpenCreateTask}
          />

          {/* 5. Live Marketplace Feed (Compact High-Density List with Chat Access) */}
          <section id="marketplace-feed" className="py-14 sm:py-20 bg-white border-t border-slate-200">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">

              {/* Header Title for Task Feed */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <p className="section-kicker">Missions en direct</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    Dernières tâches publiées au Maroc
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
                    Consultez les dernières micro-tâches ou accédez au tableau de bord complet avec messagerie intégrée.
                  </p>
                </div>

                <button
                  onClick={() => router.push(`/${locale}/tasks`)}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-brand-700 hover:text-brand-800 hover:underline shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <span>Voir le catalogue ({tasks.length})</span>
                  {isRTL ? <FiArrowLeft /> : <FiArrowRight />}
                </button>
              </div>

              {/* Compact Task List (Work-zilla style) */}
              <div className="space-y-2.5">
                {localizedTasks.slice(0, 8).map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    userRole={user.activeRole}
                    onSelectTask={handleOpenTask}
                    onOpenChat={handleOpenChatForTask}
                  />
                ))}
              </div>

              {/* View All Tasks CTA Button */}
              <div className="mt-10 text-center">
                <button
                  onClick={() => router.push(`/${locale}/tasks`)}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white px-6 py-3.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
                >
                  <FiSearch className="text-base" />
                  <span>Voir toutes les tâches ({localizedTasks.length} disponibles)</span>
                  {isRTL ? <FiArrowLeft /> : <FiArrowRight />}
                </button>
              </div>

            </div>
          </section>

          {/* 6. Escrow & Guarantee (Daman) */}
          <WorkzillaTrustSection />

          {/* 7. Real Completed Tasks Feed */}
          <WorkzillaCompletedFeed />
        </>
      )}

      {/* Multi-Age Help Center with WhatsApp Support & FAQ */}
      {viewMode !== 'wallet' && viewMode !== 'profile' && <WorkzillaHelpCenter />}

      {/* Functional Moroccan Footer */}
      <WorkzillaFooter />

      {/* GLOBAL FLOATING WORKZILLA MESSENGER DOCK WIDGET */}
      <FloatingMessengerWidget
        currentUser={profile}
        tasks={tasks}
        activeTaskId={chatActiveTaskId}
        isOpen={isChatWidgetOpen}
        onToggle={() => setIsChatWidgetOpen(!isChatWidgetOpen)}
        onOpenTaskDetails={handleOpenTask}
      />

      {/* Modals with URL Route Synchronization */}
      <TaskDetailModal
        task={selectedTask}
        user={profile}
        onClose={handleCloseTask}
        onApply={handleApply}
        onOpenProofDrawer={(task) => {
          handleCloseTask();
          updateQuery({ proof: task.id });
        }}
        onApproveWork={handleApproveWork}
        onAssignPerformer={handleAssignPerformer}
        onRequestRevision={handleRequestRevision}
        onCancelTask={handleCancelTask}
        onRequestArbitration={handleRequestArbitration}
        onProposePartialSettlement={handleProposePartialSettlement}
        onAcceptPartialSettlement={handleAcceptPartialSettlement}
        onRejectPartialSettlement={handleRejectPartialSettlement}
      />

      <ProofSubmissionDrawer
        task={proofTask}
        onClose={() => updateQuery({ proof: null })}
        onSubmitProof={handleSubmitProof}
      />

      {/* Qualification Modal */}
      <QualificationModal
        isOpen={isQualificationOpen}
        onClose={() => updateQuery({ test: null })}
        onPassed={() => {
          if (profile) {
            updateProfile({ passedQualification: true });
          }
          showToast(t('toastQualificationPassed'));
        }}
      />

      {/* Mobile Bottom Navigation Bar (Persistent 1-click access) */}
      <MobileBottomNav
        onOpenCreateTask={handleOpenCreateTask}
        onOpenChat={() => setIsChatWidgetOpen(true)}
      />
    </div>
  );
}

export function MarketplaceApp(props: MarketplaceAppProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-brand-700 border-t-transparent animate-spin" />
      </div>
    }>
      <MarketplaceAppContent {...props} />
    </Suspense>
  );
}
