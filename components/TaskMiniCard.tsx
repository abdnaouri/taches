'use client';

import React from 'react';
import { Task } from '@/types/database';

interface TaskMiniCardProps {
  task: Task;
  onSelectTask: (task: Task) => void;
}

export const TaskMiniCard: React.FC<TaskMiniCardProps> = ({
  task,
  onSelectTask,
}) => {
  const rewardDH = Math.round(task.reward * 10);

  return (
    <div
      onClick={() => onSelectTask(task)}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 sm:p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-md cursor-pointer"
    >
      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
        {task.title}
      </h3>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-base sm:text-lg font-black text-brand-700">
          {rewardDH} DH
        </span>
      </div>
    </div>
  );
};
