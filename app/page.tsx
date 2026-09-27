'use client';

import React, { useState, useMemo } from 'react';
import { initialTasks, initialUser, initialTransactions } from '@/lib/mockData';
import { Task, TaskCategory, UserProfile, UserRole, WalletTransaction } from '@/types/database';
import { Header } from '@/components/Header';
import { TaskCard } from '@/components/TaskCard';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { ProofSubmissionDrawer } from '@/components/ProofSubmissionDrawer';
import { WalletModal } from '@/components/WalletModal';
import { QualificationModal } from '@/components/QualificationModal';

import { 
  FiSearch, 
  FiFilter, 
  FiZap, 
  FiCheckCircle, 
  FiShield, 
  FiAward, 
  FiClock, 
  FiPlus,
  FiArrowUpRight,
  FiCheck
} from 'react-icons/fi';

export default function Home() {
  // App State
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(initialTransactions);

  // View & Filter State
  const [activeTab, setActiveTab] = useState<'explore' | 'my-tasks'>('explore');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterUrgent, setFilterUrgent] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [proofTask, setProofTask] = useState<Task | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isQualificationOpen, setIsQualificationOpen] = useState(false);

  // Feedback Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 1-Click Role Switcher Handler (UNU.im feature)
  const handleRoleToggle = (newRole: UserRole) => {
    setUser(prev => ({ ...prev, activeRole: newRole }));
    showToast(
      newRole === 'CUSTOMER'
        ? "Mode Client activé : Vous pouvez publier des tâches et choisir vos talents."
        : "Mode Exécutant activé : Vous pouvez postuler aux tâches et encaisser vos gains."
    );
  };

  // Task Creation Handler (Customer Journey with Escrow)
  const handleCreateTask = (newTaskData: Omit<Task, 'id' | 'applicantsCount' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `tsk_${Date.now()}`,
      applicantsCount: 0,
      createdAt: 'À l’instant',
    };

    // Deduct escrow from available balance
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
      description: `Séquestre bloqué pour publication : "${newTask.title.slice(0, 30)}..."`,
      createdAt: 'À l’instant',
      status: 'COMPLETED',
    };

    setTransactions(prev => [newTx, ...prev]);
    setTasks(prev => [newTask, ...prev]);
    showToast(`Tâche publiée ! €${newTask.totalBudget.toFixed(2)} réservés sous séquestre sécurisé.`);
  };

  // Task Application Handler (Performer Journey)
  const handleApply = (taskId: string, pitch: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, applicantsCount: t.applicantsCount + 1 } : t))
    );
    showToast("Votre candidature a été transmise au client avec succès !");
  };

  // Proof Submission Handler (Performer finishing work)
  const handleSubmitProof = (taskId: string, reportText: string, proofUrls: string[]) => {
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
    showToast("Preuves transmises au client ! Paiement sous séquestre en attente de libération.");
  };

  // Task Approval & Escrow Release (Customer approves work)
  const handleApproveWork = (taskId: string) => {
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
      description: `Paiement séquestre libéré : "${targetTask.title.slice(0, 30)}..."`,
      createdAt: 'À l’instant',
      status: 'COMPLETED',
    };

    setTransactions(prev => [releaseTx, ...prev]);
    showToast(`Mission approuvée ! €${targetTask.reward.toFixed(2)} crédités avec succès (+50 XP).`);
  };

  // Deposit Simulation
  const handleDeposit = (amount: number) => {
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
      description: 'Rechargement de solde par Carte Bancaire',
      createdAt: 'À l’instant',
      status: 'COMPLETED',
    };
    setTransactions(prev => [depTx, ...prev]);
  };

  // Withdrawal Simulation
  const handleWithdraw = (amount: number) => {
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
      description: 'Demande de virement bancaire SEPA',
      createdAt: 'À l’instant',
      status: 'COMPLETED',
    };
    setTransactions(prev => [wdTx, ...prev]);
  };

  // Filtered Task List
  const filteredTasks = useMemo(() => {
    let list = tasks;

    // Filter by Active Tab
    if (activeTab === 'my-tasks') {
      if (user.activeRole === 'CUSTOMER') {
        list = list.filter(t => t.clientId === user.id || t.clientName.includes('Vous'));
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
  }, [tasks, activeTab, user.activeRole, user.id, selectedCategory, filterUrgent, searchQuery]);

  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col font-sans selection:bg-lime selection:text-ink">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-18 right-5 z-50 flex items-center gap-2.5 rounded-2xl bg-ink text-white px-4 py-3 shadow-xl border border-lime/30 text-xs animate-in slide-in-from-top-3">
          <FiCheck className="text-lime text-base shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Unified Global Header */}
      <Header
        user={user}
        onRoleToggle={handleRoleToggle}
        onOpenCreateTask={() => setIsCreateModalOpen(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenQualification={() => setIsQualificationOpen(true)}
        onViewMyWork={() => setActiveTab('my-tasks')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Brand Banner Hero (Work-zilla Safety + UNU Modernity) */}
        <section className="grid-bg relative mb-8 overflow-hidden rounded-3xl bg-lime px-6 py-10 sm:px-10 lg:py-12 border border-ink/10 shadow-sm">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white/30 px-3 py-1 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-ink animate-ping" />
              <span>Garantie Séquestre & Micro-tâches 2.0</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-ink leading-[1.05]">
              {user.activeRole === 'CUSTOMER' ? (
                <>Déléguez vos tâches.<br /><em>Payez uniquement au résultat.</em></>
              ) : (
                <>Accomplissez des missions.<br /><em>Gains garantis sous séquestre.</em></>
              )}
            </h1>

            <p className="mt-4 text-xs sm:text-sm text-ink/75 leading-relaxed max-w-lg">
              {user.activeRole === 'CUSTOMER'
                ? "Créez une mission en 2 minutes. Vos fonds sont bloqués en toute sécurité et reversés uniquement lorsque vous validez le livrable de l'exécutant."
                : "Postulez à des micro-tâches vérifiées (code, rédaction, design, assistance). Vos gains sont bloqués d'avance et payés immédiatement."}
            </p>

            {/* Quick Hero Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              {user.activeRole === 'CUSTOMER' ? (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-ink/90 transition"
                >
                  <FiPlus className="text-lime text-base" />
                  <span>Publier une nouvelle tâche</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsQualificationOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-lime shadow-md hover:bg-ink/90 transition"
                >
                  <FiAward className="text-base" />
                  <span>Passer le test de qualification (Niveau Pro)</span>
                </button>
              )}

              <button
                onClick={() => setIsWalletOpen(true)}
                className="flex items-center gap-2 rounded-full border border-ink/20 bg-white/40 px-5 py-3 text-xs font-bold text-ink hover:bg-white/70 transition"
              >
                <FiShield />
                <span>Consulter mon séquestre (€{user.balanceEscrow.toFixed(2)})</span>
              </button>
            </div>
          </div>

          {/* Decorative Corner Badge */}
          <div className="hidden md:flex absolute right-10 bottom-8 flex-col items-end text-right">
            <div className="font-display text-4xl font-extrabold text-ink">99.4%</div>
            <div className="text-xs font-medium text-ink/70">Taux de résolution des missions</div>
            <div className="mt-2 text-[10px] text-ink/50 uppercase tracking-widest font-bold">
              Protégé par Escrow Tâches
            </div>
          </div>
        </section>

        {/* UNU-Style Filter Chips & Live Search Bar */}
        <section className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-4 top-3.5 text-ink/40 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par mot-clé (ex: Tailwind, SEO, Logo, B2B)..."
                className="w-full rounded-full border border-ink/15 bg-white py-2.5 pl-11 pr-4 text-xs text-ink outline-none transition focus:border-ink focus:ring-1 focus:ring-ink shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-[10px] text-ink/40 hover:text-ink font-bold"
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
                <span>Urgentes (&lt; 6h)</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setFilterUrgent(false);
                  setSearchQuery('');
                }}
                className="rounded-full bg-ink/5 px-3 py-2 text-xs font-medium text-ink/60 hover:text-ink hover:bg-ink/10 transition"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Category Filter Chips (UNU.im Inspired) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'Toutes les tâches' },
              { id: 'development', label: 'Code & Web' },
              { id: 'design', label: 'Design & Graphisme' },
              { id: 'assistance', label: 'Assistance Digitale' },
              { id: 'copywriting', label: 'Textes & Traduction' },
              { id: 'micro', label: 'Micro-tâches Rapides' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-ink text-lime shadow-xs scale-102'
                    : 'bg-white border border-ink/10 text-ink/70 hover:border-ink/30 hover:text-ink'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Task Cards Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink/60">
              {activeTab === 'explore'
                ? `Missions disponibles (${filteredTasks.length})`
                : user.activeRole === 'CUSTOMER'
                ? `Mes commandes publiées (${filteredTasks.length})`
                : `Mes missions attribuées (${filteredTasks.length})`}
            </h2>
            <span className="text-[11px] text-ink/40">
              Mise à jour en temps réel
            </span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-ink/20 bg-white p-12 text-center">
              <FiZap className="mx-auto text-3xl text-ink/30 mb-2" />
              <h3 className="font-display text-base font-bold text-ink">Aucune tâche trouvée</h3>
              <p className="mt-1 text-xs text-ink/60">
                Essayez d'élargir vos filtres ou de réinitialiser la recherche.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setFilterUrgent(false);
                  setSearchQuery('');
                }}
                className="mt-4 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-lime"
              >
                Voir toutes les missions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  userRole={user.activeRole}
                  onSelectTask={(t) => setSelectedTask(t)}
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
            <span>— Plateforme de micro-tâches & missions freelance sous séquestre sécurisé.</span>
          </div>
          <div className="flex gap-4 text-ink/75">
            <button onClick={() => setIsQualificationOpen(true)} className="hover:text-ink">
              Règles & Test
            </button>
            <button onClick={() => setIsWalletOpen(true)} className="hover:text-ink">
              Portefeuille
            </button>
            <a href="https://github.com/elmehdibadaoui/taches" target="_blank" rel="noreferrer" className="hover:text-ink">
              GitHub Repo
            </a>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      <TaskDetailModal
        task={selectedTask}
        user={user}
        onClose={() => setSelectedTask(null)}
        onApply={handleApply}
        onOpenProofDrawer={(task) => {
          setSelectedTask(null);
          setProofTask(task);
        }}
        onApproveWork={handleApproveWork}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
      />

      <ProofSubmissionDrawer
        task={proofTask}
        onClose={() => setProofTask(null)}
        onSubmitProof={handleSubmitProof}
      />

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        user={user}
        transactions={transactions}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
      />

      <QualificationModal
        isOpen={isQualificationOpen}
        onClose={() => setIsQualificationOpen(false)}
        onPassed={() => {
          setUser(prev => ({ ...prev, passedQualification: true }));
          showToast("Certification validée ! Vous avez débloqué l'accès aux missions Niveau Pro.");
        }}
      />
    </div>
  );
}
