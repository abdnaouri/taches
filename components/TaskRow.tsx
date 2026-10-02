'use client';

import React from 'react';
import { Task, UserRole } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { formatRelativeTime } from '@/lib/dateUtils';
import { getTaskSlug } from '@/lib/slug';
import {
  FiClock,
  FiUsers,
  FiMapPin,
  FiGlobe,
  FiCheckCircle,
  FiZap,
  FiArrowRight,
  FiArrowLeft,
  FiMessageSquare,
  FiUser
} from 'react-icons/fi';

interface TaskRowProps {
  task: Task;
  userRole?: UserRole;
  isMyTaskView?: boolean;
  onSelectTask?: (task: Task) => void;
  onActionClick?: (task: Task) => void;
  onOpenChat?: (task: Task) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  userRole,
  isMyTaskView = false,
  onSelectTask,
  onActionClick,
  onOpenChat,
}) => {
  const { t, locale, isRTL, getCategoryLabel } = useLanguage();
  const rewardDH = Math.round(task.reward * 10);
  const isUrgent = task.timeLimitHours <= 6;
  const slug = getTaskSlug(task);
  const taskUrl = `/${locale}/task/${slug}`;

  const handleClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (onSelectTask) {
      e.preventDefault();
      onSelectTask(task);
    }
  };

  // Status Badge Helper
  const getStatusBadge = () => {
    switch (task.status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[11px] font-extrabold">
            <FiClock className="animate-spin text-[10px]" /> En cours {task.assignedToName ? `(${task.assignedToName})` : ''}
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 text-[11px] font-extrabold">
            <FiCheckCircle className="text-[10px]" /> À vérifier
          </span>
        );
      case 'REVISION_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 text-rose-900 border border-rose-300 px-2 py-0.5 text-[11px] font-extrabold">
            ⚠️ Retouche demandée
          </span>
        );
      case 'ARBITRATION':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-orange-100 text-orange-900 border border-orange-300 px-2 py-0.5 text-[11px] font-extrabold">
            ⚖️ Arbitrage
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 text-[11px] font-extrabold">
            <FiCheckCircle className="text-[10px]" /> Terminée
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-600 border border-slate-300 px-2 py-0.5 text-[11px] font-bold">
            Annulée
          </span>
        );
      case 'OPEN':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 text-brand-900 border border-brand-200 px-2 py-0.5 text-[11px] font-bold">
            <FiUser className="text-[10px]" /> {task.applicantsCount} offre{task.applicantsCount > 1 ? 's' : ''}
          </span>
        );
    }
  };

  return (
    <a
      href={taskUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 bg-white hover:bg-amber-50/40 border border-slate-200 hover:border-brand-500 rounded-xl transition-all cursor-pointer shadow-2xs block no-underline text-inherit"
    >
      {/* Left: Task Info */}
      <div className="flex-1 min-w-0">
        {/* Badges line */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {getStatusBadge()}

          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            {task.subCategory || getCategoryLabel(task.category || 'all')}
          </span>

          {task.city ? (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200">
              <FiMapPin className="text-[10px]" /> {task.city}
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500">
              <FiGlobe className="text-[10px]" /> En ligne
            </span>
          )}

          {/* Multi-execution badge */}
          {task.taskMode === 'multi' && (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
              <FiUsers className="text-[10px]" /> Multi{task.targetExecutionsCount ? ` (${task.targetExecutionsCount})` : ''}
            </span>
          )}

          {isUrgent && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md border border-amber-300">
              <FiZap className="text-amber-700 text-[10px]" /> Urgent
            </span>
          )}

          <span className="text-[11px] text-slate-400 font-medium">
            {formatRelativeTime(task.createdAt, locale)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors leading-snug line-clamp-1">
          {task.title}
        </h3>

        {/* Snippet */}
        <p className="mt-1 text-xs text-slate-600 line-clamp-1">
          {task.description}
        </p>
      </div>

      {/* Right: Price & Quick Action */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Price Tag */}
        <div className="text-left sm:text-right">
          <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">
            {task.taskMode === 'multi' && task.unitPriceDH ? (
              <>
                {task.unitPriceDH} <span className="text-xs font-bold text-slate-500">DH/pers</span>
              </>
            ) : (
              <>
                {rewardDH} <span className="text-xs font-bold text-slate-500">DH</span>
              </>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Délai: {task.timeLimitHours}h
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Chat Shortcut */}
          {onOpenChat && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenChat(task);
              }}
              title="Discuter en direct"
              className="p-2 rounded-lg bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-800 border border-slate-200 transition cursor-pointer"
            >
              <FiMessageSquare className="text-xs" />
            </button>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onActionClick) {
                onActionClick(task);
              } else if (onSelectTask) {
                onSelectTask(task);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white px-3.5 py-2 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <span>{isMyTaskView ? 'Gérer' : 'Détails'}</span>
            {isRTL ? <FiArrowLeft className="text-xs" /> : <FiArrowRight className="text-xs" />}
          </button>
        </div>
      </div>
    </a>
  );
};
