'use client';

import React, { useState, useEffect } from 'react';
import { Task, UserProfile } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  FiX,
  FiClock,
  FiCheckCircle,
  FiShield,
  FiUploadCloud,
  FiSend,
  FiCheck
} from 'react-icons/fi';

interface TaskDetailModalProps {
  task: Task | null;
  user: UserProfile;
  onClose: () => void;
  onApply: (taskId: string, pitch: string) => void;
  onOpenProofDrawer: (task: Task) => void;
  onApproveWork: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  user,
  onClose,
  onApply,
  onOpenProofDrawer,
  onApproveWork,
}) => {
  const { t, isRTL } = useLanguage();
  const [pitch, setPitch] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState('05:42:10');

  useEffect(() => {
    if (task && task.status === 'IN_PROGRESS') {
      const timer = setInterval(() => {
        const h = Math.floor(Math.random() * 5);
        const m = Math.floor(Math.random() * 59);
        const s = Math.floor(Math.random() * 59);
        setTimeLeft(`${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [task]);

  if (!task) return null;

  const isCustomer = user.activeRole === 'CUSTOMER';
  const isAssignedToMe = task.assignedToId === user.id;
  const rewardDH = Math.round(task.reward * 10);
  const rewardEur = Math.round(task.reward);
  const netDH = Math.round(rewardDH * 0.90);
  const netEur = Math.round(rewardEur * 0.90);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch.trim()) return;
    onApply(task.id, pitch);
    setAppliedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute ${isRTL ? 'left-5' : 'right-5'} top-5 rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer`}
        >
          <FiX className="text-lg" />
        </button>

        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">

          <span className="rounded-lg bg-brand-50 border border-brand-200 text-brand-800 px-3 py-1 text-xs font-black">
            {t('rewardLabel', { amount: rewardDH, eur: rewardEur })}
          </span>
          <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            {t('timeLimitLabel', { hours: task.timeLimitHours })}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
          {task.title}
        </h2>

        {/* Description Section */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            {t('needDescriptionTitle')}
          </h4>
          <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
            {task.description}
          </p>
        </div>

        {/* Client Details */}
        <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <img
              src={task.clientAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
              alt={task.clientName}
              className="h-10 w-10 rounded-full object-cover border border-slate-300"
            />
            <div>
              <div className="text-xs font-bold text-slate-900">{task.clientName}</div>
              <div className="text-[11px] text-slate-500 font-medium">
                {t('clientRatingLabel', { rating: task.clientRating, hireRate: task.clientHireRate })}
              </div>
            </div>
          </div>
          <div className={`${isRTL ? 'text-left' : 'text-right'} text-xs`}>
            <div className="text-slate-500 font-medium">{t('applicantsTitle')}</div>
            <div className="font-extrabold text-slate-900">{t('applicantsReceived', { count: task.applicantsCount })}</div>
          </div>
        </div>

        {/* Action Panel Based on Role and State */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          {/* Scenario 1: Performer viewing active assigned task */}
          {isAssignedToMe && task.status === 'IN_PROGRESS' && (
            <div className="rounded-xl bg-amber-50 p-5 border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <FiClock className="animate-spin text-base" />
                  <span>{t('inProgressBannerTitle')}</span>
                </div>
                <div className="font-mono text-sm font-extrabold text-amber-950 bg-amber-200 px-3 py-1 rounded-lg">
                  {t('timeLeftLabel', { time: timeLeft })}
                </div>
              </div>
              <p className="text-xs text-amber-800 mb-4">
                {t('inProgressBannerDesc')}
              </p>
              <button
                onClick={() => onOpenProofDrawer(task)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              >
                <FiUploadCloud className="text-base" />
                <span>{t('btnSubmitProofAndEarn', { amount: rewardDH })}</span>
              </button>
            </div>
          )}

          {/* Scenario 2: Performer viewing open task to apply */}
          {!isCustomer && !isAssignedToMe && task.status === 'OPEN' && (
            <div>
              {appliedSuccess ? (
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <FiCheck className="text-lg text-emerald-600 shrink-0" />
                  <span>{t('appliedSuccessMsg')}</span>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-3">
                  <label className="block text-xs font-bold text-slate-800">
                    {t('applyPitchLabel')}
                  </label>
                  <textarea
                    rows={3}
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    placeholder={t('applyPitchPlaceholder')}
                    className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs text-slate-900 outline-none transition focus:border-brand-700"
                    required
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {t('applyFeeNotice', { net: netDH, eur: netEur })}
                    </span>
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                    >
                      <FiSend className={isRTL ? 'rotate-180' : ''} />
                      <span>{t('btnApply')}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Scenario 3: Customer viewing their own task */}
          {isCustomer && (
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs">
                <span className="font-bold text-slate-900">{t('customerManagerTitle')}</span>
                <p className="text-slate-600">{t('customerManagerDesc')}</p>
              </div>
              <button
                onClick={() => {
                  onApproveWork(task.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
              >
                <FiCheck /> {t('btnApproveAndRelease')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
