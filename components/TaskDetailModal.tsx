'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Task, UserProfile, TaskBid, TaskMessage } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
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
  FiUser,
  FiMessageSquare,
  FiStar,
  FiAlertTriangle,
  FiRepeat,
  FiLoader
} from 'react-icons/fi';

interface TaskDetailModalProps {
  task: Task | null;
  user: UserProfile | null;
  onClose: () => void;
  onApply: (taskId: string, pitch: string) => void;
  onOpenProofDrawer: (task: Task) => void;
  onApproveWork: (taskId: string, review?: { rating: number; comment: string }) => void;
  onAssignPerformer?: (taskId: string, performerId: string, performerName: string) => void;
  onRequestRevision?: (taskId: string, feedback: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  user,
  onClose,
  onApply,
  onOpenProofDrawer,
  onApproveWork,
  onAssignPerformer,
  onRequestRevision,
}) => {
  const { t, isRTL, locale, getCategoryLabel } = useLanguage();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [activeModalTab, setActiveModalTab] = useState<'details' | 'chat' | 'bids'>('details');
  const [pitch, setPitch] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  // Bids / Applicants State for Client
  const [bids, setBids] = useState<TaskBid[]>([]);
  const [isLoadingBids, setIsLoadingBids] = useState(false);

  // In-Task Realtime Chat State
  const [messages, setMessages] = useState<TaskMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Review & Approval State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('Travail sérieux et rapide, je recommande !');

  // Revision Request State
  const [isRevisionInputOpen, setIsRevisionInputOpen] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');

  // Fast 1-click pitch templates
  const quickPitches = [
    '⚡ Disponible immédiatement, travail soigné et rapide garanti.',
    '🎨 Expérience confirmée dans ce domaine avec réalisations similaires.',
    '📄 Parfaite maîtrise des consignes, livraison conforme avant le délai.',
  ];

  // 1. Real Dynamic Countdown Timer
  useEffect(() => {
    if (!task || task.status !== 'IN_PROGRESS' || !task.assignedAt) {
      setTimeLeft('');
      return;
    }

    const calculateTime = () => {
      const start = new Date(task.assignedAt!).getTime();
      const limitMs = (task.timeLimitHours || 24) * 3600 * 1000;
      const deadline = start + limitMs;
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        setIsTimeExpired(true);
        setTimeLeft('Délai expiré');
      } else {
        setIsTimeExpired(false);
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [task]);

  // 2. Fetch Bids if task is open or client is owner
  useEffect(() => {
    if (task?.id) {
      setIsLoadingBids(true);
      fetch(`/api/bids?taskId=${task.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.bids) {
            setBids(data.bids);
          }
        })
        .catch(err => console.warn('Failed to fetch bids:', err))
        .finally(() => setIsLoadingBids(false));
    }
  }, [task?.id]);

  // 3. Fetch In-Task Messages
  useEffect(() => {
    if (task?.id) {
      fetch(`/api/messages?taskId=${task.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.messages) {
            setMessages(data.messages);
          }
        })
        .catch(err => console.warn('Failed to fetch task messages:', err));
    }
  }, [task?.id]);

  useEffect(() => {
    if (activeModalTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeModalTab]);

  if (!task) return null;

  const isCustomer = user?.activeRole === 'CUSTOMER';
  const isAssignedToMe = user ? task.assignedToId === user.id : false;
  const isMyPostedTask = user ? (task.clientId === user.id || task.clientName.includes('Vous') || task.clientName.includes('You')) : false;

  const rewardDH = Math.round(task.reward * 10);
  const rewardEur = Math.round(task.reward);
  const netDH = Math.round(rewardDH * 0.85); // 15% platform commission
  const netEur = Math.round(rewardEur * 0.85);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login', 'Connectez-vous pour postuler');
      return;
    }
    const finalPitch = pitch.trim() || 'Disponible immédiatement pour réaliser cette tâche selon vos consignes.';
    onApply(task.id, finalPitch);
    setAppliedSuccess(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;

    setIsSendingMessage(true);
    const content = chatInput.trim();
    setChatInput('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          senderId: user.id,
          senderName: user.fullName || 'Utilisateur',
          senderAvatar: user.avatarUrl || '',
          receiverId: isMyPostedTask ? task.assignedToId : task.clientId,
          content,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages(prev => [...prev, data.message]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleApproveWithReview = () => {
    onApproveWork(task.id, { rating: ratingScore, comment: reviewComment });
    setIsReviewModalOpen(false);
    onClose();
  };

  const handleSendRevision = () => {
    if (!revisionFeedback.trim()) return;
    if (onRequestRevision) {
      onRequestRevision(task.id, revisionFeedback.trim());
    }
    setIsRevisionInputOpen(false);
    onClose();
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
            {task.taskMode === 'multi' && task.unitPriceDH ? (
              <span>{task.unitPriceDH} DH/personne <span className="text-[10px] text-slate-300 font-normal">({rewardDH} DH total)</span></span>
            ) : (
              <span>{rewardDH} DH <span className="text-[10px] text-slate-300 font-normal">(~{rewardEur} €)</span></span>
            )}
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

        {/* Modal Navigation Tabs */}
        <div className="mt-4 flex border-b border-slate-200 gap-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveModalTab('details')}
            className={`pb-2.5 transition border-b-2 cursor-pointer ${
              activeModalTab === 'details'
                ? 'border-brand-700 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Détails & Consignes
          </button>

          {(isMyPostedTask || isAssignedToMe) && (
            <button
              type="button"
              onClick={() => setActiveModalTab('chat')}
              className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeModalTab === 'chat'
                  ? 'border-brand-700 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FiMessageSquare />
              <span>Discussion en direct ({messages.length})</span>
            </button>
          )}

          {isMyPostedTask && task.status === 'OPEN' && (
            <button
              type="button"
              onClick={() => setActiveModalTab('bids')}
              className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeModalTab === 'bids'
                  ? 'border-brand-700 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FiUser />
              <span>Candidatures reçues ({bids.length})</span>
            </button>
          )}
        </div>

        {/* TAB 1: DETAILS */}
        {activeModalTab === 'details' && (
          <div className="mt-4 space-y-4">
            {/* Escrow Guarantee Pill Banner */}
            <div className="flex items-center gap-2.5 rounded-2xl bg-brand-50 p-3.5 border border-brand-200 text-xs text-brand-900 font-semibold">
              <FiShield className="text-brand-700 text-lg shrink-0" />
              <span>{t('escrowBannerDesc')}</span>
            </div>

            {/* Description Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Description de la mission
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200 font-normal">
                {task.description}
              </p>
            </div>

            {/* Required Deliverables Checklist */}
            {task.requiredProofs && task.requiredProofs.length > 0 && (
              <div>
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

            {/* Client Details */}
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src={task.clientAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
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
                  {task.applicantsCount || bids.length} proposition{(task.applicantsCount || bids.length) > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: IN-TASK LIVE CHAT */}
        {activeModalTab === 'chat' && (
          <div className="mt-4 flex flex-col h-80 bg-slate-50 rounded-2xl border border-slate-200 p-3">
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                  <FiMessageSquare className="text-2xl mb-1 text-slate-300" />
                  <span>Aucun message échangé pour le moment. Posez vos questions ou donnez des précisions ici.</span>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-slate-500 mb-0.5 px-1 font-semibold">
                        {isMe ? 'Vous' : m.senderName}
                      </div>
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-xs max-w-[80%] leading-relaxed ${
                          isMe
                            ? 'bg-brand-700 text-white rounded-br-xs'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSendMessage} className="mt-2.5 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Écrivez un message direct..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-brand-700"
              />
              <button
                type="submit"
                disabled={isSendingMessage || !chatInput.trim()}
                className="rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white hover:bg-brand-800 transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                <FiSend />
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: CANDIDATURES / BIDS (CLIENT VIEW) */}
        {activeModalTab === 'bids' && (
          <div className="mt-4 space-y-3">
            {isLoadingBids ? (
              <div className="py-12 flex justify-center items-center text-slate-500 text-xs">
                <FiLoader className="animate-spin text-lg mr-2" /> Chargement des offres...
              </div>
            ) : bids.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                Aucune candidature pour le moment. Votre tâche est visible par la communauté.
              </div>
            ) : (
              bids.map((bid) => (
                <div key={bid.id} className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={bid.performerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                        alt={bid.performerName}
                        className="h-9 w-9 rounded-full object-cover border border-slate-300"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{bid.performerName}</div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          ★ {bid.performerRating} • {bid.performerCompletedCount} missions réussies
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      Sous ~{bid.proposedHours}h
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 italic">
                    « {bid.pitch} »
                  </p>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (onAssignPerformer) {
                          onAssignPerformer(task.id, bid.performerId, bid.performerName);
                          onClose();
                        }
                      }}
                      className="rounded-xl bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <FiCheck /> Choisir ce freelance
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Action Panel Based on Role and State */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          
          {/* Scenario 1: Performer viewing active assigned task */}
          {isAssignedToMe && task.status === 'IN_PROGRESS' && (
            <div className="rounded-2xl bg-amber-50 p-5 border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <FiClock className={`${isTimeExpired ? 'text-rose-600' : 'animate-spin'} text-base`} />
                  <span>{isTimeExpired ? 'Délai imparti écoulé' : 'Mission en cours d’exécution'}</span>
                </div>
                <div className={`font-mono text-sm font-extrabold px-3 py-1 rounded-lg ${
                  isTimeExpired ? 'bg-rose-200 text-rose-950' : 'bg-amber-200 text-amber-950'
                }`}>
                  {timeLeft || `${task.timeLimitHours}h restantes`}
                </div>
              </div>
              <p className="text-xs text-amber-800 mb-4">
                Vous êtes assigné à cette mission. Déposez vos livrables dès que le travail est prêt.
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
                  <span>Votre proposition a été transmise au donneur d’ordre. Vous recevrez une alerte dès sélection.</span>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Votre proposition pour le client :
                    </label>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Gain net : <strong className="text-emerald-700">{netDH} DH</strong> (~{netEur} €)
                    </span>
                  </div>

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
                    placeholder="Expliquez en 1 ou 2 phrases votre méthode..."
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

          {/* Scenario 3: Customer viewing their task in review */}
          {(isCustomer || isMyPostedTask) && task.status === 'UNDER_REVIEW' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-xs">
                <span className="font-bold text-slate-900 block mb-1">
                  Travail livré par le prestataire
                </span>
                <p className="text-slate-600">
                  Vérifiez les livrables dans l'onglet Détails. Si tout est conforme, validez le paiement ou demandez une révision.
                </p>
              </div>

              {isRevisionInputOpen ? (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <textarea
                    rows={2}
                    value={revisionFeedback}
                    onChange={(e) => setRevisionFeedback(e.target.value)}
                    placeholder="Indiquez précisément les corrections nécessaires..."
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-brand-700"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsRevisionInputOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleSendRevision}
                      className="rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-1.5 text-xs font-bold text-white transition"
                    >
                      Envoyer la demande de retouche
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-brand-700 hover:bg-brand-800 py-2.5 text-xs font-bold text-white transition cursor-pointer shadow-sm"
                  >
                    <FiCheck /> Valider & Libérer {rewardDH} DH
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRevisionInputOpen(true)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2.5 text-xs font-bold transition cursor-pointer"
                  >
                    <FiRepeat /> Demander une retouche
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* REVIEW & RATING MODAL */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Évaluer le travail de {task.assignedToName || 'Prestataire'}
              </h3>
              <p className="text-xs text-slate-600">
                Votre avis permet de récompenser les meilleurs talents et d'ajuster leur réputation sur la plateforme.
              </p>

              {/* Star Rating Selector */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingScore(star)}
                    className="text-3xl text-amber-400 hover:scale-110 transition cursor-pointer"
                  >
                    {star <= ratingScore ? '★' : '☆'}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Laissez un commentaire sur la rapidité et la conformité du travail..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-brand-700"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleApproveWithReview}
                  className="flex-1 rounded-xl bg-brand-700 hover:bg-brand-800 py-2.5 text-xs font-bold text-white transition shadow-sm"
                >
                  Confirmer et payer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
