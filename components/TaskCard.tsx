'use client';

import React from 'react';
import { Task, UserRole } from '@/types/database';
import { 
  FiClock, 
  FiCheckCircle, 
  FiUsers, 
  FiArrowUpRight,
  FiCode,
  FiPenTool,
  FiFeather,
  FiShare2,
  FiZap
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
  const isAssignedToMe = task.assignedToId === 'usr_me_1';

  const categoryMeta: Record<string, { label: string; icon: React.ReactNode; bg: string }> = {
    development: { label: 'Code & Web', icon: <FiCode />, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    design: { label: 'Design & Graphisme', icon: <FiPenTool />, bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    assistance: { label: 'Assistance & Données', icon: <FiUsers />, bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    copywriting: { label: 'Rédaction & Traduction', icon: <FiFeather />, bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    marketing: { label: 'Marketing Digital', icon: <FiShare2 />, bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    micro: { label: 'Micro-tâche Rapide', icon: <FiZap />, bg: 'bg-lime/20 text-ink border-lime/40' },
  };

  const currentCat = categoryMeta[task.category] || categoryMeta.assistance;

  return (
    <div 
      onClick={() => onSelectTask(task)}
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
        isAssignedToMe
          ? 'border-lime-500/80 ring-2 ring-lime/40'
          : 'border-ink/10 hover:border-ink/30'
      }`}
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${currentCat.bg}`}>
              {currentCat.icon}
              <span>{currentCat.label}</span>
            </span>

            {task.status === 'IN_PROGRESS' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 animate-pulse">
                <FiClock /> En cours
              </span>
            )}
          </div>

          {/* Reward badge */}
          <div className="flex items-center gap-1 rounded-full bg-lime px-3 py-1 text-sm font-extrabold text-ink shadow-xs">
            €{task.reward.toFixed(2)}
          </div>
        </div>

        {/* Task Title */}
        <h3 className="font-display text-base font-bold text-ink leading-snug line-clamp-2 group-hover:text-ink/80 transition-colors">
          {task.title}
        </h3>

        {/* Description snippet */}
        <p className="mt-2 text-xs leading-relaxed text-ink/65 line-clamp-2">
          {task.description}
        </p>

        {/* Requirements summary */}
        {task.requiredProofs && task.requiredProofs.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-ink/75 bg-ink/3 px-2.5 py-1.5 rounded-lg border border-ink/5">
            <FiCheckCircle className="text-lime-600 text-xs shrink-0" />
            <span className="truncate">{task.requiredProofs.length} preuve(s) demandée(s) : {task.requiredProofs[0]}</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-ink/5 flex items-center justify-between text-xs">
        {/* Client rating & stats */}
        <div className="flex items-center gap-2">
          <img
            src={task.clientAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
            alt={task.clientName}
            className="h-6 w-6 rounded-full object-cover border border-ink/10"
          />
          <div className="text-[11px] leading-tight">
            <div className="font-semibold text-ink truncate max-w-[120px]">{task.clientName}</div>
            <div className="text-ink/50 text-[10px]">
              ★ {task.clientRating} • {task.clientHireRate}% embauche
            </div>
          </div>
        </div>

        {/* Time limit & Applicants */}
        <div className="flex items-center gap-3 text-ink/60 text-[11px]">
          <span className="flex items-center gap-1" title="Délai d'exécution après attribution">
            <FiClock className="text-ink/40" />
            <span>{task.timeLimitHours}h</span>
          </span>

          <span className="flex items-center gap-1" title="Candidatures reçues">
            <FiUsers className="text-ink/40" />
            <span>{task.applicantsCount}</span>
          </span>

          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink/5 group-hover:bg-ink group-hover:text-lime transition-all">
            <FiArrowUpRight className="text-xs" />
          </span>
        </div>
      </div>
    </div>
  );
};
