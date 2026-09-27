'use client';

import React, { useState, useEffect } from 'react';
import { Task, UserProfile, UserRole } from '@/types/database';
import { 
  FiX, 
  FiClock, 
  FiShield, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiSend, 
  FiCheck,
  FiUploadCloud,
  FiDollarSign,
  FiAward
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
  const [pitch, setPitch] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState('03:17:42');

  useEffect(() => {
    if (!task) return;
    // Simulate live ticking countdown for active tasks
    const timer = setInterval(() => {
      const now = new Date();
      const seconds = 59 - now.getSeconds();
      const minutes = 59 - now.getMinutes();
      setTimeLeft(`02:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [task]);

  if (!task) return null;

  const isCustomer = user.activeRole === 'CUSTOMER';
  const isAssignedToMe = task.assignedToId === user.id;

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch.trim()) return;
    onApply(task.id, pitch);
    setAppliedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-cream p-6 sm:p-8 shadow-2xl border border-ink/15 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full bg-ink/5 p-2 text-ink/70 hover:bg-ink hover:text-white transition-all"
        >
          <FiX className="text-lg" />
        </button>

        {/* Header Tag + Title */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="rounded-full bg-ink text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            {task.category}
          </span>
          <span className="rounded-full bg-lime text-ink px-3 py-1 text-xs font-bold">
            Rémunération : €{task.reward.toFixed(2)}
          </span>
          <span className="rounded-full bg-white border border-ink/10 px-3 py-1 text-xs font-medium text-ink/70">
            Délai imparti : {task.timeLimitHours}h
          </span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink leading-tight">
          {task.title}
        </h2>

        {/* Work-zilla Escrow Trust Banner */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4 border border-ink/10 shadow-xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime/30 text-ink">
            <FiShield className="text-xl text-ink" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-ink flex items-center gap-1.5">
              <span>Garantie Séquestre Tâches (Escrow Work-zilla)</span>
              <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 font-semibold">100% Protégé</span>
            </div>
            <p className="text-ink/65 mt-0.5">
              Les fonds de cette mission sont déjà bloqués sur un compte tiers neutre. Le virement est instantané dès validation du livrable.
            </p>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-2">Description du besoin</h4>
          <p className="text-sm leading-relaxed text-ink/80 whitespace-pre-line bg-white/70 p-4 rounded-2xl border border-ink/5">
            {task.description}
          </p>
        </div>

        {/* Required Proofs Checklist (UNU Inspired) */}
        {task.requiredProofs && task.requiredProofs.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-2">
              Preuves & Livrables obligatoires pour validation
            </h4>
            <div className="space-y-2">
              {task.requiredProofs.map((proof, idx) => (
                <div key={idx} className="flex items-start gap-2.5 rounded-xl bg-white p-3 border border-ink/5 text-xs text-ink">
                  <FiCheckCircle className="text-lime-600 mt-0.5 shrink-0 text-sm" />
                  <span>{proof}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Client Reputation Details */}
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/60 p-4 border border-ink/5">
          <div className="flex items-center gap-3">
            <img
              src={task.clientAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
              alt={task.clientName}
              className="h-10 w-10 rounded-full object-cover border border-ink/10"
            />
            <div>
              <div className="text-xs font-bold text-ink">{task.clientName}</div>
              <div className="text-[11px] text-ink/60">
                Score client : ★ {task.clientRating} • {task.clientHireRate}% des tâches rémunérées
              </div>
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="text-ink/50">Candidatures</div>
            <div className="font-bold text-ink">{task.applicantsCount} reçues</div>
          </div>
        </div>

        {/* Action Panel Based on Role and State */}
        <div className="mt-8 pt-6 border-t border-ink/10">
          {/* Scenario 1: Performer viewing active assigned task */}
          {isAssignedToMe && task.status === 'IN_PROGRESS' && (
            <div className="rounded-2xl bg-amber-50 p-5 border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <FiClock className="animate-spin text-base" />
                  <span>Mission en cours d'exécution</span>
                </div>
                <div className="font-mono text-base font-extrabold text-amber-950 bg-amber-200/60 px-3 py-1 rounded-full">
                  Temps restant : {timeLeft}
                </div>
              </div>
              <p className="text-xs text-amber-800 mb-4">
                Vous avez été sélectionné pour cette mission. Envoyez vos livrables ou captures d'écran avant l'expiration du décompte.
              </p>
              <button
                onClick={() => onOpenProofDrawer(task)}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-ink py-3 text-xs font-semibold text-lime shadow-md hover:bg-ink/90 transition-all"
              >
                <FiUploadCloud className="text-base" />
                <span>Soumettre mon travail & les preuves (Gagner €{task.reward.toFixed(2)})</span>
              </button>
            </div>
          )}

          {/* Scenario 2: Performer viewing open task to apply */}
          {!isCustomer && !isAssignedToMe && task.status === 'OPEN' && (
            <div>
              {appliedSuccess ? (
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <FiCheck className="text-lg text-emerald-600" />
                  <span>Votre proposition a été envoyée avec succès au client ! Vous serez notifié dès attribution.</span>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-3">
                  <label className="block text-xs font-bold text-ink">
                    Proposer votre candidature (Pitch express) :
                  </label>
                  <textarea
                    rows={3}
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    placeholder="Expliquez brièvement comment vous allez réaliser cette tâche dans les temps..."
                    className="w-full rounded-2xl border border-ink/15 bg-white p-3.5 text-xs text-ink outline-none transition focus:border-ink focus:ring-1 focus:ring-ink"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-ink/50">
                      Commission perçue (Niveau 3) : €{(task.reward * 0.85).toFixed(2)} net
                    </span>
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-full bg-lime px-6 py-2.5 text-xs font-bold text-ink shadow-sm hover:bg-lime/90 active:scale-95 transition-all"
                    >
                      <FiSend />
                      <span>Postuler à cette mission</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Scenario 3: Customer viewing their own task */}
          {isCustomer && (
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-ink/10">
              <div className="text-xs">
                <span className="font-semibold text-ink">Gestionnaire de commande</span>
                <p className="text-ink/60">Vous pouvez examiner les offres ou clôturer la mission.</p>
              </div>
              <button
                onClick={() => {
                  onApproveWork(task.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
              >
                <FiCheck /> Valider & Débloquer le paiement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
