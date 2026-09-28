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
  FiCheck,
  FiMapPin,
  FiGlobe,
  FiLink,
  FiHelpCircle,
  FiZap,
  FiArrowRight,
  FiDollarSign
} from 'react-icons/fi';

interface TaskDetailModalProps {
  task: Task | null;
  user: UserProfile | null;
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
  const { t, isRTL, getCategoryLabel } = useLanguage();
  const [pitch, setPitch] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState('05:42:10');

  // Quick 1-click pitch templates
  const quickPitches = [
    '⚡ Disponible immédiatement, travail soigné et rapide garanti.',
    '🎨 Expérience confirmée dans ce domaine avec réalisations similaires.',
    '📄 Parfaite maîtrise des consignes, livraison conforme avant le délai.',
  ];

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

  const isCustomer = user?.activeRole === 'CUSTOMER';
  const isAssignedToMe = task.assignedToId === user?.id;
  const isMyPostedTask = user ? (task.clientId === user.id || task.clientName.includes('Vous') || task.clientName.includes('You')) : false;

  const rewardDH = Math.round(task.reward * 10);
  const rewardEur = Math.round(task.reward);
  const netDH = Math.round(rewardDH * 0.9);
  const netEur = Math.round(rewardEur * 0.9);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPitch = pitch.trim() || 'Disponible immédiatement pour réaliser cette tâche selon vos consignes.';
    onApply(task.id, finalPitch);
    setAppliedSuccess(true);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className={`absolute ${
            isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
          } top-4 sm:top-6 rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer z-10`}
        >
          <FiX className="text-lg" />
        </button>

        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mb-3 pr-10">
          <span className="rounded-xl bg-slate-900 text-white px-3.5 py-1 text-xs font-black shadow-2xs">
            {rewardDH} DH <span className="text-[10px] text-slate-300 font-normal">(~{rewardEur} €)</span>
          </span>

          <span className="rounded-xl bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-bold text-brand-800">
            {task.subCategory || getCategoryLabel(task.category || 'all')}
          </span>

          {task.city ? (
            <span className="inline-flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-bold text-rose-800">
              <FiMapPin /> {task.city}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
              <FiGlobe /> En ligne
            </span>
          )}

          <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
            <FiClock /> Délai : {task.timeLimitHours}h
          </span>
        </div>

        {/* Task Title */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
          {task.title}
        </h2>

        {/* Escrow Guarantee Pill Banner */}
        <div className="mt-3.5 flex items-center gap-2.5 rounded-2xl bg-emerald-50 p-3.5 border border-emerald-200 text-xs text-emerald-900 font-semibold">
          <FiShield className="text-emerald-700 text-lg shrink-0" />
          <span>
            {t('escrowBannerDesc')}
          </span>
        </div>

        {/* Description Section */}
        <div className="mt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Description de la mission
          </h4>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200 font-normal">
            {task.description}
          </p>
        </div>

        {/* Required Deliverables Checklist */}
        {task.requiredProofs && task.requiredProofs.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Livrables attendus pour validation :
            </h4>
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              {task.requiredProofs.map((proof, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-800">
                  <FiCheckCircle className="text-emerald-600 text-sm shrink-0" />
                  <span>{proof}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reference Links if present */}
        {task.referenceLinks && task.referenceLinks.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Liens & Fichiers de référence :
            </h4>
            <div className="space-y-1">
              {task.referenceLinks.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-brand-700 font-bold hover:underline"
                >
                  <FiLink /> {link}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Client Details */}
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <img
              src={
                task.clientAvatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'
              }
              alt={task.clientName}
              className="h-10 w-10 rounded-full object-cover border border-slate-300"
            />
            <div>
              <div className="text-xs font-bold text-slate-900">{task.clientName}</div>
              <div className="text-[11px] text-slate-500 font-medium">
                ★ {task.clientRating} • {task.clientHireRate}% embauche
              </div>
            </div>
          </div>
          <div className={`${isRTL ? 'text-left' : 'text-right'} text-xs`}>
            <div className="text-slate-500 font-medium">Offres reçues</div>
            <div className="font-extrabold text-slate-900">
              {task.applicantsCount} proposition{task.applicantsCount > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Action Panel Based on Role and State */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          
          {/* Scenario 1: Performer viewing active assigned task */}
          {isAssignedToMe && task.status === 'IN_PROGRESS' && (
            <div className="rounded-2xl bg-amber-50 p-5 border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <FiClock className="animate-spin text-base" />
                  <span>Mission en cours d’exécution</span>
                </div>
                <div className="font-mono text-sm font-extrabold text-amber-950 bg-amber-200 px-3 py-1 rounded-lg">
                  {timeLeft}
                </div>
              </div>
              <p className="text-xs text-amber-800 mb-4">
                Vous avez été retenu pour cette mission. Déposez vos livrables dès que le travail est prêt.
              </p>
              <button
                onClick={() => onOpenProofDrawer(task)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all cursor-pointer"
              >
                <FiUploadCloud className="text-base" />
                <span>Envoyer le travail & Encaisser {rewardDH} DH</span>
              </button>
            </div>
          )}

          {/* Scenario 2: Performer viewing open task to apply */}
          {!isCustomer && !isAssignedToMe && task.status === 'OPEN' && (
            <div>
              {appliedSuccess ? (
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <FiCheck className="text-lg text-emerald-600 shrink-0" />
                  <span>Votre proposition a été transmise au client avec succès ! Vous recevrez une alerte dès validation.</span>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Votre message de candidature :
                    </label>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Gain net : <strong className="text-emerald-700">{netDH} DH</strong> (~{netEur} €)
                    </span>
                  </div>

                  {/* 1-Click Fast Pitch Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {quickPitches.map((qp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPitch(qp)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-left transition cursor-pointer"
                      >
                        {qp}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    placeholder="Expliquez en 1 ou 2 phrases votre méthode ou cliquez sur une suggestion ci-dessus..."
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none transition focus:border-brand-700"
                  />

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all cursor-pointer active:scale-98"
                  >
                    <FiSend className={isRTL ? 'rotate-180' : ''} />
                    <span>Postuler pour {rewardDH} DH</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Scenario 3: Customer viewing their own task */}
          {(isCustomer || isMyPostedTask) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">
                  Espace Donneur d’ordre (Client)
                </span>
                <p className="text-slate-600">
                  {task.status === 'UNDER_REVIEW'
                    ? 'Le freelance a soumis son travail. Examinez-le et validez le paiement.'
                    : 'Votre tâche est active. Vous recevrez des alertes à chaque nouvelle offre.'}
                </p>
              </div>

              {task.status === 'UNDER_REVIEW' && (
                <button
                  onClick={() => {
                    onApproveWork(task.id);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white transition cursor-pointer shrink-0 shadow-sm"
                >
                  <FiCheck /> Valider le travail & Débloquer {rewardDH} DH
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
