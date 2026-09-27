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
  recordDynamicTransaction 
} from '@/lib/supabaseService';
import { Header } from '@/components/Header';
import { TaskCard } from '@/components/TaskCard';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { ProofSubmissionDrawer } from '@/components/ProofSubmissionDrawer';
import { WalletModal } from '@/components/WalletModal';
import { QualificationModal } from '@/components/QualificationModal';

import { 
  FiSearch, 
  FiZap, 
  FiShield, 
  FiAward, 
  FiClock, 
  FiPlus, 
  FiCheck,
  FiRefreshCw
} from 'react-icons/fi';

interface MarketplaceAppProps {
  forcedLocale?: Locale;
  initialSlug?: string;
  initialTaskId?: string;
}

function MarketplaceAppContent({ forcedLocale, initialSlug, initialTaskId }: MarketplaceAppProps) {
  const { t, locale, isRTL, getCategoryLabel } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // App State
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(initialTransactions);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // View & Filter State
  const activeTab = (searchParams.get('tab') as 'explore' | 'my-tasks') || 'explore';
  const selectedCategory = searchParams.get('category') || 'all';
  const [filterUrgent, setFilterUrgent] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Navigate to task details modal route: /:locale/task/:slug
  const handleOpenTask = (task: Task) => {
    const slug = getTaskSlug(task);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    router.push(`/${locale}/task/${slug}${query}`, { scroll: false });
  };

  // Close task details modal route back to /:locale
  const handleCloseTask = () => {
    if (pathname.includes('/task/')) {
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      router.push(`/${locale}${query}`, { scroll: false });
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
      if (txs && txs.length > 0) {
        setTransactions(txs);
      }
    } catch (err) {
      console.warn('Supabase data load error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadSupabaseData();
  }, []);

  // 1-Click Role Switcher Handler (UNU.im feature)
  const handleRoleToggle = (newRole: UserRole) => {
    setUser(prev => ({ ...prev, activeRole: newRole }));
    showToast(
      newRole === 'CUSTOMER'
        ? t('toastRoleCustomer')
        : t('toastRolePerformer')
    );
  };

  // Task Creation Handler (Customer Journey with Escrow)
  const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'applicantsCount' | 'createdAt'>) => {
    const tempId = `tsk_${Date.now()}`;
    const newTask: Task = {
      ...newTaskData,
      id: tempId,
      applicantsCount: 0,
      createdAt: t('justNow'),
    };

    // Optimistically deduct escrow from available balance
    setUser(prev => ({
      ...prev,
      balanceAvailable: Math.max(0, prev.balanceAvailable - newTask.totalBudget),
      balanceEscrow: prev.balanceEscrow + newTask.totalBudget,
      customerTasksPosted: prev.customerTasksPosted + 1,
    }));

    // Record ledger transaction
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'ESCROW_LOCK',
      amount: -newTask.totalBudget,
      currency: 'EUR',
      description: `${t('escrowLockedTooltip')} : "${newTask.title.slice(0, 30)}..."`,
      createdAt: t('justNow'),
      status: 'COMPLETED',
    };

    setTransactions(prev => [newTx, ...prev]);
    setTasks(prev => [newTask, ...prev]);
    showToast(t('toastTaskCreated', { amount: newTask.totalBudget.toFixed(2) }));
    updateQuery({ create: null });

    // Sync to Supabase in background
    try {
      const result = await createDynamicTask(newTaskData);
      if (result && result.task && result.task.id) {
        setTasks(prev => prev.map(t => (t.id === tempId ? { ...t, id: result.task.id } : t)));
      }
      await recordDynamicTransaction({
        userId: user.id,
        type: 'ESCROW_LOCK',
        amount: -newTask.totalBudget,
        currency: 'EUR',
        description: `${t('escrowLockedTooltip')} : "${newTask.title.slice(0, 30)}..."`,
        status: 'COMPLETED',
      });
    } catch (err) {
      console.warn('Could not persist task to Supabase:', err);
    }
  };

  // Task Application Handler (Performer Journey)
  const handleApply = async (taskId: string, pitch: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, applicantsCount: t.applicantsCount + 1 } : t))
    );
    showToast(t('toastApplied'));
    await updateDynamicTask(taskId, { applicantsCount: (tasks.find(t => t.id === taskId)?.applicantsCount || 0) + 1 });
  };

  // Proof Submission Handler (Performer finishing work)
  const handleSubmitProof = async (taskId: string, reportText: string, proofUrls: string[]) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              status: 'UNDER_REVIEW',
            }
          : t
      )
    );
    showToast(t('toastProofSubmitted'));
    updateQuery({ proof: null });

    // Persist to Supabase
    await submitDynamicProof(taskId, user.id, reportText, proofUrls);
  };

  // Task Approval & Escrow Release (Customer approves work)
  const handleApproveWork = async (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: 'COMPLETED' } : t))
    );

    // Release escrow into performer available balance
    setUser(prev => ({
      ...prev,
      balanceAvailable: prev.balanceAvailable + targetTask.reward,
      balanceEscrow: Math.max(0, prev.balanceEscrow - targetTask.totalBudget),
      performerXp: prev.performerXp + 50,
      performerCompletedTasks: prev.performerCompletedTasks + 1,
    }));

    const releaseTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'ESCROW_RELEASE',
      amount: targetTask.reward,
      currency: 'EUR',
      description: `${t('proofGuaranteedPayout')} : "${targetTask.title.slice(0, 30)}..."`,
      createdAt: t('justNow'),
      status: 'COMPLETED',
    };

    setTransactions(prev => [releaseTx, ...prev]);
    showToast(t('toastTaskApproved', { amount: targetTask.reward.toFixed(2) }));
    handleCloseTask();

    // Persist to Supabase
    await updateDynamicTask(taskId, { status: 'COMPLETED', completedAt: new Date().toISOString() });
    await recordDynamicTransaction({
      userId: user.id,
      type: 'ESCROW_RELEASE',
      amount: targetTask.reward,
      currency: 'EUR',
      description: `${t('proofGuaranteedPayout')} : "${targetTask.title.slice(0, 30)}..."`,
      status: 'COMPLETED',
    });
  };

  // Deposit Simulation
  const handleDeposit = async (amount: number) => {
    setUser(prev => ({
      ...prev,
      balanceAvailable: prev.balanceAvailable + amount,
    }));
    const depTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'DEPOSIT',
      amount: amount,
      currency: 'EUR',
      description: t('tabDeposit'),
      createdAt: t('justNow'),
      status: 'COMPLETED',
    };
    setTransactions(prev => [depTx, ...prev]);
    await recordDynamicTransaction({
      userId: user.id,
      type: 'DEPOSIT',
      amount: amount,
      currency: 'EUR',
      description: t('tabDeposit'),
      status: 'COMPLETED',
    });
  };

  // Withdrawal Simulation
  const handleWithdraw = async (amount: number) => {
    setUser(prev => ({
      ...prev,
      balanceAvailable: prev.balanceAvailable - amount,
    }));
    const wdTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'WITHDRAWAL',
      amount: -amount,
      currency: 'EUR',
      description: t('tabWithdraw'),
      createdAt: t('justNow'),
      status: 'COMPLETED',
    };
    setTransactions(prev => [wdTx, ...prev]);
    await recordDynamicTransaction({
      userId: user.id,
      type: 'WITHDRAWAL',
      amount: -amount,
      currency: 'EUR',
      description: t('tabWithdraw'),
      status: 'COMPLETED',
    });
  };

  // Localized Tasks List
  const localizedTasks = useMemo(() => {
    return tasks.map(t => getLocalizedTask(t, locale));
  }, [tasks, locale]);

  // Filtered Task List
  const filteredTasks = useMemo(() => {
    let list = localizedTasks;

    // Filter by Active Tab
    if (activeTab === 'my-tasks') {
      if (user.activeRole === 'CUSTOMER') {
        list = list.filter(t => t.clientId === user.id || t.clientName.includes('Vous') || t.clientName.includes('You'));
      } else {
        list = list.filter(t => t.assignedToId === user.id || t.status === 'IN_PROGRESS' || t.status === 'UNDER_REVIEW');
      }
    }

    // Filter by Category
    if (selectedCategory !== 'all') {
      list = list.filter(t => t.category === selectedCategory);
    }

    // Filter by Urgency (< 6h)
    if (filterUrgent) {
      list = list.filter(t => t.timeLimitHours <= 6);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [localizedTasks, activeTab, user.activeRole, user.id, selectedCategory, filterUrgent, searchQuery]);

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
    <div className="min-h-screen bg-cream text-ink flex flex-col font-sans selection:bg-lime selection:text-ink">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className={`fixed top-18 ${isRTL ? 'left-5' : 'right-5'} z-50 flex items-center gap-2.5 rounded-2xl bg-ink text-white px-4 py-3 shadow-xl border border-lime/30 text-xs animate-in slide-in-from-top-3`}>
          <FiCheck className="text-lime text-base shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Unified Global Header */}
      <Header
        user={user}
        onRoleToggle={handleRoleToggle}
        onOpenCreateTask={() => updateQuery({ create: 'true' })}
        onOpenWallet={() => updateQuery({ wallet: 'true' })}
        onOpenQualification={() => updateQuery({ test: 'true' })}
        onViewMyWork={() => updateQuery({ tab: 'my-tasks' })}
        activeTab={activeTab}
        setActiveTab={(tab) => updateQuery({ tab: tab === 'explore' ? null : 'my-tasks' })}
      />

      {/* Main Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Brand Banner Hero */}
        <section className="grid-bg relative mb-8 overflow-hidden rounded-3xl bg-lime px-6 py-10 sm:px-10 lg:py-12 border border-ink/10 shadow-sm">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white/30 px-3 py-1 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-ink animate-ping" />
              <span>{t('heroBadge')}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-ink leading-[1.05]">
              {user.activeRole === 'CUSTOMER' ? (
                <>
                  {t('heroCustomerTitle1')}<br />
                  <em>{t('heroCustomerTitle2')}</em>
                </>
              ) : (
                <>
                  {t('heroPerformerTitle1')}<br />
                  <em>{t('heroPerformerTitle2')}</em>
                </>
              )}
            </h1>

            <p className="mt-4 text-xs sm:text-sm text-ink/75 leading-relaxed max-w-lg">
              {user.activeRole === 'CUSTOMER' ? t('heroCustomerDesc') : t('heroPerformerDesc')}
            </p>

            {/* Quick Hero Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              {user.activeRole === 'CUSTOMER' ? (
                <button
                  onClick={() => updateQuery({ create: 'true' })}
                  className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-ink/90 transition"
                >
                  <FiPlus className="text-lime text-base" />
                  <span>{t('btnPostNewTask')}</span>
                </button>
              ) : (
                <button
                  onClick={() => updateQuery({ test: 'true' })}
                  className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-lime shadow-md hover:bg-ink/90 transition"
                >
                  <FiAward className="text-base" />
                  <span>{t('btnTakeQualification')}</span>
                </button>
              )}

              <button
                onClick={() => updateQuery({ wallet: 'true' })}
                className="flex items-center gap-2 rounded-full border border-ink/20 bg-white/40 px-5 py-3 text-xs font-bold text-ink hover:bg-white/70 transition"
              >
                <FiShield />
                <span>{t('btnViewEscrow', { amount: user.balanceEscrow.toFixed(2) })}</span>
              </button>
            </div>
          </div>

          {/* Decorative Corner Badge */}
          <div className={`hidden md:flex absolute ${isRTL ? 'left-10 text-left items-start' : 'right-10 text-right items-end'} bottom-8 flex-col`}>
            <div className="font-display text-4xl font-extrabold text-ink">{t('statResolutionRate')}</div>
            <div className="text-xs font-medium text-ink/70">{t('statResolutionLabel')}</div>
            <div className="mt-2 text-[10px] text-ink/50 uppercase tracking-widest font-bold">
              {t('statEscrowProtected')}
            </div>
          </div>
        </section>

        {/* Filters & Live Search Bar */}
        <section className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-3.5 text-ink/40 text-sm`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className={`w-full rounded-full border border-ink/15 bg-white py-2.5 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-xs text-ink outline-none transition focus:border-ink focus:ring-1 focus:ring-ink shadow-2xs`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute ${isRTL ? 'left-3.5' : 'right-3.5'} top-3 text-[10px] text-ink/40 hover:text-ink font-bold`}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Toggle: Urgent Tasks */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterUrgent(!filterUrgent)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold border transition ${
                  filterUrgent
                    ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-xs'
                    : 'border-ink/10 bg-white text-ink/70 hover:border-ink/20'
                }`}
              >
                <FiClock className={filterUrgent ? 'text-amber-600' : 'text-ink/40'} />
                <span>{t('filterUrgent')}</span>
              </button>

              <button
                onClick={() => {
                  setFilterUrgent(false);
                  setSearchQuery('');
                  updateQuery({ category: null });
                }}
                className="rounded-full bg-ink/5 px-3 py-2 text-xs font-medium text-ink/60 hover:text-ink hover:bg-ink/10 transition"
              >
                {t('filterReset')}
              </button>

              <button
                onClick={loadSupabaseData}
                disabled={isSyncing}
                title="Synchroniser avec Supabase"
                className="flex items-center gap-1 rounded-full bg-white border border-ink/10 px-3 py-2 text-xs font-medium text-ink/70 hover:text-ink hover:border-ink/30 transition disabled:opacity-50"
              >
                <FiRefreshCw className={`text-xs ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                <span className="hidden md:inline">Sync</span>
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['all', 'development', 'design', 'assistance', 'copywriting', 'micro'].map((catId) => (
              <button
                key={catId}
                onClick={() => updateQuery({ category: catId === 'all' ? null : catId })}
                className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === catId
                    ? 'bg-ink text-lime shadow-xs scale-102'
                    : 'bg-white border border-ink/10 text-ink/70 hover:border-ink/30 hover:text-ink'
                }`}
              >
                {getCategoryLabel(catId)}
              </button>
            ))}
          </div>
        </section>

        {/* Task Cards Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink/60 flex items-center gap-2">
              <span>
                {activeTab === 'explore'
                  ? t('tasksAvailable', { count: filteredTasks.length })
                  : user.activeRole === 'CUSTOMER'
                  ? t('tasksMyOrders', { count: filteredTasks.length })
                  : t('tasksMyMissions', { count: filteredTasks.length })}
              </span>
              {isSyncing && (
                <span className="text-[10px] text-emerald-600 font-normal lowercase">(sync...)</span>
              )}
            </h2>
            <span className="text-[11px] text-ink/40">
              {t('realtimeUpdate')}
            </span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-ink/20 bg-white p-12 text-center">
              <FiZap className="mx-auto text-3xl text-ink/30 mb-2" />
              <h3 className="font-display text-base font-bold text-ink">{t('noTasksFound')}</h3>
              <p className="mt-1 text-xs text-ink/60">
                {t('noTasksDesc')}
              </p>
              <button
                onClick={() => {
                  setFilterUrgent(false);
                  setSearchQuery('');
                  updateQuery({ category: null });
                }}
                className="mt-4 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-lime"
              >
                {t('btnViewAllTasks')}
              </button>
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
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-ink/10 bg-white/60 py-8 text-xs text-ink/60">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-ink text-base">tâches.</span>
            <span>{t('footerDesc')}</span>
          </div>
          <div className="flex gap-4 text-ink/75">
            <button onClick={() => updateQuery({ test: 'true' })} className="hover:text-ink">
              {t('footerRules')}
            </button>
            <button onClick={() => updateQuery({ wallet: 'true' })} className="hover:text-ink">
              {t('footerWallet')}
            </button>
            <a href="https://github.com/elmehdibadaoui/taches" target="_blank" rel="noreferrer" className="hover:text-ink">
              {t('footerGithub')}
            </a>
          </div>
        </div>
      </footer>

      {/* Interactive Modals with URL Route Synchronization (e.g. /:locale/task/:title-timestamp) */}
      <TaskDetailModal
        task={selectedTask}
        user={user}
        onClose={handleCloseTask}
        onApply={handleApply}
        onOpenProofDrawer={(task) => {
          handleCloseTask();
          updateQuery({ proof: task.id });
        }}
        onApproveWork={handleApproveWork}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => updateQuery({ create: null })}
        onCreateTask={handleCreateTask}
      />

      <ProofSubmissionDrawer
        task={proofTask}
        onClose={() => updateQuery({ proof: null })}
        onSubmitProof={handleSubmitProof}
      />

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => updateQuery({ wallet: null })}
        user={user}
        transactions={transactions}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
      />

      <QualificationModal
        isOpen={isQualificationOpen}
        onClose={() => updateQuery({ test: null })}
        onPassed={() => {
          setUser(prev => ({ ...prev, passedQualification: true }));
          showToast(t('toastQualificationPassed'));
        }}
      />
    </div>
  );
}

export function MarketplaceApp(props: MarketplaceAppProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-ink border-t-transparent animate-spin" />
      </div>
    }>
      <MarketplaceAppContent {...props} />
    </Suspense>
  );
}
