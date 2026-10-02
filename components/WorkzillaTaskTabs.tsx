'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Task, UserProfile, UserRole } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { TaskRow } from '@/components/TaskRow';
import { TaskCard } from '@/components/TaskCard';
import { sounds } from '@/lib/soundEffects';
import {
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiUsers,
  FiSearch,
  FiList,
  FiGrid,
  FiShield,
  FiPlus,
  FiMessageSquare,
  FiUploadCloud,
  FiCheck,
  FiRepeat,
  FiLock,
  FiTrash2,
  FiUserCheck,
  FiZap,
  FiFileText,
  FiAward
} from 'react-icons/fi';

export type WorkzillaTab = 'new' | 'open' | 'history' | 'examples';

interface WorkzillaTaskTabsProps {
  tasks: Task[];
  user: UserProfile | null;
  activeTab: WorkzillaTab;
  onTabChange: (tab: WorkzillaTab) => void;
  onSelectTask: (task: Task) => void;
  onOpenCreateTask: () => void;
  onOpenChatForTask?: (task: Task) => void;
  onOpenProofDrawer?: (task: Task) => void;
  onApproveTask?: (task: Task) => void;
  onRequestRevision?: (task: Task) => void;
  onCancelTask?: (task: Task) => void;
}

export const WorkzillaTaskTabs: React.FC<WorkzillaTaskTabsProps> = ({
  tasks,
  user,
  activeTab,
  onTabChange,
  onSelectTask,
  onOpenCreateTask,
  onOpenChatForTask,
  onOpenProofDrawer,
  onApproveTask,
  onRequestRevision,
  onCancelTask,
}) => {
  const { t, locale, isRTL, getCategoryLabel } = useLanguage();
  const isCustomer = user?.activeRole === 'CUSTOMER';
  const myId = user?.id || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'list' | 'grid'>('list');
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [customerScope, setCustomerScope] = useState<'all' | 'my_orders'>('all');

  const categories = ['all', 'development', 'design', 'assistance', 'copywriting', 'marketing', 'micro'] as const;

  // Helper to check if task was created by current user
  const isMyTask = (t: Task) => {
    if (myId && myId !== 'guest' && t.clientId && t.clientId === myId) return true;
    if (user?.fullName && t.clientName && t.clientName.toLowerCase().includes(user.fullName.toLowerCase())) return true;
    if (t.clientName?.includes('Vous') || t.clientName?.includes('You')) return true;
    return false;
  };

  // Group tasks according to role and view scope
  const { newTasks, openTasks, historyTasks } = useMemo(() => {
    if (isCustomer) {
      if (customerScope === 'all') {
        return {
          newTasks: tasks.filter((t) => t.status === 'OPEN'),
          openTasks: tasks.filter(
            (t) =>
              t.status === 'IN_PROGRESS' ||
              t.status === 'UNDER_REVIEW' ||
              t.status === 'REVISION_REQUESTED' ||
              t.status === 'ARBITRATION'
          ),
          historyTasks: tasks.filter(
            (t) => t.status === 'COMPLETED' || t.status === 'CANCELLED'
          ),
        };
      }

      const myCreated = tasks.filter(isMyTask);

      return {
        newTasks: myCreated.filter((t) => t.status === 'OPEN'),
        openTasks: myCreated.filter(
          (t) =>
            t.status === 'IN_PROGRESS' ||
            t.status === 'UNDER_REVIEW' ||
            t.status === 'REVISION_REQUESTED' ||
            t.status === 'ARBITRATION'
        ),
        historyTasks: myCreated.filter(
          (t) => t.status === 'COMPLETED' || t.status === 'CANCELLED'
        ),
      };
    } else {
      // Performer (Freelancer) Mode:
      // - New tasks: ALL open tasks on the platform ready for applicants
      // - Open tasks: tasks assigned to this performer in execution / review
      // - History: tasks completed or cancelled for this performer
      const myAssigned = tasks.filter(
        (t) =>
          (myId && myId !== 'guest' ? t.assignedToId === myId || t.assignedToName?.includes('Vous') : true)
      );

      return {
        newTasks: tasks.filter((t) => t.status === 'OPEN'),
        openTasks: myAssigned.filter(
          (t) =>
            t.status === 'IN_PROGRESS' ||
            t.status === 'UNDER_REVIEW' ||
            t.status === 'REVISION_REQUESTED' ||
            t.status === 'ARBITRATION'
        ),
        historyTasks: myAssigned.filter(
          (t) => t.status === 'COMPLETED' || t.status === 'CANCELLED'
        ),
      };
    }
  }, [tasks, isCustomer, myId, customerScope, user?.fullName]);

  // Current tab active list
  const currentList = useMemo(() => {
    switch (activeTab) {
      case 'open':
        return openTasks;
      case 'history':
        return historyTasks;
      case 'new':
      default:
        return newTasks;
    }
  }, [activeTab, newTasks, openTasks, historyTasks]);

  // Filtered by Search & Category
  const filteredList = useMemo(() => {
    let list = currentList;

    if (selectedCategory !== 'all') {
      list = list.filter((t) => t.category === selectedCategory);
    }

    if (filterUrgent) {
      list = list.filter((t) => t.timeLimitHours <= 6);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [currentList, selectedCategory, filterUrgent, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. TACHES.MA HIGH DENSITY TOP TAB SWITCHER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
        {/* Role Context Bar & Customer Scope Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-extrabold text-[11px] ${
              isCustomer ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
            }`}>
              <span>{isCustomer ? '💼 Vue Client / Donneur d’ordre' : '⚡ Vue Freelance / Prestataire'}</span>
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-500 text-[11px] hidden sm:inline">
              {isCustomer ? 'Gérez vos commandes ou parcourez les missions' : 'Postulez aux missions et suivez vos livrables'}
            </span>
          </div>

          {/* Customer Scope Pill Toggle */}
          {isCustomer && (
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setCustomerScope('my_orders')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  customerScope === 'my_orders'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mes commandes
              </button>
              <button
                type="button"
                onClick={() => setCustomerScope('all')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  customerScope === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Explorer le marché ({tasks.filter(t => t.status === 'OPEN').length})
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Main 3 Tâches.ma Tabs */}
          <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200 text-xs sm:text-sm font-extrabold flex-wrap gap-1">
            <button
              type="button"
              onClick={() => onTabChange('new')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-white text-brand-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span>🔴</span>
              <span>{isCustomer && customerScope === 'my_orders' ? 'Nouvelles commandes' : 'Nouvelles missions'}</span>
              <span
                className={`rounded-full px-2 py-0.2 text-[10px] font-black ${
                  activeTab === 'new'
                    ? 'bg-brand-100 text-brand-900'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {newTasks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('open')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'open'
                  ? 'bg-white text-brand-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FiClock className={openTasks.length > 0 ? 'text-amber-500 animate-spin' : ''} />
              <span>En cours</span>
              <span
                className={`rounded-full px-2 py-0.2 text-[10px] font-black ${
                  activeTab === 'open'
                    ? 'bg-amber-100 text-amber-950'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {openTasks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-brand-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FiCheckCircle className="text-emerald-600" />
              <span>Historique</span>
              <span
                className={`rounded-full px-2 py-0.2 text-[10px] font-black ${
                  activeTab === 'history'
                    ? 'bg-emerald-100 text-emerald-950'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {historyTasks.length}
              </span>
            </button>
          </div>

          {/* Action Button: Post Task */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenCreateTask}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-extrabold px-4 py-2.5 text-xs shadow-xs transition cursor-pointer"
            >
              <FiPlus className="text-sm font-black" />
              <span>Publier une mission</span>
            </button>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SEARCH & CONTROLS BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <FiSearch className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-3 text-slate-400 text-xs`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par mot-clé, consigne, ville..."
            className={`w-full rounded-xl border border-slate-300 bg-white py-2 ${
              isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
            } text-xs text-slate-900 outline-none focus:border-brand-700 shadow-2xs`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-2.5 text-[10px] text-slate-400 hover:text-slate-700`}
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* List vs Grid Layout */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewLayout('list')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewLayout === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              <FiList />
              <span>Liste</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('grid')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewLayout === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              <FiGrid />
              <span>Cartes</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setFilterUrgent(!filterUrgent)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition cursor-pointer ${
              filterUrgent
                ? 'border-amber-400 bg-amber-50 text-amber-900'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FiClock className={filterUrgent ? 'text-amber-600' : 'text-slate-400'} />
            <span>Urgent (&lt;6h)</span>
          </button>
        </div>
      </div>

      {/* 3. TASK CONTENT LIST / CARDS */}
      <div>
        {filteredList.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 text-xl mb-3">
              <FiFileText />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              {activeTab === 'new'
                ? isCustomer
                  ? 'Aucune commande en attente de candidats'
                  : 'Aucune nouvelle tâche dans cette catégorie'
                : activeTab === 'open'
                ? 'Aucune mission en cours d’exécution actuellement'
                : 'Aucune tâche archivée dans l’historique'}
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              {activeTab === 'new'
                ? isCustomer
                  ? 'Publiez une nouvelle tâche pour recevoir des propositions de freelances marocains vérifiés.'
                  : 'Modifiez vos filtres ou explorez toutes les catégories pour postuler.'
                : activeTab === 'open'
                ? 'Dès qu’une mission est acceptée ou assignée, son avancement apparaîtra ici avec son compte à rebours.'
                : 'Vos missions terminées, paiements et avis validés seront conservés ici.'}
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenCreateTask}
                className="rounded-xl bg-brand-700 hover:bg-brand-800 text-white px-5 py-2.5 text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Publier une mission
              </button>
            </div>
          </div>
        ) : viewLayout === 'list' ? (
          <div className="space-y-3">
            {filteredList.map((task) => {
              const isMulti = task.taskMode === 'multi';
              const rewardDH = Math.round(task.reward * 10);

              return (
                <div key={task.id} className="relative group bg-white border border-slate-200 rounded-2xl p-1 shadow-2xs hover:border-brand-400 transition">
                  <TaskRow
                    task={task}
                    userRole={user?.activeRole}
                    isMyTaskView={true}
                    onSelectTask={onSelectTask}
                    onOpenChat={onOpenChatForTask}
                  />

                  {/* Multi-execution spots progress bar if multi-task */}
                  {isMulti && task.targetExecutionsCount && task.targetExecutionsCount > 1 && (
                    <div className="px-4 py-2 bg-indigo-50/50 border-t border-slate-100 flex items-center justify-between text-xs rounded-b-xl">
                      <div className="flex items-center gap-2 font-bold text-indigo-950">
                        <FiUsers className="text-indigo-600" />
                        <span>Progression des places :</span>
                        <span className="text-indigo-800 font-extrabold">{task.applicantsCount} / {task.targetExecutionsCount}</span>
                      </div>
                      <div className="w-32 bg-indigo-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.round((task.applicantsCount / task.targetExecutionsCount) * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Quick Action Footer Bar */}
                  <div className="px-4 py-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                        <FiShield className="text-[10px]" /> Daman Séquestre {rewardDH} DH
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Direct Chat Button */}
                      {onOpenChatForTask && (
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playMessage();
                            onOpenChatForTask(task);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-800 text-slate-700 px-2.5 py-1 text-[11px] font-bold border border-slate-200 transition cursor-pointer"
                        >
                          <FiMessageSquare className="text-xs text-brand-700" />
                          <span>Chat direct</span>
                        </button>
                      )}

                      {/* Customer Action: Cancel open task if owner */}
                      {isCustomer && (task.clientId === myId || task.clientName.includes('Vous') || task.clientName.includes('You')) && task.status === 'OPEN' && onCancelTask && (
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playCash();
                            onCancelTask(task);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1 text-[11px] font-bold border border-rose-200 transition cursor-pointer"
                        >
                          <FiTrash2 className="text-xs" />
                          <span>Annuler</span>
                        </button>
                      )}

                      {/* Worker Action: Submit deliverable */}
                      {!isCustomer && (task.assignedToId === myId || !myId) && (task.status === 'IN_PROGRESS' || task.status === 'REVISION_REQUESTED') && onOpenProofDrawer && (
                        <button
                          type="button"
                          onClick={() => onOpenProofDrawer(task)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-[11px] font-extrabold shadow-2xs transition cursor-pointer"
                        >
                          <FiUploadCloud className="text-xs" />
                          <span>{task.status === 'REVISION_REQUESTED' ? 'Renvoyer la correction' : 'Envoyer le travail'}</span>
                        </button>
                      )}

                      {/* Worker Action: Quick Apply to open task */}
                      {!isCustomer && task.status === 'OPEN' && (
                        <button
                          type="button"
                          onClick={() => onSelectTask(task)}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-700 hover:bg-brand-800 text-white px-3 py-1 text-[11px] font-extrabold shadow-2xs transition cursor-pointer"
                        >
                          <FiZap className="text-xs text-amber-300" />
                          <span>Postuler</span>
                        </button>
                      )}

                      {/* Customer Action: Review submission */}
                      {isCustomer && task.status === 'UNDER_REVIEW' && (
                        <>
                          {onRequestRevision && (
                            <button
                              type="button"
                              onClick={() => onRequestRevision(task)}
                              className="inline-flex items-center gap-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 px-2.5 py-1 text-[11px] font-bold border border-amber-300 transition cursor-pointer"
                            >
                              <FiRepeat className="text-xs" />
                              <span>Retouche</span>
                            </button>
                          )}

                          {onApproveTask && (
                            <button
                              type="button"
                              onClick={() => {
                                sounds.playCash();
                                onApproveTask(task);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-brand-700 hover:bg-brand-800 text-white px-3 py-1 text-[11px] font-extrabold shadow-2xs transition cursor-pointer"
                            >
                              <FiCheck className="text-xs" />
                              <span>Valider & Payer ({rewardDH} DH)</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                userRole={user?.activeRole}
                userId={user?.id}
                onSelectTask={onSelectTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
