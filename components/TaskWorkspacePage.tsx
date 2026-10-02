'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Task, UserProfile, TaskBid, TaskMessage, TaskProofSubmission, TaskReview, WalletTransaction } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Locale } from '@/lib/i18n/types';
import { useAuth } from '@/lib/auth/AuthContext';
import { getLocalizedTask } from '@/lib/mockData';
import { extractTaskIdFromSlug, getTaskSlug } from '@/lib/slug';
import {
  fetchDynamicTasks,
  fetchDynamicTaskById,
  updateDynamicTask,
  submitDynamicProof,
  recordDynamicTransaction,
  uploadDynamicProofFile,
  fetchCampaignSlots,
  reserveCampaignSlot,
  submitCampaignExecution,
  approveCampaignExecution
} from '@/lib/supabaseService';
import { getAuthHeaders, supabase } from '@/lib/supabase';
import { sounds } from '@/lib/soundEffects';
import { PLATFORM_PERFORMER_COMMISSION_RATE } from '@/lib/payoutService';
import { filterOffPlatformContact } from '@/lib/antiCircumvention';
import { useAnalytics } from '@/lib/analytics';
import { Header } from '@/components/Header';
import { ProofSubmissionDrawer } from '@/components/ProofSubmissionDrawer';
import { QualificationModal } from '@/components/QualificationModal';
import { PerformerSubscriptionModal } from '@/components/PerformerSubscriptionModal';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { WorkzillaFooter } from '@/components/WorkzillaLandingSections';
import {
  FiArrowLeft,
  FiArrowRight,
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
  FiExternalLink,
  FiFileText,
  FiPercent,
  FiUsers,
  FiDollarSign,
  FiAward,
  FiShare2,
  FiCheckSquare,
  FiPaperclip,
  FiRefreshCw
} from 'react-icons/fi';

interface TaskWorkspacePageProps {
  slug: string;
  forcedLocale?: Locale;
}

