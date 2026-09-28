'use client';

import React from 'react';
import { Task, UserRole } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  FiClock,
  FiCheckCircle,
  FiUsers,
  FiArrowUpRight,
  FiArrowUpLeft,
  FiShield
} from 'react-icons/fi';

interface TaskCardProps {
  task: Task;
  userRole: UserRole;
  onSelectTask: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  userRole,
  onSelectTask,
}) => {
  const { t, isRTL } = useLanguage();
  const isAssignedToMe = task.assignedToId === 'usr_me_1';
  const rewardDH = Math.round(task.reward * 10);

  return (
    <div
      onClick={() => onSelectTask(task)}
      className={`group relative flex flex-col justify-between rounded-xl border bg-white p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${isAssignedToMe
          ? 'border-brand-600 ring-2 ring-brand-600/30'
          : 'border-slate-200 hover:border-brand-600'
        }`}
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {task.status === 'IN_PROGRESS' && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                <FiClock /> {t('statusInProgress')}
              </span>
            )}
          </div>

          {/* Reward badge (in Moroccan Dirhams DH + EUR in tooltip) */}
          <div
            className="flex items-baseline gap-1 rounded-lg bg-slate-900 text-white px-3 py-1 text-xs font-black shadow-2xs"
            title={`~€${task.reward.toFixed(2)}`}
          >
            <span>{rewardDH} DH</span>
          </div>
        </div>

        {/* Task Title */}
        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
          {task.title}
        </h3>

        {/* Description snippet */}
        <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">
          {task.description}
        </p>

        {/* Requirements summary */}
        {task.requiredProofs && task.requiredProofs.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <FiCheckCircle className="text-emerald-600 text-xs shrink-0" />
            <span className="truncate">
              {t('proofsRequiredCount', {
                count: task.requiredProofs.length,
                firstProof: task.requiredProofs[0]
              })}
            </span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
        {/* Client rating & stats */}
        <div className="flex items-center gap-2">
          <img
            src={task.clientAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
            alt={task.clientName}
            className="h-6 w-6 rounded-full object-cover border border-slate-300"
          />
          <div className="text-[11px] leading-tight">
            <div className="font-bold text-slate-900 truncate max-w-[120px]">{task.clientName}</div>
            <div className="text-slate-500 text-[10px]">
              ★ {task.clientRating} • {t('hireRate', { rate: task.clientHireRate })}
            </div>
          </div>
        </div>

        {/* Time limit & Applicants & Action Arrow */}
        <div className="flex items-center gap-3 text-slate-600 text-[11px]">
          <span className="flex items-center gap-1 font-medium" title={t('timeLimitTooltip')}>
            <FiClock className="text-slate-400" />
            <span>{t('hoursShort', { h: task.timeLimitHours })}</span>
          </span>

          <span className="flex items-center gap-1 font-medium" title={t('applicantsTooltip')}>
            <FiUsers className="text-slate-400" />
            <span>{task.applicantsCount}</span>
          </span>

          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-brand-700 group-hover:text-white transition-all">
            {isRTL ? <FiArrowUpLeft /> : <FiArrowUpRight />}
          </span>
        </div>
      </div>
    </div>
  );
};
