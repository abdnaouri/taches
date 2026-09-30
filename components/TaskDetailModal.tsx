'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Task, UserProfile, TaskBid, TaskMessage, TaskProofSubmission, TaskReview } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { getAuthHeaders, supabase } from '@/lib/supabase';
import { sounds } from '@/lib/soundEffects';
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
  FiLoader,
  FiTrash2,
  FiExternalLink,
  FiFileText,
  FiPercent,
  FiCheckSquare,
  FiSlash
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
  onCancelTask?: (taskId: string) => void;
  onRequestArbitration?: (taskId: string, reason: string) => void;
  onProposePartialSettlement?: (taskId: string, percentage: number, reason: string, rating: number, reviewComment: string) => void;
  onAcceptPartialSettlement?: (taskId: string) => void;
  onRejectPartialSettlement?: (taskId: string) => void;
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
  onCancelTask,
  onRequestArbitration,
  onProposePartialSettlement,
  onAcceptPartialSettlement,
  onRejectPartialSettlement,
}) => {
  const { t, isRTL, locale, getCategoryLabel } = useLanguage();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [activeModalTab, setActiveModalTab] = useState<'details' | 'chat' | 'bids' | 'submission'>('details');
  const [pitch, setPitch] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  // Bids / Applicants State for Client
  const [bids, setBids] = useState<TaskBid[]>([]);
  const [isLoadingBids, setIsLoadingBids] = useState(false);

  // In-Task Realtime Chat State
  const [messages, setMessages] = useState<TaskMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Deliverables / Submissions
  const [submission, setSubmission] = useState<TaskProofSubmission | null>(null);

  // Reviews for this task
  const [taskReviews, setTaskReviews] = useState<TaskReview[]>([]);

  // Review & Approval State (100% Full Payment)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('Travail sérieux et rapide, je recommande !');

  // Partial Settlement Allocation State (e.g. 50% split)
  const [isPartialModalOpen, setIsPartialModalOpen] = useState(false);
  const [partialPercentage, setPartialPercentage] = useState<number>(50);
  const [partialReason, setPartialReason] = useState<string>('Travail partiellement conforme au cahier des charges.');
  const [partialRating, setPartialRating] = useState<number>(3);
  const [partialReviewComment, setPartialReviewComment] = useState<string>('Prestation partiellement satisfaisante, accord amiable trouvé.');

  // Revision Request State
  const [isRevisionInputOpen, setIsRevisionInputOpen] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');

  // Arbitration State
  const [isArbitrationInputOpen, setIsArbitrationInputOpen] = useState(false);
  const [arbitrationReason, setArbitrationReason] = useState('');

  // Fast 1-click pitch templates
  const quickPitches = [
    '⚡ Disponible immédiatement, travail soigné et rapide garanti.',
    '🎨 Expérience confirmée dans ce domaine avec réalisations similaires.',
    '📄 Parfaite maîtrise des consignes, livraison conforme avant le délai.',
  ];

  // 2. Fetch Bids & Realtime Subscription
  useEffect(() => {
    if (!task?.id) return;

    setIsLoadingBids(true);
    getAuthHeaders(false).then((authHeaders) => {
      fetch(`/api/bids?taskId=${task.id}`, { headers: authHeaders })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.bids) {
            setBids(data.bids);
          }
        })
        .catch((err) => console.warn('Failed to fetch bids:', err))
        .finally(() => setIsLoadingBids(false));
    });

    const bidsChannel = supabase
      .channel(`task_bids_${task.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_bids',
          filter: `task_id=eq.${task.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as any;
            const newBid: TaskBid = {
              id: row.id,
              taskId: row.task_id,
              performerId: row.performer_id,
              performerName: row.performer_name || 'Candidat',
              performerAvatar: row.performer_avatar || '',
              performerTier: row.performer_tier || 'level_1',
              performerRating: Number(row.performer_rating ?? 5.0),
              performerCompletedCount: Number(row.performer_completed_tasks ?? 0),
              proposedHours: Number(row.proposed_hours ?? 24),
              pitch: row.pitch || '',
              createdAt: row.created_at || new Date().toISOString(),
            };
            setBids((prev) => {
              if (prev.some((b) => b.id === newBid.id)) return prev;
              return [newBid, ...prev];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bidsChannel);
    };
  }, [task?.id]);

  // 3. Fetch In-Task Messages & Realtime Subscription
  useEffect(() => {
    if (!task?.id) return;

    const fetchMessages = () => {
      getAuthHeaders(false).then((authHeaders) => {
        fetch(`/api/messages?taskId=${task.id}`, { headers: authHeaders })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.messages) {
              setMessages(data.messages);
            }
          })
          .catch((err) => console.warn('Failed to fetch task messages:', err));
      });
    };

    fetchMessages();

    const chatChannel = supabase
      .channel(`task_chat_realtime_${task.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_messages',
          filter: `task_id=eq.${task.id}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (!row) return;

          const formattedMsg: TaskMessage = {
            id: row.id,
            taskId: row.task_id,
            senderId: row.sender_id,
            senderName: row.sender_name || 'Utilisateur',
            senderAvatar: row.sender_avatar || '',
            receiverId: row.receiver_id,
            content: row.content,
            attachmentUrl: row.attachment_url,
            createdAt: row.created_at || new Date().toISOString(),
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === formattedMsg.id)) return prev;
            if (user && formattedMsg.senderId !== user.id) {
              sounds.playMessage();
            }
            return [...prev, formattedMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [task?.id, user]);

  // 4. Fetch Submissions if under review or completed
  useEffect(() => {
    if (task?.id && (task.status === 'UNDER_REVIEW' || task.status === 'COMPLETED' || task.status === 'REVISION_REQUESTED')) {
      getAuthHeaders(false).then((authHeaders) => {
        fetch(`/api/submissions?taskId=${task.id}`, { headers: authHeaders })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.submission) {
              setSubmission(data.submission);
            }
          })
          .catch((err) => console.warn('Failed to fetch submission:', err));
      });
    }
  }, [task?.id, task?.status]);

  // 5. Fetch Reviews for this task
  useEffect(() => {
    if (task?.id && task.status === 'COMPLETED') {
      getAuthHeaders(false).then((authHeaders) => {
        fetch(`/api/reviews?taskId=${task.id}`, { headers: authHeaders })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.reviews) {
              setTaskReviews(data.reviews);
            }
          })
          .catch((err) => console.warn('Failed to fetch reviews:', err));
      });
    }
  }, [task?.id, task?.status]);

  useEffect(() => {
    if (activeModalTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeModalTab]);

  if (!task) return null;

  const isCustomer = user?.activeRole === 'CUSTOMER';
  const isAssignedToMe = user ? task.assignedToId === user.id : false;
  const isMyPostedTask = user
    ? task.clientId === user.id || task.clientName.includes('Vous') || task.clientName.includes('You')
    : false;
  const hasApplied = appliedSuccess || (user ? bids.some((b) => b.performerId === user.id) : false);
  const canAccessChat = isMyPostedTask || isAssignedToMe || hasApplied || (isAuthenticated && task.status === 'OPEN');

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
      const authHeaders = await getAuthHeaders(true);
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: authHeaders,
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
        setMessages((prev) => [...prev, data.message]);
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

  const handleSendArbitration = () => {
    if (!arbitrationReason.trim()) return;
    if (onRequestArbitration) {
      onRequestArbitration(task.id, arbitrationReason.trim());
    }
    setIsArbitrationInputOpen(false);
    onClose();
  };

  const handleSendPartialSettlement = () => {
    if (!partialReason.trim()) return;
    if (onProposePartialSettlement) {
      onProposePartialSettlement(
        task.id,
        partialPercentage,
        partialReason.trim(),
        partialRating,
        partialReviewComment.trim()
      );
    }
    setIsPartialModalOpen(false);
    onClose();
  };

  const handleAcceptProposal = () => {
    if (onAcceptPartialSettlement) {
      onAcceptPartialSettlement(task.id);
      onClose();
    }
  };

  const handleRejectProposal = () => {
    if (onRejectPartialSettlement) {
      onRejectPartialSettlement(task.id);
      onClose();
    }
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
              <span>
                {task.unitPriceDH} DH/personne <span className="text-[10px] text-slate-300 font-normal">({rewardDH} DH total)</span>
              </span>
            ) : (
              <span>
                {rewardDH} DH <span className="text-[10px] text-slate-300 font-normal">(~{rewardEur} €)</span>
              </span>
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

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-black ${
              task.status === 'IN_PROGRESS'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : task.status === 'UNDER_REVIEW'
                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                : task.status === 'REVISION_REQUESTED'
                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                : task.status === 'COMPLETED'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {task.status}
          </span>
        </div>

        {/* Task Title */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
          {task.title}
        </h2>

        {/* Modal Navigation Tabs */}
        <div className="mt-4 flex border-b border-slate-200 gap-4 text-xs font-bold overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveModalTab('details')}
            className={`pb-2.5 transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeModalTab === 'details'
                ? 'border-brand-700 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Détails & Consignes
          </button>

          {canAccessChat && (
            <button
              type="button"
              onClick={() => setActiveModalTab('chat')}
              className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
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
              className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeModalTab === 'bids'
                  ? 'border-brand-700 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FiUser />
              <span>Candidatures reçues ({bids.length})</span>
            </button>
          )}

          {(task.status === 'UNDER_REVIEW' || task.status === 'COMPLETED' || task.status === 'REVISION_REQUESTED') && (
            <button
              type="button"
              onClick={() => setActiveModalTab('submission')}
              className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeModalTab === 'submission'
                  ? 'border-brand-700 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FiFileText />
              <span>Livrables remis</span>
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

            {/* Client & Assigned Performer Details */}
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

            {/* Assigned Performer Banner if assigned */}
            {task.assignedToName && (
              <div className="rounded-2xl bg-emerald-50 p-3.5 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {task.assignedToName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      Prestataire assigné : {task.assignedToName}
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Mission en cours d’exécution sous garantie séquestre
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalTab('chat')}
                  className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <FiMessageSquare />
                  <span>Chat</span>
                </button>
              </div>
            )}
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

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModalTab('chat');
                      }}
                      className="text-xs text-brand-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FiMessageSquare /> Poser une question
                    </button>

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

        {/* TAB 4: DELIVERABLES / SUBMISSIONS */}
        {activeModalTab === 'submission' && (
          <div className="mt-4 space-y-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Rapport d'exécution remis
              </h4>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                {submission?.reportText || 'Livrable final transmis par le prestataire.'}
              </p>

              {submission?.proofUrls && submission.proofUrls.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h5 className="text-[11px] font-bold text-slate-700">Fichiers et liens joints :</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {submission.proofUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-brand-700 hover:bg-brand-50 transition truncate"
                      >
                        <FiLink className="shrink-0" />
                        <span className="truncate">Preuve {idx + 1}</span>
                        <FiExternalLink className="text-[10px] shrink-0 ml-auto" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Show reviews if completed */}
            {taskReviews.length > 0 && (
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-2">
                <h4 className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <FiStar className="text-amber-500 fill-amber-400" />
                  Avis et évaluation enregistrés :
                </h4>
                {taskReviews.map((rev) => (
                  <div key={rev.id} className="text-xs text-emerald-900 bg-white p-3 rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold">{rev.authorName}</span>
                      <span className="font-bold text-amber-600">★ {rev.rating}/5</span>
                    </div>
                    <p className="italic">« {rev.comment} »</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Panel Based on Role and State */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          
          {/* Performer viewing active assigned task */}
          {isAssignedToMe && task.status === 'IN_PROGRESS' && (
            <div className="rounded-2xl bg-amber-50 p-5 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
                <FiClock className="text-amber-700 text-base" />
                <span>Mission en cours d’exécution</span>
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

          {/* Performer viewing open task to apply */}
          {!isCustomer && !isAssignedToMe && task.status === 'OPEN' && (
            <div>
              {appliedSuccess ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <FiCheck className="text-lg text-emerald-600 shrink-0" />
                    <span>Votre proposition a été transmise. Vous pouvez échanger en direct avec le client.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('chat')}
                    className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                  >
                    <FiMessageSquare />
                    <span>Discussion</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* 1-Click Instant Apply Banner */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-linear-to-r from-emerald-500/10 to-brand-500/10 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚡</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Candidature Instantanée</div>
                        <div className="text-[11px] text-slate-500">Postulez immédiatement avec votre profil vérifié</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultPitch = `⚡ Disponible immédiatement avec profil vérifié. Travail conforme et rapide garanti pour ${task.title}.`;
                        if (isAuthenticated) {
                          onApply(task.id, defaultPitch);
                          setAppliedSuccess(true);
                        } else {
                          openAuthModal('login', 'Connectez-vous pour postuler en 1 clic');
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-xs transition cursor-pointer active:scale-95 whitespace-nowrap"
                    >
                      ⚡ Postuler en 1 clic
                    </button>
                  </div>

                  <form onSubmit={handleApplySubmit} className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800">
                        Ou rédigez un message personnalisé :
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
                      <span>Envoyer ma proposition personnalisée ({rewardDH} DH)</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Performer viewing a pending partial settlement proposal */}
          {isAssignedToMe && task.settlementProposal && task.settlementProposal.status === 'PENDING' && (
            <div className="rounded-2xl bg-amber-50 p-5 border-2 border-amber-300 shadow-md space-y-3 mb-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
                  <span className="text-xl">🤝</span>
                  <span>Proposition d'accord amiable reçue</span>
                </div>
                <span className="bg-amber-200 text-amber-900 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-amber-300">
                  {task.settlementProposal.percentage}% du montant initial
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-800">
                  <span>Montant proposé à encaisser :</span>
                  <strong className="text-emerald-700 text-sm font-black">
                    {task.settlementProposal.amountDH} DH <span className="text-[10px] text-slate-500 font-normal">(net ~{Math.round(task.settlementProposal.amountDH * 0.85)} DH)</span>
                  </strong>
                </div>
                <div className="flex items-center justify-between text-slate-600 text-[11px]">
                  <span>Reste remboursé au client :</span>
                  <span className="font-semibold">{Math.round(rewardDH - task.settlementProposal.amountDH)} DH</span>
                </div>
                <div className="pt-1 text-slate-700 italic border-t border-slate-100">
                  « {task.settlementProposal.reason} »
                </div>
                {task.settlementProposal.rating && (
                  <div className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                    <span>Évaluation jointe : ★ {task.settlementProposal.rating}/5</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAcceptProposal}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white transition shadow-sm cursor-pointer"
                >
                  <FiCheck /> Accepter {task.settlementProposal.percentage}% ({task.settlementProposal.amountDH} DH)
                </button>
                <button
                  type="button"
                  onClick={handleRejectProposal}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 px-4 py-2.5 text-xs font-bold transition cursor-pointer border border-rose-300"
                >
                  <FiSlash /> Refuser & Arbitrage
                </button>
              </div>
            </div>
          )}

          {/* Customer viewing their task in review */}
          {(isCustomer || isMyPostedTask) && task.status === 'UNDER_REVIEW' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-xs">
                <span className="font-bold text-slate-900 block mb-1">
                  Travail livré par le prestataire
                </span>
                <p className="text-slate-600">
                  Vérifiez les livrables dans l'onglet Livrables. Si tout est parfait validez le montant total, ou proposez une répartition partielle (ex: 50%) si le travail est incomplet.
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
                      className="rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-1.5 text-xs font-bold text-white transition cursor-pointer"
                    >
                      Envoyer la demande de retouche
                    </button>
                  </div>
                </div>
              ) : isArbitrationInputOpen ? (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <textarea
                    rows={2}
                    value={arbitrationReason}
                    onChange={(e) => setArbitrationReason(e.target.value)}
                    placeholder="Motif du litige (ex: travail non conforme au cahier des charges)..."
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-brand-700"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsArbitrationInputOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleSendArbitration}
                      className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-1.5 text-xs font-bold text-white transition cursor-pointer"
                    >
                      Transmettre aux arbitres Daman
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white transition cursor-pointer shadow-sm"
                  >
                    <FiCheck /> Payer 100% ({rewardDH} DH)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPartialModalOpen(true)}
                    className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 py-2.5 text-xs font-bold text-white transition cursor-pointer shadow-sm"
                  >
                    <FiPercent /> Répartition %
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRevisionInputOpen(true)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 px-3.5 py-2.5 text-xs font-bold transition cursor-pointer"
                  >
                    <FiRepeat /> Retouche
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsArbitrationInputOpen(true)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2.5 text-xs font-bold transition cursor-pointer"
                  >
                    ⚖️ Arbitrage
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Customer Option to Cancel Open Task */}
          {isMyPostedTask && task.status === 'OPEN' && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Voulez-vous annuler cette commande ? Le montant bloqué sous séquestre sera restitué immédiatement à votre solde disponible.')) {
                    if (onCancelTask) {
                      onCancelTask(task.id);
                      onClose();
                    }
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <FiTrash2 /> Annuler la commande et récupérer les {Math.round(task.totalBudget * 10)} DH
              </button>
            </div>
          )}

        </div>

        {/* REVIEW & RATING MODAL (100% FULL PAYMENT) */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Valider 100% & Évaluer {task.assignedToName || 'le freelance'}
              </h3>
              <p className="text-xs text-slate-600">
                Vous libérez la totalité de la rémunération (<strong>{rewardDH} DH</strong>). Laissez votre avis pour la communauté :
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
                  Confirmer et libérer {rewardDH} DH
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PARTIAL SETTLEMENT ALLOCATION MODAL (EX: 50% SPLIT) */}
        {isPartialModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <FiPercent className="text-amber-600" />
                  <span>Proposer une répartition financière partielle</span>
                </h3>
                <span className="text-xs font-black bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200">
                  {partialPercentage}% ({Math.round(rewardDH * (partialPercentage / 100))} DH)
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Si le résultat n'est que partiellement exploitable, ajustez le pourcentage à payer au prestataire. Le reste vous sera automatiquement remboursé une fois accepté.
              </p>

              {/* Fast percentage presets */}
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 70, 80].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPartialPercentage(pct)}
                    className={`py-2 text-xs font-extrabold rounded-xl border transition cursor-pointer ${
                      partialPercentage === pct
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Range Slider */}
              <div className="space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Ajuster : {partialPercentage}%</span>
                  <span className="text-amber-700 font-extrabold">{Math.round(rewardDH * (partialPercentage / 100))} DH</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={partialPercentage}
                  onChange={(e) => setPartialPercentage(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                
                {/* Live Distribution Card */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-slate-500 block">Freelance perçoit :</span>
                    <strong className="text-emerald-700 font-black text-xs">
                      {Math.round(rewardDH * (partialPercentage / 100))} DH
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-200">
                    <span className="text-slate-500 block">Votre remboursement :</span>
                    <strong className="text-blue-700 font-black text-xs">
                      {Math.round(rewardDH * ((100 - partialPercentage) / 100))} DH
                    </strong>
                  </div>
                </div>
              </div>

              {/* Motive / Justification */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Motif de la déduction / Remarques :
                </label>
                <textarea
                  rows={2}
                  value={partialReason}
                  onChange={(e) => setPartialReason(e.target.value)}
                  placeholder="Expliquez ce qui manque ou n'est pas conforme..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-amber-600"
                />
              </div>

              {/* Star Rating & Review for Partial Settlement */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Évaluation associée ({partialRating}/5) :
                </label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setPartialRating(star)}
                      className="text-2xl text-amber-400 hover:scale-110 transition cursor-pointer"
                    >
                      {star <= partialRating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={partialReviewComment}
                  onChange={(e) => setPartialReviewComment(e.target.value)}
                  placeholder="Commentaire public de fin de mission..."
                  className="w-full mt-1.5 rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPartialModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSendPartialSettlement}
                  className="flex-1 rounded-xl bg-amber-600 hover:bg-amber-700 py-2.5 text-xs font-bold text-white transition shadow-sm cursor-pointer"
                >
                  Transmettre la proposition
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