export const TaskWorkspacePage: React.FC<TaskWorkspacePageProps> = ({ slug, forcedLocale }) => {
  const { t, locale, isRTL, getCategoryLabel } = useLanguage();
  const { isAuthenticated, profile, openAuthModal, updateProfile, toggleRole, refreshProfile } = useAuth();
  const { track } = useAnalytics();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [task, setTask] = useState<Task | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'details' | 'chat' | 'bids' | 'submission'>('details');

  // Candidate Bids State
  const [bids, setBids] = useState<TaskBid[]>([]);
  const [isLoadingBids, setIsLoadingBids] = useState<boolean>(false);
  const [pitch, setPitch] = useState<string>('');
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  // In-Task Realtime Chat State
  const [messages, setMessages] = useState<TaskMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [isUploadingChatFile, setIsUploadingChatFile] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  // Proof Submission State
  const [isProofDrawerOpen, setIsProofDrawerOpen] = useState<boolean>(false);
  const [submission, setSubmission] = useState<TaskProofSubmission | null>(null);

  // Reviews State
  const [taskReviews, setTaskReviews] = useState<TaskReview[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('Travail sérieux et rapide, je recommande vivement !');

  // Partial Settlement State
  const [isPartialModalOpen, setIsPartialModalOpen] = useState<boolean>(false);
  const [partialPercentage, setPartialPercentage] = useState<number>(50);
  const [partialReason, setPartialReason] = useState<string>('Travail partiellement conforme aux attentes.');
  const [partialRating, setPartialRating] = useState<number>(3);
  const [partialReviewComment, setPartialReviewComment] = useState<string>('Prestation partiellement satisfaisante, accord amiable trouvé.');

  // Revision & Arbitration State
  const [isRevisionInputOpen, setIsRevisionInputOpen] = useState<boolean>(false);
  const [revisionFeedback, setRevisionFeedback] = useState<string>('');
  const [isArbitrationInputOpen, setIsArbitrationInputOpen] = useState<boolean>(false);
  const [arbitrationReason, setArbitrationReason] = useState<string>('');

  // Performer Qualification & Subscription Modals (Workzilla Parity)
  const [isSubModalOpen, setIsSubModalOpen] = useState<boolean>(false);
  const [isQualModalOpen, setIsQualModalOpen] = useState<boolean>(false);

  // Multi-Execution Campaign Slots State (UNU Parity)
  const [campaignExecutions, setCampaignExecutions] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isReservingSlot, setIsReservingSlot] = useState<boolean>(false);
  const [isSlotDrawerOpen, setIsSlotDrawerOpen] = useState<boolean>(false);
  const [selectedSlotForReview, setSelectedSlotForReview] = useState<any | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Quick Pitch templates
  const quickPitches = [
    '⚡ Disponible immédiatement, travail soigné et rapide garanti.',
    '🎨 Expérience confirmée dans ce domaine avec réalisations similaires.',
    '📄 Parfaite maîtrise des consignes, livraison conforme avant le délai.',
  ];

  // Load Task by Slug / ID
  useEffect(() => {
    let isMounted = true;
    setIsLoadingTask(true);

    const loadTask = async () => {
      try {
        const allRes = await fetchDynamicTasks();
        const allList: Task[] = allRes.tasks || [];
        if (isMounted) setTasks(allList);

        const extractedId = extractTaskIdFromSlug(slug, allList);
        if (extractedId) {
          const direct = allList.find((t) => t.id === extractedId);
          if (direct) {
            if (isMounted) setTask(direct);
          } else {
            const single = await fetchDynamicTaskById(extractedId);
            if (single && isMounted) setTask(single);
          }
        }
      } catch (err) {
        console.error('Failed to load task for workspace:', err);
      } finally {
        if (isMounted) setIsLoadingTask(false);
      }
    };

    loadTask();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Load Bids & Setup Realtime Channel
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
      .channel(`task_bids_ws_${task.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bids',
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
            setBids((prev) => (prev.some((b) => b.id === newBid.id) ? prev : [newBid, ...prev]));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bidsChannel);
    };
  }, [task?.id]);

  // Load Messages & Setup Realtime Channel
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
          .catch((err) => console.warn('Failed to fetch messages:', err));
      });
    };

    fetchMessages();

    const chatChannel = supabase
      .channel(`task_chat_ws_${task.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
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
            if (profile && formattedMsg.senderId !== profile.id) {
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
  }, [task?.id, profile]);

  // Load Submissions & Reviews
  useEffect(() => {
    if (!task?.id) return;

    getAuthHeaders(false).then((authHeaders) => {
      fetch(`/api/submissions?taskId=${task.id}`, { headers: authHeaders })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.submission) {
            setSubmission(data.submission);
          }
        })
        .catch(() => {});

      fetch(`/api/reviews?taskId=${task.id}`, { headers: authHeaders })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.reviews) {
            setTaskReviews(data.reviews);
          }
        })
        .catch(() => {});

      // Load Campaign Slots for UNU Multi-Execution Tasks
      if (task.taskMode === 'multi') {
        setIsLoadingSlots(true);
        fetchCampaignSlots(task.id)
          .then((slots) => setCampaignExecutions(slots || []))
          .finally(() => setIsLoadingSlots(false));
      }
    });
  }, [task?.id, task?.taskMode]);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  if (isLoadingTask) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-3 border-brand-700 border-t-transparent animate-spin" />
            <p className="text-xs font-bold text-slate-500">Chargement de la mission et des flux...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mx-auto mb-4">
              <FiAlertTriangle />
            </div>
            <h2 className="text-lg font-black text-slate-900">Mission introuvable</h2>
            <p className="text-xs text-slate-500 mt-1">
              Cette mission a peut-être été supprimée ou clôturée par son auteur.
            </p>
            <button
              onClick={() => router.push(`/${locale}/tasks`)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold px-5 py-2.5 text-xs transition cursor-pointer"
            >
              <FiArrowLeft />
              <span>Retour au catalogue des missions</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const localized = getLocalizedTask(task, locale);
  const rewardDH = Math.round(task.reward * 10);
  const isOwner = Boolean(profile && task.clientId && (profile.id === task.clientId || task.clientName?.includes('Vous')));
  const isAssignedToMe = Boolean(profile && task.assignedToId && profile.id === task.assignedToId);
  const isAssigned = Boolean(task.assignedToId || task.status !== 'OPEN');
  const isUrgent = task.timeLimitHours <= 6;

  // Send message in chat
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !task) return;

    if (!isAuthenticated || !profile) {
      openAuthModal('login', 'Connectez-vous pour envoyer un message');
      return;
    }

    const text = chatInput.trim();
    setChatInput('');
    setIsSendingMessage(true);

    const tempMsg: TaskMessage = {
      id: `tmp_${Date.now()}`,
      taskId: task.id,
      senderId: profile.id,
      senderName: profile.fullName || 'Utilisateur',
      senderAvatar: profile.avatarUrl || '',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    sounds.playMessage();

    try {
      const authHeaders = await getAuthHeaders(true);
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          taskId: task.id,
          senderId: profile.id,
          senderName: profile.fullName || 'Utilisateur',
          senderAvatar: profile.avatarUrl || '',
          content: text,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Failed to post message:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Upload attachment in chat
  const handleChatFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !task) return;

    setIsUploadingChatFile(true);
    const res = await uploadDynamicProofFile(file);
    setIsUploadingChatFile(false);

    if (res.success && res.url && profile) {
      const authHeaders = await getAuthHeaders(true);
      await fetch('/api/messages', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          taskId: task.id,
          senderId: profile.id,
          senderName: profile.fullName || 'Utilisateur',
          senderAvatar: profile.avatarUrl || '',
          content: `📎 Fichier partagé : ${file.name}`,
          attachmentUrl: res.url,
        }),
      });
      sounds.playMessage();
    }
  };

  // Apply / Bid for task
  const handleApplyBid = async (selectedPitch?: string) => {
    if (!isAuthenticated || !profile) {
      openAuthModal('login', 'Connectez-vous pour postuler à cette mission');
      return;
    }

    const pitchText = selectedPitch || pitch;
    if (!pitchText.trim()) return;

    try {
      const authHeaders = await getAuthHeaders(true);
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          taskId: task.id,
          performerId: profile.id,
          performerName: profile.fullName || 'Prestataire',
          performerAvatar: profile.avatarUrl || '',
          performerTier: profile.performerTier || 'level_1',
          performerRating: profile.performerRating || 5.0,
          performerCompletedCount: profile.performerCompletedTasks || 0,
          proposedHours: task.timeLimitHours || 24,
          pitch: pitchText.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAppliedSuccess(true);
        sounds.playSuccess();
        showToast('Candidature transmise avec succès au donneur d’ordre !');
        setPitch('');
      } else {
        if (data.requiresQualification) {
          sounds.playAlert();
          showToast(data.error || 'Test de qualification requis pour postuler.');
          setIsQualModalOpen(true);
        } else if (data.requiresSubscription) {
          sounds.playAlert();
          showToast(data.error || 'Pass Prestataire requis pour continuer à postuler.');
          setIsSubModalOpen(true);
        } else {
          showToast(data.error || 'Erreur lors de la candidature.');
        }
      }
    } catch (err) {
      console.warn('Bid error:', err);
    }
  };

  // Assign Performer
  const handleAssign = async (performerId: string, performerName: string) => {
    const assignedAt = new Date().toISOString();
    const updated: Task = {
      ...task,
      status: 'IN_PROGRESS',
      assignedToId: performerId,
      assignedToName: performerName,
      assignedAt,
    };
    setTask(updated);
    showToast(`Mission attribuée à ${performerName} ! Séquestre activé.`);

    await updateDynamicTask(task.id, {
      status: 'IN_PROGRESS',
      assignedToId: performerId,
      assignedToName: performerName,
      assignedAt,
    });

    if (profile) {
      const authHeaders = await getAuthHeaders(true);
      await fetch('/api/messages', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          taskId: task.id,
          senderId: profile.id,
          senderName: profile.fullName || 'Client',
          senderAvatar: profile.avatarUrl || '',
          content: `🤝 Mission confiée à ${performerName}. Le budget (${rewardDH} DH) est consigné sous séquestre Daman. Les échanges de consignes et de fichiers s’effectuent ici.`,
        }),
      });
    }
  };

  // Submit Deliverable Proofs
  const handleSubmitProof = async (reportText: string, proofUrls: string[], antiSpamEntered?: string) => {
    if (!task) return;
    const updated: Task = {
      ...task,
      status: 'UNDER_REVIEW',
    };
    setTask(updated);
    showToast('Livrables et preuves soumis avec succès ! Le client a été notifié.');
    setIsProofDrawerOpen(false);

    try {
      const authHeaders = await getAuthHeaders(true);
      await fetch('/api/submissions', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          taskId: task.id,
          reportText,
          proofUrls,
          antiSpamEntered,
        }),
      });
      await updateDynamicTask(task.id, { status: 'UNDER_REVIEW' });
    } catch (e) {
      console.warn('Submission error:', e);
    }

    if (profile) {
      const authHeaders = await getAuthHeaders(true);
      await fetch('/api/messages', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          taskId: task.id,
          senderId: profile.id,
          senderName: profile.fullName || 'Prestataire',
          senderAvatar: profile.avatarUrl || '',
          content: `✅ Livrables soumis pour validation :\n${reportText}\n${proofUrls.length > 0 ? `Preuves : ${proofUrls.join(', ')}` : ''}`,
        }),
      });
    }
  };

  // Reserve Slot in Multi-Execution Campaign (UNU Parity)
  const handleReserveSlot = async () => {
    if (!isAuthenticated || !profile) {
      openAuthModal('login', 'Connectez-vous pour réserver une place');
      return;
    }
    if (!profile.passedQualification) {
      setIsQualModalOpen(true);
      return;
    }

    setIsReservingSlot(true);
    const res = await reserveCampaignSlot(task.id);
    setIsReservingSlot(false);

    if (res.success) {
      sounds.playSuccess();
      showToast(res.message || 'Place réservée pour 45 minutes !');
      // Refresh slots
      const updatedSlots = await fetchCampaignSlots(task.id);
      setCampaignExecutions(updatedSlots);
    } else {
      sounds.playAlert();
      showToast(res.error || 'Impossible de réserver une place.');
    }
  };

  // Approve a single execution in Multi-Execution Campaign
  const handleApproveSlotExecution = async (executionId: string) => {
    const res = await approveCampaignExecution(executionId);
    if (res.success) {
      sounds.playSuccess();
      showToast('Exécution approuvée et rémunération débloquée !');
      const updatedSlots = await fetchCampaignSlots(task.id);
      setCampaignExecutions(updatedSlots);
      setSelectedSlotForReview(null);
    } else {
      showToast(res.error || 'Erreur lors de la validation.');
    }
  };

  // Approve Work (100% Release)
  const handleApproveWork = async () => {
    if (!task) return;
    const completedAt = new Date().toISOString();
    const updated: Task = {
      ...task,
      status: 'COMPLETED',
      completedAt,
    };
    setTask(updated);
    setIsReviewModalOpen(false);

    const commissionRate = PLATFORM_PERFORMER_COMMISSION_RATE;
    const grossEur = task.reward;
    const commissionEur = Number((grossEur * commissionRate).toFixed(2));
    const netEur = Number((grossEur - commissionEur).toFixed(2));
    const netDH = Math.round(netEur * 10);

    showToast(`Mission validée ! ${netDH} DH débloqués pour le freelance.`);

    await updateDynamicTask(task.id, { status: 'COMPLETED', completedAt });

    if (profile) {
      await updateProfile({
        balanceEscrow: Math.max(0, (profile.balanceEscrow || 0) - task.totalBudget),
        customerTotalSpent: (profile.customerTotalSpent || 0) + task.totalBudget,
      });

      // Post Review
      const authHeaders = await getAuthHeaders(true);
      await fetch('/api/reviews', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          taskId: task.id,
          authorId: profile.id,
          authorName: profile.fullName || 'Client',
          targetUserId: task.assignedToId,
          rating: ratingScore,
          comment: reviewComment,
        }),
      });

      // Kickoff message
      await fetch('/api/messages', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          taskId: task.id,
          senderId: profile.id,
          senderName: profile.fullName || 'Client',
          senderAvatar: profile.avatarUrl || '',
          content: `⭐ Mission approuvée avec succès ! Séquestre débloqué (${netDH} DH nets). Avis attribué : ${ratingScore}/5 ★.`,
        }),
      });
    }
  };

  // Request Revision
  const handleRequestRevision = async () => {
    if (!task || !revisionFeedback.trim()) return;
    const updated: Task = { ...task, status: 'REVISION_REQUESTED' };
    setTask(updated);
    setIsRevisionInputOpen(false);
    showToast('Demande de retouche transmise au freelance.');

    await updateDynamicTask(task.id, { status: 'REVISION_REQUESTED' });

    if (profile) {
      const authHeaders = await getAuthHeaders(true);
      await fetch('/api/messages', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          taskId: task.id,
          senderId: profile.id,
          senderName: profile.fullName || 'Client',
          senderAvatar: profile.avatarUrl || '',
          content: `⚠️ Demande de retouche : ${revisionFeedback.trim()}`,
        }),
      });
    }
  };

  // Status badge styling
  const getStatusBadge = () => {
    switch (task.status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 text-xs font-black">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            En cours d’exécution
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 px-3 py-1 text-xs font-black">
            <FiCheckCircle className="text-purple-600" />
            Livrables à vérifier
          </span>
        );
      case 'REVISION_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1 text-xs font-black">
            <FiRepeat className="text-rose-600" />
            Retouche demandée
          </span>
        );
      case 'ARBITRATION':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 px-3 py-1 text-xs font-black">
            <FiShield className="text-orange-600" />
            En arbitrage Daman
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 text-xs font-black">
            <FiCheckCircle className="text-emerald-600" />
            Mission Clôturée & Payée
          </span>
        );
      case 'OPEN':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 px-3 py-1 text-xs font-black">
            <span className="h-2 w-2 rounded-full bg-brand-600 animate-ping" />
            Ouverte aux candidats ({bids.length} offre{bids.length > 1 ? 's' : ''})
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed top-18 ${isRTL ? 'left-5' : 'right-5'} z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-2xl border border-emerald-500/40 text-xs animate-in slide-in-from-top-3`}>
          <FiCheck className="text-emerald-400 text-base shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <Header />

      {/* Main Task Workspace Container */}
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 space-y-6">

          {/* BREADCRUMB & TOP NAV */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold flex-wrap">
              <button
                type="button"
                onClick={() => router.push(`/${locale}`)}
                className="hover:text-brand-700 transition cursor-pointer"
              >
                Accueil
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={() => router.push(`/${locale}/tasks`)}
                className="hover:text-brand-700 transition cursor-pointer"
              >
                Missions
              </button>
              <span>/</span>
              <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-xs">
                {task.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Lien de la mission copié dans le presse-papier !');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
                title="Partager cette mission"
              >
                <FiShare2 className="text-xs text-slate-500" />
                <span>Partager</span>
              </button>

              <button
                type="button"
                onClick={() => router.push(`/${locale}/tasks`)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                <FiArrowLeft />
                <span>Toutes les missions</span>
              </button>
            </div>
          </div>

          {/* DUAL COLUMN WORKSPACE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* LEFT COLUMN: TASK DETAILS & WORKFLOW ENGINE (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">

              {/* 1. PRIMARY TASK HEADER CARD */}
              <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge()}
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {task.subCategory || getCategoryLabel(task.category || 'all')}
                    </span>
                    {task.city ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                        <FiMapPin className="text-xs" /> {task.city}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                        <FiGlobe className="text-xs" /> En ligne
                      </span>
                    )}
                    {isUrgent && (
                      <span className="inline-flex items-center gap-1 text-xs font-black text-amber-900 bg-amber-100 px-2 py-1 rounded-lg border border-amber-300">
                        ⚡ Urgent
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                      {rewardDH} <span className="text-sm font-extrabold text-slate-500">DH</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mt-0.5">
                      ✓ Séquestre Daman
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {localized.title}
                </h1>

                {/* Task Metadata Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Délai imparti</span>
                    <span className="font-extrabold text-slate-800 flex items-center gap-1 mt-0.5">
                      <FiClock className="text-brand-600" /> {task.timeLimitHours} heures
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Niveau requis</span>
                    <span className="font-extrabold text-slate-800 flex items-center gap-1 mt-0.5">
                      <FiAward className="text-amber-500" /> Niveau {task.minLevelRequired || 1}+
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Mode</span>
                    <span className="font-extrabold text-slate-800 flex items-center gap-1 mt-0.5">
                      <FiUsers className="text-indigo-600" /> {task.taskMode === 'multi' ? 'Multi-exécuteurs' : 'Individuel'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Garantie</span>
                    <span className="font-extrabold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <FiShield className="text-emerald-600" /> 100% Remboursé
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                    Description du besoin
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {localized.description}
                  </div>
                </div>

                {/* Deliverables / Proofs Requirements */}
                {task.requiredProofs && task.requiredProofs.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                      Preuves & Livrables exigés
                    </h3>
                    <div className="space-y-2">
                      {task.requiredProofs.map((proof, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70 text-xs font-medium text-slate-800"
                        >
                          <FiCheckSquare className="text-emerald-600 shrink-0 text-sm mt-0.5" />
                          <span>{proof}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AUTO-APPROVAL 72H BANNER (Workzilla Parity) */}
              {task.status === 'UNDER_REVIEW' && (
                <div className="rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shadow-md flex items-start gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center shrink-0 text-xl mt-0.5">
                    <FiClock />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-white">Garantie d’approbation automatique sous 72 heures</span>
                      <span className="text-[10px] font-extrabold bg-purple-400/20 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/30">
                        Séquestre Daman
                      </span>
                    </div>
                    <p className="text-xs text-purple-100 leading-relaxed">
                      Les livrables sont en cours d’examen par le client. Sans réclamation ou demande de retouche sous 72h, le système débloquera automatiquement le paiement ({rewardDH} DH) pour le freelance.
                    </p>
                  </div>
                </div>
              )}

              {/* MULTI-EXECUTION CROWD CAMPAIGN ENGINE (UNU Parity) */}
              {task.taskMode === 'multi' && (
                <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-0.5 text-xs font-bold text-indigo-700 mb-1">
                        <FiUsers />
                        <span>Campagne Multi-Exécutions (Modèle UNU)</span>
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        {task.targetExecutionsCount || 1} places ouvertes
                      </h2>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-500 font-semibold block">Gain par exécution :</span>
                      <span className="text-xl font-black text-indigo-700">
                        {task.unitPriceDH || Math.round(rewardDH / Math.max(1, task.targetExecutionsCount || 1))} DH
                      </span>
                    </div>
                  </div>

                  {/* Slots Progress */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Progression des exécutions</span>
                      <span>
                        {(task.executionsApprovedCount || 0)} / {task.targetExecutionsCount || 1} validées
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-brand-600 transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.round(((task.executionsApprovedCount || 0) / Math.max(1, task.targetExecutionsCount || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Performer Slot Reservation Box */}
                  {!isOwner && (
                    <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-black text-indigo-900">Participer à cette micro-tâche</h4>
                        <p className="text-[11px] text-indigo-700">
                          Réservez 1 place pour bloquer la mission pendant 45 minutes et déposer votre livrable.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleReserveSlot}
                        disabled={isReservingSlot}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                      >
                        <FiCheckCircle />
                        <span>{isReservingSlot ? 'Réservation...' : 'Réserver ma place (45 min)'}</span>
                      </button>
                    </div>
                  )}

                  {/* Executions Table */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Suivi des exécutions ({campaignExecutions.length})
                    </h3>

                    {isLoadingSlots ? (
                      <div className="p-6 text-center text-xs text-slate-400">Chargement des exécutions...</div>
                    ) : campaignExecutions.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                        Aucune exécution enregistrée pour l’instant. Les premières réservations apparaîtront ici.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {campaignExecutions.map((exec) => (
                          <div
                            key={exec.id}
                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={exec.performerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                                alt={exec.performerName}
                                className="h-9 w-9 rounded-xl object-cover border border-slate-300 shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-900">{exec.performerName}</span>
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    exec.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                                    exec.status === 'SUBMITTED' ? 'bg-purple-100 text-purple-800' :
                                    exec.status === 'RESERVED' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {exec.status === 'APPROVED' ? '✓ Validé & Payé' :
                                     exec.status === 'SUBMITTED' ? '⏳ Livrable déposé' :
                                     exec.status === 'RESERVED' ? '⏱️ Place réservée (45 min)' : exec.status}
                                  </span>
                                </div>
                                {exec.reportText && (
                                  <p className="text-slate-600 mt-1 line-clamp-1 italic">
                                    "{exec.reportText}"
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Client Action on Submitted Slot */}
                            {isOwner && exec.status === 'SUBMITTED' && (
                              <button
                                type="button"
                                onClick={() => handleApproveSlotExecution(exec.id)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer self-end sm:self-center"
                              >
                                <FiCheck />
                                <span>Valider ({exec.unitRewardDH} DH)</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. WORKFLOW ACTION AREA: CANDIDATURES / LIVRABLES / ACTIONS */}
              {task.status === 'OPEN' && task.taskMode !== 'multi' ? (
                /* OPEN STATUS: CANDIDATE BIDS SECTION */
                <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        {isOwner ? `Offres reçues (${bids.length})` : 'Postuler à cette mission'}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isOwner
                          ? 'Sélectionnez le prestataire idéal pour démarrer l’exécution sous séquestre.'
                          : 'Envoyez votre proposition pour être retenu par le client.'}
                      </p>
                    </div>

                    {!isOwner && !isAssigned && (
                      <div className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                        Gain net : {Math.round(rewardDH * 0.85)} DH
                      </div>
                    )}
                  </div>

                  {/* Performer Application Box */}
                  {!isOwner && !isAssigned && (
                    <div className="space-y-4 pt-2">
                      {appliedSuccess ? (
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                          <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-lg">
                            <FiCheck />
                          </div>
                          <h4 className="text-sm font-extrabold text-emerald-900">
                            Candidature transmise avec succès !
                          </h4>
                          <p className="text-xs text-emerald-700">
                            Le client consultera votre profil et pourra vous attribuer la mission instantanément.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">
                              Votre message de motivation / pitch :
                            </label>
                            <textarea
                              rows={3}
                              value={pitch}
                              onChange={(e) => setPitch(e.target.value)}
                              placeholder="Expliquez en 1-2 phrases pourquoi vous êtes le freelance idéal pour cette mission..."
                              className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-brand-700 focus:outline-hidden focus:ring-1 focus:ring-brand-700 bg-white"
                            />
                          </div>

                          {/* Quick pitch templates */}
                          <div className="flex flex-wrap gap-1.5">
                            {quickPitches.map((qp, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setPitch(qp)}
                                className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition cursor-pointer"
                              >
                                {qp}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleApplyBid()}
                            disabled={!pitch.trim()}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-extrabold py-3 text-xs shadow-md transition cursor-pointer"
                          >
                            <FiSend />
                            <span>Envoyer ma candidature ({rewardDH} DH)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* List of candidates / Bids */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Candidats postulants ({bids.length})
                    </h3>

                    {bids.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                        Aucune offre pour l’instant. Les premiers freelances notifiés vont postuler sous peu.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {bids.map((b) => (
                          <div
                            key={b.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 transition"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={b.performerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                                alt={b.performerName}
                                className="h-10 w-10 rounded-xl object-cover border border-slate-300 shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-xs text-slate-900">{b.performerName}</span>
                                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                                    <FiStar className="fill-amber-400 text-amber-500 text-[10px]" />
                                    {b.performerRating || 5.0} ({b.performerCompletedCount || 0} missions)
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 italic">
                                  "{b.pitch}"
                                </p>
                              </div>
                            </div>

                            {isOwner && (
                              <button
                                type="button"
                                onClick={() => handleAssign(b.performerId, b.performerName)}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold px-4 py-2 text-xs shadow-xs transition cursor-pointer shrink-0 self-end sm:self-center"
                              >
                                <FiCheck />
                                <span>Sélectionner ce freelance</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* IN_PROGRESS / UNDER_REVIEW / COMPLETED / REVISION STATUS */
                <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        État de livraison & Actions
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isOwner
                          ? 'Vérifiez le travail rendu et débloquez la rémunération en 1 clic.'
                          : 'Rendez votre travail et suivez la validation de votre mission.'}
                      </p>
                    </div>
                  </div>

                  {/* Submission Box for Assigned Performer */}
                  {isAssignedToMe && task.status === 'IN_PROGRESS' && (
                    <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 space-y-3">
                      <div className="flex items-center gap-2 text-brand-900 font-extrabold text-xs">
                        <FiUploadCloud className="text-base text-brand-700" />
                        <span>Vous êtes l’exécutant de cette mission</span>
                      </div>
                      <p className="text-xs text-brand-800">
                        Lorsque votre travail est terminé, cliquez ci-dessous pour soumettre votre rapport et vos captures d’écran de preuve.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsProofDrawerOpen(true)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold py-2.5 text-xs shadow-xs transition cursor-pointer"
                      >
                        <FiUploadCloud />
                        <span>Déposer mes preuves & Livrables</span>
                      </button>
                    </div>
                  )}

                  {/* Client Approval & Revision Area */}
                  {isOwner && (task.status === 'UNDER_REVIEW' || task.status === 'IN_PROGRESS' || task.status === 'REVISION_REQUESTED') && (
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      {task.status === 'UNDER_REVIEW' && (
                        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-2.5 text-xs text-purple-900">
                          <FiClock className="text-purple-600 text-base shrink-0 animate-pulse" />
                          <div className="leading-snug">
                            <span className="font-extrabold block">Garantie Daman 72h :</span>
                            <span className="text-purple-700">Validation automatique sous 72 heures si aucune contestation n'est émise. Validez dès maintenant pour libérer la rémunération au freelance.</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">
                          Actions du Donneur d’ordre :
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700">
                          Séquestre disponible : {rewardDH} DH
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setIsReviewModalOpen(true)}
                          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 text-xs shadow-xs transition cursor-pointer"
                        >
                          <FiCheckCircle />
                          <span>Valider & Débloquer {rewardDH} DH</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsRevisionInputOpen(!isRevisionInputOpen)}
                          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold py-3 text-xs transition cursor-pointer"
                        >
                          <FiRepeat />
                          <span>Demander une retouche</span>
                        </button>
                      </div>

                      {/* Revision Input Box */}
                      {isRevisionInputOpen && (
                        <div className="pt-3 border-t border-slate-200 space-y-2">
                          <label className="text-xs font-bold text-slate-700">
                            Précisez les corrections à apporter :
                          </label>
                          <textarea
                            rows={3}
                            value={revisionFeedback}
                            onChange={(e) => setRevisionFeedback(e.target.value)}
                            placeholder="Détaillez les éléments manquants ou à corriger..."
                            className="w-full rounded-xl border border-slate-300 p-3 text-xs bg-white focus:outline-hidden focus:border-brand-700"
                          />
                          <button
                            type="button"
                            onClick={handleRequestRevision}
                            disabled={!revisionFeedback.trim()}
                            className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 text-xs transition cursor-pointer"
                          >
                            Transmettre la demande de retouche
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completed Banner */}
                  {task.status === 'COMPLETED' && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
                      <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-lg">
                        <FiCheckCircle />
                      </div>
                      <h4 className="text-sm font-extrabold text-emerald-900">
                        Mission finalisée avec succès
                      </h4>
                      <p className="text-xs text-emerald-700">
                        Les fonds ont été versés au freelance et le séquestre a été clôturé.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: REALTIME CHAT & PROFILES HUB (5 COLS) */}
            <div className="lg:col-span-5 space-y-6">

              {/* 1. DEDICATED IN-TASK REALTIME MESSENGER */}
              <div className="rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col h-[560px] overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-brand-700 text-white flex items-center justify-center">
                      <FiMessageSquare className="text-sm" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900 leading-tight">
                        Messagerie de la mission
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Échanges en direct sous protection Daman
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Direct
                  </span>
                </div>

                {/* Message Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                      <FiMessageSquare className="text-3xl mb-2 text-slate-300" />
                      <p className="text-xs font-bold text-slate-600">Aucun message pour le moment</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Utilisez ce chat pour poser vos questions, affiner le besoin ou transmettre des fichiers.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = profile && msg.senderId === profile.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <img
                            src={msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                            alt={msg.senderName}
                            className="h-7 w-7 rounded-lg object-cover border border-slate-200 shrink-0 mt-0.5"
                          />
                          <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs ${
                            isMe
                              ? 'bg-brand-700 text-white rounded-tr-xs'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                          }`}>
                            <div className="flex items-center justify-between gap-2 mb-0.5 text-[10px] font-bold opacity-80">
                              <span>{msg.senderName}</span>
                              <span className="text-[9px] font-normal">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                            {msg.attachmentUrl && (
                              <a
                                href={msg.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`mt-2 flex items-center gap-1.5 text-[11px] font-bold p-2 rounded-xl underline ${
                                  isMe ? 'bg-brand-800 text-brand-100' : 'bg-slate-100 text-brand-700'
                                }`}
                              >
                                <FiPaperclip />
                                <span>Voir le fichier joint</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Input Bar */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white space-y-2">
                  {filterOffPlatformContact(chatInput).hasViolation && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium animate-in fade-in">
                      <FiAlertTriangle className="text-amber-600 shrink-0" />
                      <span>Rappel Daman : Les numéros, emails et liens externes sont masqués pour protéger la garantie financière.</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={chatFileInputRef}
                      onChange={handleChatFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => chatFileInputRef.current?.click()}
                      disabled={isUploadingChatFile}
                      className="p-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                      title="Joindre un fichier"
                    >
                      {isUploadingChatFile ? <FiLoader className="animate-spin text-sm" /> : <FiPaperclip className="text-sm" />}
                    </button>

                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs focus:border-brand-700 focus:outline-hidden"
                    />

                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isSendingMessage}
                      className="rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white p-2.5 transition cursor-pointer"
                    >
                      <FiSend className="text-xs" />
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. EMPLOYER / CLIENT PROFILE CARD */}
              <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Donneur d’ordre (Client)
                </span>
                <div className="flex items-center gap-3">
                  <img
                    src={task.clientAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={task.clientName}
                    className="h-12 w-12 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{task.clientName}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                        <FiStar className="fill-amber-400 text-amber-500 text-xs" />
                        {task.clientRating || 5.0}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded-md">
                        100% Embauche
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. ASSIGNED FREELANCE PROFILE CARD (IF ASSIGNED) */}
              {task.assignedToName && (
                <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Freelance Assigné
                  </span>
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                      alt={task.assignedToName}
                      className="h-12 w-12 rounded-2xl object-cover border-2 border-brand-700 shadow-2xs shrink-0"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{task.assignedToName}</h4>
                      <p className="text-xs text-brand-700 font-bold mt-0.5">
                        ✓ Prestataire certifié Tâches.ma
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. DAMAN ESCROW GUARANTEE BADGE */}
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
                  <FiShield className="text-base" />
                  <span>Séquestre Daman Maroc garanti</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Votre paiement de <strong>{rewardDH} DH</strong> est consigné sur un compte séquestre sécurisé. Il n’est versé qu’une fois les livrables validés par le client.
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <WorkzillaFooter />

      {/* Proof Submission Drawer */}
      <ProofSubmissionDrawer
        task={isProofDrawerOpen ? task : null}
        onClose={() => setIsProofDrawerOpen(false)}
        onSubmitProof={(taskId, reportText, urls) => handleSubmitProof(reportText, urls)}
      />

      {/* Review Modal on Approval */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">
              Valider le travail & attribuer un avis
            </h3>
            <p className="text-xs text-slate-600">
              Le montant de <strong>{rewardDH} DH</strong> sera immédiatement débloqué pour {task.assignedToName || 'le freelance'}.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Note de satisfaction :</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingScore(star)}
                    className="p-1 text-2xl transition cursor-pointer"
                  >
                    <FiStar className={star <= ratingScore ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Votre commentaire :</label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleApproveWork}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs transition cursor-pointer"
              >
                Confirmer & Payer ({rewardDH} DH)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performer Subscription Pass Modal (Workzilla Paid Access Model) */}
      <PerformerSubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        onSuccess={() => {
          showToast('Pass activé avec succès ! Vous pouvez maintenant postuler.');
        }}
        onOpenDeposit={() => {
          router.push(`/${locale}/wallet`);
        }}
      />

      {/* Performer Qualification Onboarding Test Modal */}
      <QualificationModal
        isOpen={isQualModalOpen}
        onClose={() => setIsQualModalOpen(false)}
        onPassed={async () => {
          showToast('Félicitations ! Vous avez réussi le test de qualification.');
          setIsQualModalOpen(false);
          await refreshProfile();
        }}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
