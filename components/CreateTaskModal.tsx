'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { FiX, FiShield, FiArrowRight } from 'react-icons/fi';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (newTask: Omit<Task, 'id' | 'applicantsCount' | 'createdAt'>) => void;
  initialTitle?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  initialTitle = '',
}) => {
  const { t, isRTL } = useLanguage();
  const { profile, user: authUser } = useAuth();

  // Exactly 3 user fields
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState('');
  const [rewardDH, setRewardDH] = useState<number>(200);

  // Sync initialTitle when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialTitle) {
        setTitle(initialTitle);
      }
      setRewardDH(200);
      setDescription('');
    }
  }, [isOpen, initialTitle]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Internal accounting in EUR equivalent
  const rewardEur = Number((rewardDH / 10).toFixed(2));
  const platformFeeEur = Number((rewardEur * 0.10).toFixed(2));
  const totalBudgetEur = Number((rewardEur * 1.10).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !rewardDH || rewardDH <= 0) return;

    const clientId = profile?.id || authUser?.id || `usr_${Date.now()}`;
    const clientName = profile?.fullName ? `${profile.fullName} (Vous)` : 'Vous';
    const clientAvatar = profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';

    onCreateTask({
      title: title.trim(),
      description: description.trim(),
      status: 'OPEN',
      reward: rewardEur,
      platformFee: platformFeeEur,
      totalBudget: totalBudgetEur,
      timeLimitHours: 24, // Standard 24h default
      minLevelRequired: 1,
      clientId,
      clientName,
      clientAvatar,
      clientRating: profile?.customerRating || 5.0,
      clientHireRate: 100,
      requiredProofs: ['Livrable final validé'],
    });

    onClose();
  };


  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className={`absolute ${isRTL ? 'left-5' : 'right-5'
            } top-5 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer`}
        >
          <FiX className="text-lg" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 mb-2">
            <FiShield className="text-emerald-700" />
            <span>{t('createTaskHeaderBadge')}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('createTaskTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('simpleTaskSubtitle')}
          </p>
        </div>

        {/* ONE SIMPLE FORM: Title, Description, Price */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* FIELD 1: TITLE */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {t('titleLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('titlePlaceholder')}
              autoFocus={!initialTitle}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20 transition-all"
            />
          </div>

          {/* FIELD 2: DESCRIPTION */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {t('descLabel')} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descPlaceholder')}
              autoFocus={Boolean(initialTitle)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20 transition-all resize-y"
            />
          </div>

          {/* FIELD 3: PRICE (IN DIRHAMS - DH) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                {t('rewardPerformerLabel')} <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-semibold text-slate-500">
                (~{rewardEur} €)
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min={50}
                max={50000}
                step={10}
                required
                value={rewardDH || ''}
                onChange={(e) => setRewardDH(Math.max(0, Number(e.target.value)))}
                placeholder="200"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-extrabold text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20 transition-all"
              />
              <span
                className={`absolute ${isRTL ? 'left-4' : 'right-4'
                  } top-1/2 -translate-y-1/2 text-sm font-black text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-lg pointer-events-none`}
              >
                DH
              </span>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              <span className="text-[11px] font-medium text-slate-500 mr-1">
                {t('simpleTaskPriceQuick')}
              </span>
              {[50, 100, 200, 500, 1000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setRewardDH(amount)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${rewardDH === amount
                      ? 'bg-brand-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                >
                  {amount} DH
                </button>
              ))}
            </div>
          </div>

          {/* Reassurance Daman Escrow Notice */}
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50/80 p-3.5 border border-emerald-200 text-xs text-emerald-900">
            <FiShield className="text-lg text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t('escrowNoticeCreate')}
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !description.trim() || !rewardDH || rewardDH <= 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-40 disabled:pointer-events-none px-6 py-3 text-xs font-bold text-white shadow-md active:scale-98 transition cursor-pointer"
            >
              <span>{t('btnLockEscrowAndPost')}</span>
              <FiArrowRight className={`text-sm ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
