'use client';

import React from 'react';
import { Task } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { formatRelativeTime } from '@/lib/dateUtils';
import { getTaskSlug } from '@/lib/slug';
import {
  FiClock,
  FiUsers,
  FiMapPin,
  FiGlobe,
  FiShield,
  FiZap,
  FiArrowUpRight,
  FiArrowUpLeft,
} from 'react-icons/fi';

interface TaskMiniCardProps {
  task: Task;
  onSelectTask?: (task: Task) => void;
}

export const TaskMiniCard: React.FC<TaskMiniCardProps> = ({
  task,
  onSelectTask,
}) => {
  const { locale, isRTL, getCategoryLabel } = useLanguage();
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

  return (
    <a
      href={taskUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 transition-all duration-200 hover:-translate-y-1 hover:border-brand-600 hover:shadow-lg cursor-pointer block no-underline text-inherit"
    >
      {/* Top Badges Row */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              {task.subCategory || getCategoryLabel(task.category || 'all')}
            </span>

            {task.city ? (
              <span className="inline-flex items-center gap-0.5 rounded-lg bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[10px] font-bold text-rose-800">
                <FiMapPin className="text-[9px]" /> {task.city}
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 rounded-lg bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                <FiGlobe className="text-[9px]" /> En ligne
              </span>
            )}

            {isUrgent && (
              <span className="inline-flex items-center gap-0.5 rounded-lg bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-800 animate-pulse">
                <FiZap className="text-amber-600 text-[9px]" /> Urgent
              </span>
            )}
          </div>

          {/* Daman Guarantee Shield */}
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md shrink-0"
            title="Paiement 100% garanti sous séquestre Daman"
          >
            <FiShield className="text-[10px]" /> Daman
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
          {task.title}
        </h3>

        {/* Description preview */}
        {task.description && (
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Bottom Row */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-base sm:text-lg font-black text-brand-700 tracking-tight">
            {rewardDH} DH
          </span>
          {task.taskMode === 'multi' && (
            <span className="text-[10px] text-slate-400 font-medium">/mission</span>
          )}
        </div>

        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
          <span className="flex items-center gap-1 font-medium" title="Candidatures reçues">
            <FiUsers className="text-slate-400 text-xs" />
            <span>{task.applicantsCount || 0}</span>
          </span>

          <span className="flex items-center gap-1 font-medium" title="Délai accordé">
            <FiClock className="text-slate-400 text-xs" />
            <span>{task.timeLimitHours}h</span>
          </span>

          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-brand-700 group-hover:text-white transition-all">
            {isRTL ? <FiArrowUpLeft className="text-xs" /> : <FiArrowUpRight className="text-xs" />}
          </span>
        </div>
      </div>
    </a>
  );
};

