'use client';

import React, { useState } from 'react';
import { Task, TaskCategory } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  FiX, 
  FiPlus, 
  FiTrash2, 
  FiShield, 
  FiCheck
} from 'react-icons/fi';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (newTask: Omit<Task, 'id' | 'applicantsCount' | 'createdAt'>) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
}) => {
  const { t, getCategoryLabel, isRTL } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<TaskCategory>('development');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState<number>(30);
  const [timeLimitHours, setTimeLimitHours] = useState<number>(12);
  const [proofs, setProofs] = useState<string[]>([
    "Capture d'écran du résultat final",
    "Lien direct vers le livrable accessible"
  ]);
  const [newProofInput, setNewProofInput] = useState('');

  if (!isOpen) return null;

  const platformFee = Number((reward * 0.10).toFixed(2));
  const totalBudget = Number((reward + platformFee).toFixed(2));

  const handleAddProof = () => {
    if (!newProofInput.trim()) return;
    setProofs([...proofs, newProofInput.trim()]);
    setNewProofInput('');
  };

  const handleRemoveProof = (index: number) => {
    setProofs(proofs.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTask({
      title,
      description,
      category,
      status: 'OPEN',
      reward,
      platformFee,
      totalBudget,
      timeLimitHours,
      minLevelRequired: 1,
      clientId: 'usr_me_1',
      clientName: 'Aero Mehdi (Vous)',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      clientRating: 5.0,
      clientHireRate: 100,
      requiredProofs: proofs,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-cream p-6 sm:p-8 shadow-2xl border border-ink/15 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute ${isRTL ? 'left-5' : 'right-5'} top-5 rounded-full bg-ink/5 p-2 text-ink/70 hover:bg-ink hover:text-white transition-all`}
        >
          <FiX className="text-lg" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime text-ink font-bold text-xs">
            +
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-ink/50">
            {t('createTaskHeaderBadge')}
          </span>
        </div>
        <h2 className="font-display text-2xl font-bold text-ink">
          {t('createTaskTitle')}
        </h2>

        {/* Stepper Bar */}
        <div className="mt-4 flex items-center gap-2 border-b border-ink/10 pb-4 overflow-x-auto">
          <button
            onClick={() => setStep(1)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition whitespace-nowrap ${
              step === 1 ? 'bg-ink text-lime' : 'bg-white text-ink/60'
            }`}
          >
            {t('step1Tab')}
          </button>
          <button
            onClick={() => setStep(2)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition whitespace-nowrap ${
              step === 2 ? 'bg-ink text-lime' : 'bg-white text-ink/60'
            }`}
          >
            {t('step2Tab')}
          </button>
          <button
            onClick={() => setStep(3)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition whitespace-nowrap ${
              step === 3 ? 'bg-ink text-lime' : 'bg-white text-ink/60'
            }`}
          >
            {t('step3Tab')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* STEP 1: CATEGORY & TITLE */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-2">
                  {t('chooseCategory')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(['development', 'design', 'assistance', 'copywriting', 'marketing', 'micro'] as TaskCategory[]).map((catId) => (
                    <button
                      type="button"
                      key={catId}
                      onClick={() => setCategory(catId)}
                      className={`rounded-2xl p-3 ${isRTL ? 'text-right' : 'text-left'} border text-xs font-semibold transition ${
                        category === catId
                          ? 'border-ink bg-ink text-lime shadow-xs'
                          : 'border-ink/10 bg-white text-ink/80 hover:border-ink/30'
                      }`}
                    >
                      {getCategoryLabel(catId)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  {t('titleLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('titlePlaceholder')}
                  className="w-full rounded-2xl border border-ink/15 bg-white p-3.5 text-xs text-ink outline-none transition focus:border-ink focus:ring-1 focus:ring-ink"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!title.trim()}
                  className="rounded-full bg-ink px-6 py-2.5 text-xs font-bold text-lime disabled:opacity-40 transition"
                >
                  {t('btnContinueStep2')}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DESCRIPTION & PROOFS CHECKLIST */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  {t('descLabel')}
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('descPlaceholder')}
                  className="w-full rounded-2xl border border-ink/15 bg-white p-3.5 text-xs text-ink outline-none transition focus:border-ink focus:ring-1 focus:ring-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  {t('proofsRequiredLabel')}
                </label>
                <div className="space-y-2 mb-2">
                  {proofs.map((proof, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 rounded-xl bg-white p-2.5 border border-ink/10 text-xs">
                      <span className="text-ink">✓ {proof}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProof(i)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProofInput}
                    onChange={(e) => setNewProofInput(e.target.value)}
                    placeholder={t('proofPlaceholder')}
                    className="flex-1 rounded-xl border border-ink/15 bg-white px-3 py-2 text-xs text-ink outline-none focus:border-ink"
                  />
                  <button
                    type="button"
                    onClick={handleAddProof}
                    className="flex items-center gap-1 rounded-xl bg-ink/10 px-3 py-2 text-xs font-semibold text-ink hover:bg-ink/20"
                  >
                    <FiPlus /> {t('btnAddProof')}
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-ink/20 px-5 py-2.5 text-xs font-semibold text-ink"
                >
                  {t('btnBack')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!description.trim()}
                  className="rounded-full bg-ink px-6 py-2.5 text-xs font-bold text-lime disabled:opacity-40 transition"
                >
                  {t('btnContinueStep3')}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REWARD & ESCROW VAULT CALCULATION */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    {t('rewardPerformerLabel')}
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={2000}
                    value={reward}
                    onChange={(e) => setReward(Number(e.target.value))}
                    className="w-full rounded-2xl border border-ink/15 bg-white p-3.5 text-base font-bold text-ink outline-none focus:border-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    {t('timeAllowedLabel')}
                  </label>
                  <select
                    value={timeLimitHours}
                    onChange={(e) => setTimeLimitHours(Number(e.target.value))}
                    className="w-full rounded-2xl border border-ink/15 bg-white p-3.5 text-xs font-semibold text-ink outline-none focus:border-ink"
                  >
                    <option value={2}>{t('timeOption2h')}</option>
                    <option value={6}>{t('timeOption6h')}</option>
                    <option value={12}>{t('timeOption12h')}</option>
                    <option value={24}>{t('timeOption24h')}</option>
                    <option value={48}>{t('timeOption48h')}</option>
                    <option value={72}>{t('timeOption72h')}</option>
                  </select>
                </div>
              </div>

              {/* Work-zilla Transparent Escrow Breakdown */}
              <div className="rounded-2xl bg-white p-4 border border-ink/10 shadow-xs space-y-2 text-xs">
                <div className="flex items-center justify-between text-ink/70">
                  <span>{t('breakdownPerformerNet')}</span>
                  <span className="font-semibold text-ink">€{reward.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-ink/70">
                  <span>{t('breakdownPlatformFee')}</span>
                  <span className="font-semibold text-ink">€{platformFee.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-ink/10 flex items-center justify-between font-bold text-sm text-ink">
                  <span>{t('breakdownTotalEscrow')}</span>
                  <span className="text-base text-ink bg-lime px-2.5 py-0.5 rounded-full">
                    €{totalBudget.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-lime/20 p-3 border border-lime/40 text-xs text-ink">
                <FiShield className="text-base text-ink shrink-0" />
                <span>
                  {t('escrowNoticeCreate')}
                </span>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full border border-ink/20 px-5 py-2.5 text-xs font-semibold text-ink"
                >
                  {t('btnBack')}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-xs font-bold text-lime shadow-md hover:bg-ink/90 active:scale-95 transition"
                >
                  <FiCheck className="text-base" />
                  <span>{t('btnLockEscrowAndPost')}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
