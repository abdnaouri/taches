'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { initialTasks, initialUser, initialTransactions, getLocalizedTask } from '@/lib/mockData';
import { Task, UserProfile, UserRole, WalletTransaction } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Locale } from '@/lib/i18n/types';
import { getTaskSlug, extractTaskIdFromSlug } from '@/lib/slug';
import {
  fetchDynamicTasks,
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
  FiGrid
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

  // Active User Profile (Supabase Auth profile or fallback)
  const user: UserProfile = profile || initialUser;
  const isCustomer = user.activeRole === 'CUSTOMER';

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(initialTransactions);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);


  // Work-zilla Pre-filled Task Input State
  const [prefillTaskTitle, setPrefillTaskTitle] = useState<string>('');
  const [prefillTaskDesc, setPrefillTaskDesc] = useState<string>('');
  const [prefillTaskBudget, setPrefillTaskBudget] = useState<number | undefined>(undefined);
  const [prefillTaskCategory, setPrefillTaskCategory] = useState<string | undefined>(undefined);

  // Copy Task Example handler
  const handleCopyTaskExample = (example: TaskExample) => {
    const title = example.title[locale] || example.title.fr;
    const budget = example.priceDH;
    const cat = example.category;
    router.push(`/${locale}/tasks/new?title=${encodeURIComponent(title)}&category=${encodeURIComponent(cat)}&budget=${budget}`);
  };

  // View & Filter State
  const activeTab = (searchParams.get('tab') as 'examples' | 'live' | 'explore' | 'my-tasks') || 'examples';
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
    if (title.trim()) {
      router.push(`/${locale}/tasks/new?title=${encodeURIComponent(title.trim())}`);
    } else {
      router.push(`/${locale}/tasks/new`);
    }
  };

  const handleOpenCreateTask = () => {
    router.push(`/${locale}/tasks/new`);
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
      if (res.tasks && res.tasks.length > 0) {
        setTasks(res.tasks);
      }
      const txs = await fetchDynamicTransactions();
      if (Array.isArray(txs) && txs.length > 0) {
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

    // Check if customer has enough available balance, deduct or mark as escrow deposit
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
    await createDynamicTask(newTask);
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

  // My Tasks list helper
  const myTasksList = useMemo(() => {
    if (!isAuthenticated || !profile) return [];
    if (profile.activeRole === 'CUSTOMER') {
      return localizedTasks.filter(
        (t) =>
          t.clientId === profile.id ||
          t.clientName.includes('Vous') ||
          t.clientName.includes('You')
      );
    }
    return localizedTasks.filter(
      (t) =>
        t.assignedToId === profile.id ||
        t.status === 'IN_PROGRESS' ||
        t.status === 'UNDER_REVIEW'
    );
  }, [localizedTasks, isAuthenticated, profile]);

  const myTasksCounts = useMemo(() => {
    return {
      all: myTasksList.length,
      open: myTasksList.filter((t) => t.status === 'OPEN').length,
      in_progress: myTasksList.filter((t) => t.status === 'IN_PROGRESS').length,
      under_review: myTasksList.filter((t) => t.status === 'UNDER_REVIEW').length,
      completed: myTasksList.filter((t) => t.status === 'COMPLETED').length,
    };
  }, [myTasksList]);

  // Filtered Task List
  const filteredTasks = useMemo(() => {
    let list = localizedTasks;

    // Filter by Active Tab
    if (activeTab === 'my-tasks') {
      list = myTasksList;

      // Filter by My-Tasks Status Sub-tab
      if (myTasksStatusFilter === 'open') {
        list = list.filter((t) => t.status === 'OPEN');
      } else if (myTasksStatusFilter === 'in_progress') {
        list = list.filter((t) => t.status === 'IN_PROGRESS');
      } else if (myTasksStatusFilter === 'under_review') {
        list = list.filter((t) => t.status === 'UNDER_REVIEW');
      } else if (myTasksStatusFilter === 'completed') {
        list = list.filter((t) => t.status === 'COMPLETED');
      }
    }

    // Filter by Category
    if (selectedCategory !== 'all') {
      list = list.filter((t) => t.category === selectedCategory);
    }

    // Filter by Urgency (< 6h)
    if (filterUrgent) {
      list = list.filter((t) => t.timeLimitHours <= 6);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [
    localizedTasks,
    activeTab,
    myTasksList,
    myTasksStatusFilter,
    selectedCategory,
    filterUrgent,
    searchQuery,
  ]);

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
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'my-tasks' && !isAuthenticated) {
            openAuthModal('login', 'Connectez-vous pour voir vos missions');
            return;
          }
          if (viewMode === 'tasks') {
            updateQuery({ tab: tab === 'explore' ? null : 'my-tasks' });
          } else {
            router.push(`/${locale}/tasks${tab === 'my-tasks' ? '?tab=my-tasks' : ''}`);
          }
        }}
      />


      {viewMode === 'tasks' ? (
        /* DEDICATED ALL TASKS CATALOG / EXAMPLES PAGE */
        activeTab === 'examples' || activeTab === 'explore' ? (
          <main className="flex-1">
            {/* Top View Selector Bar */}
            <div className="bg-white border-b border-slate-200 py-3">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => updateQuery({ tab: 'examples' })}
                    className="px-3.5 py-1.5 rounded-lg transition-all cursor-pointer bg-white text-brand-700 shadow-xs"
                  >
                    ⚡ {locale === 'ar' ? 'أمثلة المهام المنجزة' : locale === 'ru' ? 'Примеры заданий' : locale === 'en' ? 'Task Examples' : 'Exemples de missions'}
                  </button>
                  <button
                    onClick={() => updateQuery({ tab: 'live' })}
                    className="px-3.5 py-1.5 rounded-lg transition-all cursor-pointer text-slate-600 hover:text-slate-900"
                  >
                    🔴 {locale === 'ar' ? `مهام مفتوحة (${tasks.length})` : locale === 'ru' ? `Открытые (${tasks.length})` : locale === 'en' ? `Live Tasks (${tasks.length})` : `Missions en direct (${tasks.length})`}
                  </button>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        openAuthModal('login', 'Connectez-vous pour voir vos missions');
                        return;
                      }
                      updateQuery({ tab: 'my-tasks' });
                    }}
                    className="px-3.5 py-1.5 rounded-lg transition-all cursor-pointer text-slate-600 hover:text-slate-900"
                  >
                    👤 {user.activeRole === 'CUSTOMER' ? t('navMyOrders') : t('navMyMissions')}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleOpenCreateTask}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold px-4 py-2 text-xs shadow-xs transition cursor-pointer"
                  >
                    <FiPlus className="text-sm" />
                    <span>{t('btnPostTask')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Task Examples Component (Work-zilla Style) */}
            <TaskExamplesPage
              onCopyTask={handleCopyTaskExample}
              onPostNewTask={handleOpenCreateTask}
            />
          </main>
        ) : (
          <main className="flex-1 py-8 sm:py-12 bg-slate-50/60">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">

              {/* Breadcrumb Navigation */}
              <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                <button
                  onClick={() => router.push(`/${locale}`)}
                  className="hover:text-brand-700 transition-colors font-medium cursor-pointer"
                >
                  Accueil
                </button>
                <span>/</span>
                <span className="font-bold text-slate-900">
                  {activeTab === 'live'
                    ? 'Missions ouvertes en direct'
                    : user.activeRole === 'CUSTOMER'
                      ? t('navMyOrders')
                      : t('navMyMissions')}
                </span>
              </nav>

              {/* Dedicated Catalog Banner */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200/80 px-3 py-1 text-xs font-bold text-brand-700 mb-2.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{activeTab === 'live' ? 'Missions en direct' : t('navExplore')}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {activeTab === 'live'
                        ? t('tasksAvailable', { count: filteredTasks.length })
                        : user.activeRole === 'CUSTOMER'
                          ? t('tasksMyOrders', { count: filteredTasks.length })
                          : t('tasksMyMissions', { count: filteredTasks.length })}
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                      Parcourez et postulez aux micro-services rémunérés en Dirhams (MAD) avec paiement 100% garanti sous séquestre (Daman).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {/* Tab Selector */}
                    <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                      <button
                        onClick={() => updateQuery({ tab: 'examples' })}
                        className="px-3.5 py-1.5 rounded-lg transition-all cursor-pointer text-slate-600 hover:text-slate-900"
                      >
                        ⚡ Exemples
                      </button>
                      <button
                        onClick={() => updateQuery({ tab: 'live' })}
                        className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'live'
                            ? 'bg-white text-brand-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                          }`}
                      >
                        🔴 En direct
                      </button>
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            openAuthModal('login', 'Connectez-vous pour voir vos missions');
                            return;
                          }
                          updateQuery({ tab: 'my-tasks' });
                        }}
                        className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'my-tasks'
                            ? 'bg-white text-brand-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                          }`}
                      >
                        {user.activeRole === 'CUSTOMER' ? t('navMyOrders') : t('navMyMissions')}
                      </button>
                    </div>

                    <button
                      onClick={loadSupabaseData}
                      disabled={isSyncing}
                      title="Synchroniser avec Supabase"
                      className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                      <FiRefreshCw className={`text-xs ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                      <span>Sync</span>
                    </button>
                  </div>
                </div>

              {/* Category Filter Pills */}
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${isSelected
                          ? 'bg-brand-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                        }`}
                    >
                      {getCategoryLabel(cat)}
                    </button>
                  );
                })}
              </div>

              {/* Sub-status filter when in My-Tasks */}
              {activeTab === 'my-tasks' && isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: `Toutes (${myTasksCounts.all})` },
                    { id: 'open', label: `En attente (${myTasksCounts.open})` },
                    { id: 'in_progress', label: `En cours (${myTasksCounts.in_progress})` },
                    { id: 'under_review', label: `À vérifier (${myTasksCounts.under_review})` },
                    { id: 'completed', label: `Terminées (${myTasksCounts.completed})` },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setMyTasksStatusFilter(st.id as any)}
                      className={`rounded-lg px-3 py-1 text-xs font-extrabold transition whitespace-nowrap cursor-pointer ${
                        myTasksStatusFilter === st.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filters, Search & Layout View Controls */}
            <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <FiSearch className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-3.5 text-slate-400 text-sm`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className={`w-full rounded-xl border border-slate-300 bg-white py-2.5 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'
                    } text-xs text-slate-900 outline-none transition focus:border-brand-700 focus:ring-1 focus:ring-brand-700 shadow-2xs`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`absolute ${isRTL ? 'left-3.5' : 'right-3.5'} top-3 text-[10px] text-slate-400 hover:text-slate-800 font-bold`}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* View Switcher: List vs Grid */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setViewLayout('list')}
                    title="Vue liste compacte"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      viewLayout === 'list'
                        ? 'bg-white text-brand-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FiList />
                    <span>Liste</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewLayout('grid')}
                    title="Vue cartes"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      viewLayout === 'grid'
                        ? 'bg-white text-brand-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FiGrid />
                    <span>Cartes</span>
                  </button>
                </div>

                <button
                  onClick={() => setFilterUrgent(!filterUrgent)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold border transition cursor-pointer ${filterUrgent
                      ? 'border-amber-400 bg-amber-50 text-amber-900'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <FiClock className={filterUrgent ? 'text-amber-600' : 'text-slate-400'} />
                  <span>{t('filterUrgent')}</span>
                </button>

                {(filterUrgent || searchQuery || selectedCategory !== 'all' || myTasksStatusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setFilterUrgent(false);
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setMyTasksStatusFilter('all');
                    }}
                    className="rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 transition cursor-pointer shadow-2xs"
                  >
                    {t('filterReset')}
                  </button>
                )}
              </div>
            </div>

            {/* Task Content: Compact List (Default Work-zilla) or Grid */}
            <div>
              {filteredTasks.length === 0 ? (
                activeTab === 'my-tasks' && !isAuthenticated ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 text-xl mb-3">
                      <FiLock />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Connectez-vous pour accéder à vos tâches</h3>
                    <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                      Connectez-vous à votre compte pour suivre vos commandes publiées ou vos missions en cours.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={() => openAuthModal('login', 'Connectez-vous pour voir vos tâches')}
                        className="rounded-xl bg-brand-700 hover:bg-brand-800 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                      >
                        Se connecter
                      </button>
                      <button
                        onClick={() => openAuthModal('signup', 'Créez un compte pour voir vos tâches')}
                        className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                      >
                        Créer un compte
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                    <FiShield className="mx-auto text-3xl text-slate-400 mb-2" />
                    <h3 className="text-base font-bold text-slate-900">{t('noTasksFound')}</h3>
                    <p className="mt-1 text-xs text-slate-600">
                      {t('noTasksDesc')}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setFilterUrgent(false);
                          setSearchQuery('');
                          setSelectedCategory('all');
                          setMyTasksStatusFilter('all');
                        }}
                        className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-bold text-slate-800 transition cursor-pointer"
                      >
                        {t('filterReset')}
                      </button>
                      <button
                        onClick={handleOpenCreateTask}
                        className="rounded-xl bg-brand-700 hover:bg-brand-800 px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                      >
                        {t('btnPostTask')}
                      </button>
                    </div>
                  </div>
                )
              ) : viewLayout === 'list' ? (
                <div className="space-y-2.5">
                  {filteredTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      userRole={user.activeRole}
                      isMyTaskView={activeTab === 'my-tasks'}
                      onSelectTask={handleOpenTask}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      userRole={user.activeRole}
                      onSelectTask={handleOpenTask}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
        )
      ) : viewMode === 'wallet' ? (
        /* DEDICATED PROPER WALLET & ESCROW PAGE */
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
      ) : viewMode === 'profile' ? (
        /* DEDICATED WORKER & USER PROFILE MANAGEMENT HUB */
        <main className="flex-1">
          <ProfilePageContent />
        </main>
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
              setPrefillTaskCategory(catKey);
              if (!isAuthenticated) {
                openAuthModal('login', 'Connectez-vous pour publier une tâche', () => {
                  updateQuery({ create: 'true' });
                });
                return;
              }
              if (profile?.activeRole !== 'CUSTOMER') {
                toggleRole('CUSTOMER');
              }
              updateQuery({ create: 'true' });
            }}
          />

          {/* 4. Simple 3-Step Process (Work-zilla Model) */}
          <WorkzillaHowItWorks
            onPostTask={handleOpenCreateTask}
          />

          {/* 5. Live Marketplace Feed (Compact High-Density List) */}
          <section id="marketplace-feed" className="py-14 sm:py-20 bg-white border-t border-slate-200">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">

              {/* Header Title for Task Feed */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <p className="section-kicker">Missions en direct</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    Dernières tâches publiées
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
                    Consultez les dernières micro-tâches ou accédez au catalogue complet.
                  </p>
                </div>

                <button
                  onClick={() => router.push(`/${locale}/tasks`)}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-brand-700 hover:text-brand-800 hover:underline shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <span>{t('navExplore')}</span>
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
      {viewMode !== 'wallet' && <WorkzillaHelpCenter />}

      {/* Functional Moroccan Footer */}
      <WorkzillaFooter />

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
      />

      {isAuthenticated && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            updateQuery({ create: null });
            setPrefillTaskTitle('');
            setPrefillTaskDesc('');
            setPrefillTaskBudget(undefined);
            setPrefillTaskCategory(undefined);
          }}
          onCreateTask={handleCreateTask}
          initialTitle={prefillTaskTitle}
          initialDescription={prefillTaskDesc}
          initialRewardDH={prefillTaskBudget}
          initialCategoryKey={prefillTaskCategory}
        />
      )}

      <ProofSubmissionDrawer
        task={proofTask}
        onClose={() => updateQuery({ proof: null })}
        onSubmitProof={handleSubmitProof}
      />

      {/* Backwards-compatibility fallback modal if opened via embedded modal query */}
      {viewMode !== 'wallet' && (
        <WalletModal
          isOpen={isWalletOpen}
          onClose={() => updateQuery({ wallet: null })}
          user={user}
          transactions={transactions}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
        />
      )}

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
