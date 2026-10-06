'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Task,
  UserProfile,
  TaskBid,
  TaskMessage,
  TaskProofSubmission,
  TaskReview,
  WalletTransaction,
} from '@/types/database';
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
  approveCampaignExecution,
} from '@/lib/supabaseService';
import { getAuthHeaders, supabase } from '@/lib/supabase';
import { sounds } from '@/lib/soundEffects';
import { PLATFORM_PERFORMER_COMMISSION_RATE } from '@/lib/payoutService';
import { filterOffPlatformContact } from '@/lib/antiCircumvention';
import { useAnalytics } from '@/lib/analytics';
import { Header } from '@/components/Header';
import { ProofSubmissionDrawer } from '@/components/ProofSubmissionDrawer';
import { QualificationModal } from '@/components/QualificationModal';
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
  FiRefreshCw,
  FiX,
  FiEye,
  FiLock,
  FiInfo,
  FiHelpCircle,
  FiChevronRight,
  FiLayers,
} from 'react-icons/fi';

interface TaskWorkspacePageProps {
  slug: string;
  forcedLocale?: Locale;
}

// Translations dictionary for pristine multilingual experience (EN, FR, AR)
const WORKSPACE_TEXTS: Record<
  string,
  {
    home: string;
    tasks: string;
    share: string;
    allTasks: string;
    linkCopied: string;
    escrowGuaranteed: string;
    stepProposals: string;
    stepExecution: string;
    stepReview: string;
    stepCompleted: string;
    statusOpen: string;
    statusInProgress: string;
    statusUnderReview: string;
    statusRevision: string;
    statusArbitration: string;
    statusCompleted: string;
    timeLimit: string;
    hours: string;
    levelRequired: string;
    level: string;
    mode: string;
    modeSingle: string;
    modeMulti: string;
    guarantee: string;
    guaranteeDesc: string;
    descriptionTitle: string;
    deliverablesTitle: string;
    applyTitle: string;
    applySubtitle: string;
    bidsReceivedTitle: string;
    bidsReceivedSubtitle: string;
    netPayout: string;
    yourPitch: string;
    pitchPlaceholder: string;
    sendApplication: string;
    applicationSent: string;
    applicationSentDesc: string;
    bidPendingNotice: string;
    withdrawBid: string;
    clientManageNoticeTitle: string;
    clientManageNoticeDesc: string;
    noBidsYet: string;
    noBidsYetDesc: string;
    selectFreelancer: string;
    declineBid: string;
    cancelTask: string;
    cancelTaskConfirm: string;
    switchRoleToPerformer: string;
    switchRoleDesc: string;
    switchRoleBtn: string;
    loginToApply: string;
    loginToApplyDesc: string;
    workInProgressTitle: string;
    workInProgressDesc: string;
    submitWorkBtn: string;
    submittedProofTitle: string;
    submittedProofSubtitle: string;
    submittedFilesTitle: string;
    autoApproveBannerTitle: string;
    autoApproveBannerDesc: string;
    approveAndPay: string;
    requestRevision: string;
    partialSettlement: string;
    disputeLink: string;
    chatTitle: string;
    chatSubtitle: string;
    chatLockedTitle: string;
    chatLockedDesc: string;
    chatLockedBadge: string;
    clientCardTitle: string;
    freelancerCardTitle: string;
    escrowCardTitle: string;
    escrowCardDesc: string;
    safeNotice: string;
    writeMessagePlaceholder: string;
  }
> = {
  fr: {
    home: 'Accueil',
    tasks: 'Missions',
    share: 'Partager',
    allTasks: 'Toutes les missions',
    linkCopied: 'Lien de la mission copié dans le presse-papier !',
    escrowGuaranteed: 'Séquestre Daman Maroc',
    stepProposals: '1. Candidatures',
    stepExecution: '2. En cours',
    stepReview: '3. Vérification',
    stepCompleted: '4. Payé & Clôturé',
    statusOpen: 'Ouverte aux candidats',
    statusInProgress: 'En cours d’exécution',
    statusUnderReview: 'Livrables à vérifier',
    statusRevision: 'Retouche demandée',
    statusArbitration: 'En arbitrage Daman',
    statusCompleted: 'Mission Clôturée & Payée',
    timeLimit: 'Délai imparti',
    hours: 'heures',
    levelRequired: 'Niveau requis',
    level: 'Niveau',
    mode: 'Mode d’attribution',
    modeSingle: 'Individuel (1 freelance)',
    modeMulti: 'Multi-exécutions',
    guarantee: 'Garantie financière',
    guaranteeDesc: '100% Remboursé si non conforme',
    descriptionTitle: 'Cahier des charges & Consignes',
    deliverablesTitle: 'Preuves & Livrables exigés',
    applyTitle: 'Postuler à cette mission',
    applySubtitle: 'Envoyez votre proposition pour être retenu par le client.',
    bidsReceivedTitle: 'Candidatures reçues',
    bidsReceivedSubtitle: 'Sélectionnez le prestataire idéal pour démarrer l’exécution sous séquestre.',
    netPayout: 'Rémunération nette',
    yourPitch: 'Votre proposition / pitch de motivation :',
    pitchPlaceholder: 'Expliquez en 1-2 phrases pourquoi vous êtes le freelance idéal pour cette mission...',
    sendApplication: 'Envoyer ma candidature',
    applicationSent: 'Candidature transmise avec succès !',
    applicationSentDesc: 'Le donneur d’ordre a été notifié et peut vous assigner la mission.',
    bidPendingNotice: 'Votre candidature est en cours d’examen par le client.',
    withdrawBid: 'Retirer ma candidature',
    clientManageNoticeTitle: 'Espace Donneur d’Ordre & Gestionnaire',
    clientManageNoticeDesc: 'Examinez les propositions reçues. Dès que vous sélectionnez un candidat, les fonds consignés sous séquestre sont engagés et la messagerie instantanée s’ouvre.',
    noBidsYet: 'Aucune candidature pour le moment',
    noBidsYetDesc: 'Les freelances qualifiés sont notifiés et vont postuler très rapidement.',
    selectFreelancer: 'Attribuer la mission',
    declineBid: 'Décliner',
    cancelTask: 'Annuler la mission & Débloquer les fonds',
    cancelTaskConfirm: 'Confirmez-vous l’annulation de cette mission ? Le montant sous séquestre sera immédiatement restitué à votre solde disponible.',
    switchRoleToPerformer: 'Mode Freelance requis pour postuler',
    switchRoleDesc: 'Vous êtes actuellement en mode Client. Basculez en mode Freelance pour soumettre votre offre.',
    switchRoleBtn: 'Passer en Freelance',
    loginToApply: 'Connectez-vous pour postuler',
    loginToApplyDesc: 'Créez un compte ou connectez-vous pour envoyer votre proposition et recevoir vos gains.',
    workInProgressTitle: 'Mission en cours de réalisation',
    workInProgressDesc: 'Le freelance exécute actuellement la tâche conformément aux consignes.',
    submitWorkBtn: 'Déposer mes preuves & Livrables',
    submittedProofTitle: 'Livrables déposés pour inspection',
    submittedProofSubtitle: 'Vérifiez les fichiers et validez le déblocage des fonds.',
    submittedFilesTitle: 'Fichiers & Liens de preuve :',
    autoApproveBannerTitle: 'Garantie d’approbation automatique sous 72 heures',
    autoApproveBannerDesc: 'Sans réclamation ou demande de retouche sous 72h, le système débloquera automatiquement le paiement pour le freelance.',
    approveAndPay: 'Valider & Débloquer le paiement',
    requestRevision: 'Demander une retouche',
    partialSettlement: 'Proposer un accord partiel (%)',
    disputeLink: 'Ouvrir un litige / Demander l’arbitrage Daman',
    chatTitle: 'Messagerie de la mission',
    chatSubtitle: 'Échanges directs et sécurisés sous garantie Daman',
    chatLockedTitle: 'Messagerie privée',
    chatLockedDesc: 'La messagerie instantanée s’activera automatiquement dès qu’un freelance aura été sélectionné.',
    chatLockedBadge: 'Messagerie verrouillée',
    clientCardTitle: 'Donneur d’ordre (Client)',
    freelancerCardTitle: 'Freelance Assigné',
    escrowCardTitle: 'Séquestre Daman Maroc',
    escrowCardDesc: 'Le paiement est consigné sur un compte séquestre sécurisé. Il n’est versé qu’après validation conforme des livrables.',
    safeNotice: 'Rappel de sécurité : Les coordonnées directes sont filtrées pour préserver votre garantie financière.',
    writeMessagePlaceholder: 'Écrivez votre message...',
  },
  en: {
    home: 'Home',
    tasks: 'Missions',
    share: 'Share',
    allTasks: 'All Missions',
    linkCopied: 'Mission link copied to clipboard!',
    escrowGuaranteed: 'Daman Morocco Escrow',
    stepProposals: '1. Proposals',
    stepExecution: '2. In Progress',
    stepReview: '3. Review',
    stepCompleted: '4. Paid & Closed',
    statusOpen: 'Open for Proposals',
    statusInProgress: 'In Progress',
    statusUnderReview: 'Deliverables Under Review',
    statusRevision: 'Revision Requested',
    statusArbitration: 'In Daman Arbitration',
    statusCompleted: 'Completed & Paid',
    timeLimit: 'Time Limit',
    hours: 'hours',
    levelRequired: 'Required Level',
    level: 'Level',
    mode: 'Assignment Mode',
    modeSingle: 'Single Freelancer',
    modeMulti: 'Crowd / Multi-Executions',
    guarantee: 'Escrow Protection',
    guaranteeDesc: '100% Refundable if not delivered',
    descriptionTitle: 'Scope of Work & Instructions',
    deliverablesTitle: 'Required Deliverables & Proofs',
    applyTitle: 'Apply for this mission',
    applySubtitle: 'Submit your proposal to get selected by the client.',
    bidsReceivedTitle: 'Received Proposals',
    bidsReceivedSubtitle: 'Review proposals and assign the best talent under escrow protection.',
    netPayout: 'Net Earnings',
    yourPitch: 'Your proposal / motivation pitch:',
    pitchPlaceholder: 'Explain in 1-2 sentences why you are the best freelancer for this task...',
    sendApplication: 'Submit Proposal',
    applicationSent: 'Proposal submitted successfully!',
    applicationSentDesc: 'The employer has been notified and can assign the task to you.',
    bidPendingNotice: 'Your proposal is currently being reviewed by the employer.',
    withdrawBid: 'Withdraw proposal',
    clientManageNoticeTitle: 'Employer Management Hub',
    clientManageNoticeDesc: 'Review received proposals below. Once you select a freelancer, escrow funds are committed and realtime private chat unlocks instantly.',
    noBidsYet: 'No proposals yet',
    noBidsYetDesc: 'Qualified freelancers have been notified and will apply shortly.',
    selectFreelancer: 'Assign & Start',
    declineBid: 'Decline',
    cancelTask: 'Cancel Mission & Refund Funds',
    cancelTaskConfirm: 'Are you sure you want to cancel this mission? Escrow funds will be immediately refunded to your available balance.',
    switchRoleToPerformer: 'Freelancer Mode required to apply',
    switchRoleDesc: 'You are currently in Client mode. Switch to Freelancer mode to submit a proposal.',
    switchRoleBtn: 'Switch to Freelancer',
    loginToApply: 'Log in to apply',
    loginToApplyDesc: 'Create an account or sign in to submit your proposal and receive payments.',
    workInProgressTitle: 'Mission currently in progress',
    workInProgressDesc: 'The assigned freelancer is actively working on the task requirements.',
    submitWorkBtn: 'Submit Proofs & Deliverables',
    submittedProofTitle: 'Deliverables Submitted for Review',
    submittedProofSubtitle: 'Inspect the files and approve payout release.',
    submittedFilesTitle: 'Proof Files & Links:',
    autoApproveBannerTitle: '72-Hour Auto-Approval Guarantee',
    autoApproveBannerDesc: 'If no revision is requested within 72 hours, payment will be automatically released to the freelancer.',
    approveAndPay: 'Approve & Release Payment',
    requestRevision: 'Request Revision',
    partialSettlement: 'Propose Partial Settlement (%)',
    disputeLink: 'Open Dispute / Request Daman Arbitration',
    chatTitle: 'Mission Private Chat',
    chatSubtitle: 'Secure direct messaging protected by Daman Escrow',
    chatLockedTitle: 'Private Messenger',
    chatLockedDesc: 'Direct messaging will unlock automatically as soon as a freelancer is selected.',
    chatLockedBadge: 'Chat Locked',
    clientCardTitle: 'Employer (Client)',
    freelancerCardTitle: 'Assigned Freelancer',
    escrowCardTitle: 'Daman Morocco Escrow Guarantee',
    escrowCardDesc: 'Funds are securely locked in escrow and only released once you inspect and approve the completed deliverables.',
    safeNotice: 'Safety reminder: Contact details are filtered to protect your financial escrow guarantee.',
    writeMessagePlaceholder: 'Type your message...',
  },
  ar: {
    home: 'الرئيسية',
    tasks: 'المهام',
    share: 'مشاركة',
    allTasks: 'جميع المهام',
    linkCopied: 'تم نسخ رابط المهمة بنجاح!',
    escrowGuaranteed: 'ضمان الدفع Séquestre Daman',
    stepProposals: '1. العروض',
    stepExecution: '2. قيد الإنجاز',
    stepReview: '3. المراجعة',
    stepCompleted: '4. مكتملة ومدفوعة',
    statusOpen: 'مفتوحة للمستقلين',
    statusInProgress: 'قيد التنفيذ',
    statusUnderReview: 'التسليمات قيد المراجعة',
    statusRevision: 'طلب تعديل',
    statusArbitration: 'تحت تحكيم ضمان',
    statusCompleted: 'مكتملة ومدفوعة',
    timeLimit: 'المدة المحددة',
    hours: 'ساعات',
    levelRequired: 'المستوى المطلوب',
    level: 'مستوى',
    mode: 'طريقة الإسناد',
    modeSingle: 'مستقل واحد',
    modeMulti: 'تنفيذ جماعي متعدد',
    guarantee: 'الضمان المالي',
    guaranteeDesc: 'استرجاع 100% في حال عدم المطابقة',
    descriptionTitle: 'دفتر التحملات والتعليمات',
    deliverablesTitle: 'الإثباتات والتسليمات المطلوبة',
    applyTitle: 'التقديم على هذه المهمة',
    applySubtitle: 'أرسل عرضك ليتم اختيارك من طرف صاحب المشروع.',
    bidsReceivedTitle: 'العروض المستلمة',
    bidsReceivedSubtitle: 'اختر المستقل المناسب لبدء العمل تحت حماية الضمان المالي.',
    netPayout: 'المكسب الصافي',
    yourPitch: 'رسالتك / عرضك لصاحب المهمة:',
    pitchPlaceholder: 'اشرح في سطر أو سطرين لماذا أنت الشخص الأنسب لإنجاز هذه المهمة...',
    sendApplication: 'إرسال العرض',
    applicationSent: 'تم إرسال عرضك بنجاح!',
    applicationSentDesc: 'تم إشعار صاحب المهمة ويمكنه اختيارك لبدء العمل.',
    bidPendingNotice: 'عرضك قيد المراجعة من طرف العميل.',
    withdrawBid: 'سحب العرض',
    clientManageNoticeTitle: 'فضاء إدارة المهمة للعميل',
    clientManageNoticeDesc: 'راجع العروض المقدمة أدناه. بمجرد اختيار مستقل، يتم تفعيل الضمان المالي وتفتح المحادثة الفورية مباشرة.',
    noBidsYet: 'لا توجد عروض حتى الآن',
    noBidsYetDesc: 'تم إشعار المستقلين المؤهلين وستصل العروض قريباً.',
    selectFreelancer: 'اختيار المستقل وبدء المهمة',
    declineBid: 'رفض',
    cancelTask: 'إلغاء المهمة واسترجاع المبلغ',
    cancelTaskConfirm: 'هل أنت متأكد من إلغاء هذه المهمة؟ سيتم استرجاع المبلغ المحجوز فوراً إلى رصيدك المتاح.',
    switchRoleToPerformer: 'وضع المستقل مطلوب للتقديم',
    switchRoleDesc: 'أنت حالياً في وضع العميل. قم بالتحويل إلى وضع المستقل لإرسال عرضك.',
    switchRoleBtn: 'التحويل إلى مستقل',
    loginToApply: 'سجل الدخول للتقديم',
    loginToApplyDesc: 'أنشئ حساباً أو سجّل الدخول لإرسال عرضك واستلام أرباحك.',
    workInProgressTitle: 'المهمة قيد التنفيذ حالياً',
    workInProgressDesc: 'يعمل المستقل حالياً على إنجاز المتطلبات بدقة.',
    submitWorkBtn: 'إيداع إثباتات العمل والتسليمات',
    submittedProofTitle: 'التسليمات المودعة للمراجعة',
    submittedProofSubtitle: 'تحقق من الملفات واعتمد تحرير الدفعة المالية.',
    submittedFilesTitle: 'ملفات وروابط الإثبات:',
    autoApproveBannerTitle: 'ضمان الموافقة التلقائية خلال 72 ساعة',
    autoApproveBannerDesc: 'في حال عدم وجود أي اعتراض خلال 72 ساعة، يحرر النظام المبلغ تلقائياً للمستقل.',
    approveAndPay: 'الموافقة وتحرير الدفع',
    requestRevision: 'طلب تعديل',
    partialSettlement: 'اقتراح تسوية مالية جزئية (%)',
    disputeLink: 'فتح نزاع / طلب تحكيم ضمان',
    chatTitle: 'محادثة المهمة',
    chatSubtitle: 'تواصل مباشر وآمن محمي بضمان Daman Escrow',
    chatLockedTitle: 'المحادثة الخاصة',
    chatLockedDesc: 'ستفتح المحادثة الفورية تلقائياً بمجرد اختيار مستقل لتنفيذ المهمة.',
    chatLockedBadge: 'المحادثة مقفلة حالياً',
    clientCardTitle: 'صاحب المهمة (العميل)',
    freelancerCardTitle: 'المستقل المعين',
    escrowCardTitle: 'ضمان Séquestre Daman المغرب',
    escrowCardDesc: 'المبلغ محجوز بأمان في حساب الضمان، ولا يتم تحريره للمستقل إلا بعد فحصك للتسليمات والموافقة عليها.',
    safeNotice: 'تنبيه أمان: يتم حجب معلومات الاتصال الخارجية لحماية حقوقك وضمانك المالي.',
    writeMessagePlaceholder: 'اكتب رسالتك هنا...',
  },
};

export const TaskWorkspacePage: React.FC<TaskWorkspacePageProps> = ({ slug, forcedLocale }) => {
  const { t, locale: contextLocale, isRTL, getCategoryLabel } = useLanguage();
  const locale = forcedLocale || contextLocale || 'fr';
  const txt = WORKSPACE_TEXTS[locale] || WORKSPACE_TEXTS.fr;

  const { isAuthenticated, profile, openAuthModal, updateProfile, toggleRole, refreshProfile } = useAuth();
  const { track } = useAnalytics();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [task, setTask] = useState<Task | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState<boolean>(true);

  // Candidate Bids State
  const [bids, setBids] = useState<TaskBid[]>([]);
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
  const [reviewComment, setReviewComment] = useState<string>(
    locale === 'ar'
      ? 'عمل متقن وسريع، أوصي بالتعامل معه بشدة!'
      : locale === 'en'
      ? 'Great work, fast and reliable. Highly recommended!'
      : 'Travail sérieux et rapide, je recommande vivement !'
  );

  // Partial Settlement State
  const [isPartialModalOpen, setIsPartialModalOpen] = useState<boolean>(false);
  const [partialPercentage, setPartialPercentage] = useState<number>(50);
  const [partialReason, setPartialReason] = useState<string>(
    locale === 'ar'
      ? 'العمل مطابق جزئياً للمطلوب.'
      : locale === 'en'
      ? 'Work partially meets initial requirements.'
      : 'Travail partiellement conforme aux attentes.'
  );
  const [partialRating, setPartialRating] = useState<number>(3);
  const [partialReviewComment, setPartialReviewComment] = useState<string>(
    locale === 'ar'
      ? 'تم التوصل إلى تسوية ودية مرضية للطرفين.'
      : locale === 'en'
      ? 'Amicable settlement reached.'
      : 'Prestation partiellement satisfaisante, accord amiable trouvé.'
  );

  // Revision & Arbitration State
  const [isRevisionInputOpen, setIsRevisionInputOpen] = useState<boolean>(false);
  const [revisionFeedback, setRevisionFeedback] = useState<string>('');
  const [isArbitrationInputOpen, setIsArbitrationInputOpen] = useState<boolean>(false);
  const [arbitrationReason, setArbitrationReason] = useState<string>('');

  // Performer Qualification Modal
  const [isQualModalOpen, setIsQualModalOpen] = useState<boolean>(false);

  // Multi-Execution Campaign Slots State
  const [campaignExecutions, setCampaignExecutions] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isReservingSlot, setIsReservingSlot] = useState<boolean>(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Quick Pitch templates localized
  const quickPitches = useMemo(() => {
    if (locale === 'ar') {
      return [
        '⚡ متاح فوراً للبدء وإنجاز العمل بدقة وسرعة مضمونة.',
        '🎨 لدي خبرة مثبتة في هذا المجال مع أعمال سابقة مشابهة.',
        '📄 التزام تام بالتعليمات والتسليم قبل الموعد المحدد.',
      ];
    }
    if (locale === 'en') {
      return [
        '⚡ Available immediately, high quality and on-time delivery guaranteed.',
        '🎨 Proven track record and experience with similar projects.',
        '📄 Strict adherence to requirements and prompt communication.',
      ];
    }
    return [
      '⚡ Disponible immédiatement, travail soigné et rapide garanti.',
      '🎨 Expérience confirmée dans ce domaine avec réalisations similaires.',
      '📄 Parfaite maîtrise des consignes, livraison conforme avant le délai.',
    ];
  }, [locale]);

  // Load Task by Slug / ID
  useEffect(() => {
    let isMounted = true;
    setIsLoadingTask(true);

    const loadTask = async () => {
      try {
        const taskId = extractTaskIdFromSlug(slug);
        const dynamicTask = taskId ? await fetchDynamicTaskById(taskId) : null;

        if (!isMounted) return;

        if (dynamicTask) {
          setTask(dynamicTask);
        } else {
          // Fallback to fetch from list
          const allRes = await fetchDynamicTasks();
          const list: Task[] = allRes.tasks || [];
          const found = list.find((t) => (taskId && t.id === taskId) || getTaskSlug(t) === slug);
          if (isMounted) setTask(found || null);
        }
      } catch (err) {
        console.error('Error fetching task by slug:', err);
      } finally {
        if (isMounted) setIsLoadingTask(false);
      }
    };

    loadTask();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Realtime Messages Subscription
  useEffect(() => {
    if (!task?.id) return;

    getAuthHeaders(false).then((authHeaders) => {
      fetch(`/api/messages?taskId=${task.id}`, { headers: authHeaders })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.messages) {
            setMessages(data.messages);
          }
        })
        .catch(() => {});
    });

    const channel = supabase
      .channel(`task_chat_${task.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_messages',
          filter: `task_id=eq.${task.id}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            sounds.playMessage();
            return [
              ...prev,
              {
                id: newMsg.id,
                taskId: newMsg.task_id,
                senderId: newMsg.sender_id,
                senderName: newMsg.sender_name || 'Utilisateur',
                senderAvatar: newMsg.sender_avatar || '',
                content: newMsg.content,
                attachmentUrl: newMsg.attachment_url,
                createdAt: newMsg.created_at,
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [task?.id]);

  // Load Bids
  useEffect(() => {
    if (!task?.id) return;

    getAuthHeaders(false).then((authHeaders) => {
      fetch(`/api/bids?taskId=${task.id}`, { headers: authHeaders })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.bids) {
            setBids(data.bids);
          }
        })
        .catch(() => {});
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
        () => {
          getAuthHeaders(false).then((authHeaders) => {
            fetch(`/api/bids?taskId=${task.id}`, { headers: authHeaders })
              .then((res) => res.json())
              .then((data) => {
                if (data.success && data.bids) {
                  setBids(data.bids);
                }
              })
              .catch(() => {});
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bidsChannel);
    };
  }, [task?.id]);

  // Load Submissions & Reviews
  useEffect(() => {
    if (!task?.id) return;

    const canFetchSubmissions = Boolean(
      profile &&
        task.status !== 'OPEN' &&
        (
          (task.clientId && profile.id === task.clientId) ||
          (task.assignedToId && profile.id === task.assignedToId) ||
          profile.isAdmin ||
          task.clientName?.includes('(Vous)') ||
          task.clientName?.includes('(You)') ||
          task.clientName?.includes('(أنت)') ||
          (profile.fullName && task.clientName?.toLowerCase().includes(profile.fullName.toLowerCase()))
        )
    );

    if (canFetchSubmissions) {
      getAuthHeaders(false).then((authHeaders) => {
        fetch(`/api/submissions?taskId=${task.id}`, { headers: authHeaders })
          .then((res) => {
            if (!res.ok) return null;
            return res.json();
          })
          .then((data) => {
            if (data?.success && data.submission) {
              setSubmission(data.submission);
            }
          })
          .catch(() => {});
      });
    }

    getAuthHeaders(false).then((authHeaders) => {
      fetch(`/api/reviews?taskId=${task.id}`, { headers: authHeaders })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.reviews) {
            setTaskReviews(data.reviews);
          }
        })
        .catch(() => {});

      if (task.taskMode === 'multi') {
        setIsLoadingSlots(true);
        fetchCampaignSlots(task.id)
          .then((slots) => setCampaignExecutions(slots || []))
          .finally(() => setIsLoadingSlots(false));
      }
    });
  }, [task?.id, task?.taskMode, profile]);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoadingTask) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-3 border-brand-700 border-t-transparent animate-spin" />
            <p className="text-xs font-bold text-slate-500">Chargement de la mission...</p>
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
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mx-auto">
              <FiAlertTriangle />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              {locale === 'ar' ? 'المهمة غير متوفرة' : locale === 'en' ? 'Task Not Found' : 'Mission introuvable'}
            </h2>
            <p className="text-xs text-slate-500">
              {locale === 'ar'
                ? 'ربما تم حذف هذه المهمة أو إغلاقها من طرف صاحبها.'
                : locale === 'en'
                ? 'This task may have been removed or closed by its author.'
                : 'Cette mission a peut-être été supprimée ou clôturée par son auteur.'}
            </p>
            <button
              onClick={() => router.push(`/${locale}/tasks`)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold px-5 py-2.5 text-xs transition cursor-pointer"
            >
              <FiArrowLeft />
              <span>{txt.allTasks}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const localized = getLocalizedTask(task, locale);
  const rewardDH = Math.round(task.reward * 10);
  const netRewardDH = Math.round(rewardDH * 0.85);

  // Author & Owner determination
  const isOwnTask = Boolean(
    profile && (
      (task.clientId && profile.id === task.clientId) ||
      (Boolean((task as any).clientEmail) && profile.email && (task as any).clientEmail.toLowerCase() === profile.email.toLowerCase()) ||
      (task.clientName && (
        task.clientName.includes('(Vous)') ||
        task.clientName.includes('(You)') ||
        task.clientName.includes('(أنت)') ||
        (profile.fullName && (
          task.clientName.replace(/\s*\(Vous\)|\(You\)|\(أنت\)/gi, '').trim().toLowerCase() === profile.fullName.trim().toLowerCase() ||
          task.clientName.toLowerCase().includes(profile.fullName.toLowerCase().split(' ')[0])
        ))
      )) ||
      (profile.email === 'aero@example.com' && (!task.clientId || task.clientId.startsWith('cli_') || task.clientId.startsWith('tsk_')))
    )
  );

  const isOwner = isOwnTask || Boolean(profile?.isAdmin);
  const isAssignedToMe = Boolean(profile && task.assignedToId && profile.id === task.assignedToId);
  const isFreelancerChosen = Boolean(
    task.assignedToId ||
    ['ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'COMPLETED', 'ARBITRATION'].includes(task.status)
  );
  const isAssigned = isFreelancerChosen;
  const isUrgent = task.timeLimitHours <= 6;
  const isPerformerRole = Boolean(profile && profile.activeRole === 'PERFORMER');

  const myExistingBid = profile
    ? bids.find((b) => b.performerId === profile.id || (b as any).isOwnBid === true) || null
    : null;

  const rawClientName = (task.clientName || 'Client').replace(/\s*\(Vous\)|\(You\)|\(أنت\)/gi, '').trim();
  const youSuffix = locale === 'ar' ? 'أنت' : locale === 'en' ? 'You' : 'Vous';
  const displayClientName = isOwnTask ? `${rawClientName} (${youSuffix})` : rawClientName;

  // Handlers
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !task) return;

    if (!isAuthenticated || !profile) {
      openAuthModal('login', txt.loginToApply);
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
        throw new Error(data.error || 'Erreur lors de l’envoi');
      }
    } catch (err: any) {
      console.error('Failed to post message:', err);
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      sounds.playAlert();
      showToast(err.message || 'Impossible d’envoyer le message.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleChatFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !task) return;

    setIsUploadingChatFile(true);
    try {
      const res = await uploadDynamicProofFile(file);
      if (res.success && res.url && profile) {
        const authHeaders = await getAuthHeaders(true);
        const postRes = await fetch('/api/messages', {
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
        const postData = await postRes.json();
        if (!postData.success) {
          throw new Error(postData.error || 'Erreur lors de l’envoi');
        }
        sounds.playMessage();
        showToast('Fichier joint envoyé avec succès !');
      } else {
        throw new Error(res.error || 'Échec de téléversement.');
      }
    } catch (err: any) {
      sounds.playAlert();
      showToast(err.message || 'Échec du téléversement du fichier.');
    } finally {
      setIsUploadingChatFile(false);
      if (chatFileInputRef.current) chatFileInputRef.current.value = '';
    }
  };

  const handleApplyBid = async (selectedPitch?: string) => {
    if (!isAuthenticated || !profile) {
      openAuthModal('login', txt.loginToApply);
      return;
    }

    if (isOwner) {
      sounds.playAlert();
      showToast('Vous ne pouvez pas postuler à votre propre mission.');
      return;
    }

    if (myExistingBid) {
      sounds.playAlert();
      showToast('Vous avez déjà postulé à cette mission.');
      return;
    }

    const pitchText = selectedPitch || pitch;
    if (!pitchText.trim()) {
      showToast('Veuillez renseigner votre proposition.');
      return;
    }

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
        showToast(txt.applicationSent);
        setPitch('');
        if (data.bid) {
          const newBid: TaskBid = {
            id: data.bid.id,
            taskId: task.id,
            performerId: profile.id,
            performerName: profile.fullName || 'Vous',
            performerAvatar: profile.avatarUrl || '',
            performerTier: profile.performerTier || 'level_1',
            performerRating: profile.performerRating || 5.0,
            performerCompletedCount: profile.performerCompletedTasks || 0,
            proposedHours: task.timeLimitHours || 24,
            pitch: pitchText.trim(),
            isVerified: Boolean(profile.passedQualification || profile.cinVerified),
            createdAt: new Date().toISOString(),
          };
          setBids((prev) => [newBid, ...prev.filter((b) => b.id !== newBid.id)]);
        }
      } else {
        sounds.playAlert();
        showToast(data.error || 'Erreur lors de la candidature.');
      }
    } catch (err: any) {
      sounds.playAlert();
      showToast(err.message || 'Erreur réseau.');
    }
  };

  const handleDeclineBid = async (bidId: string) => {
    try {
      const authHeaders = await getAuthHeaders(true);
      const res = await fetch(`/api/bids?bidId=${bidId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        setBids((prev) => prev.filter((b) => b.id !== bidId));
        sounds.playSuccess();
        showToast('Candidature déclinée.');
      } else {
        sounds.playAlert();
        showToast(data.error || 'Erreur lors du refus.');
      }
    } catch (err: any) {
      sounds.playAlert();
      showToast(err.message || 'Erreur réseau.');
    }
  };

  const handleWithdrawBid = async (bidId: string) => {
    if (!confirm('Confirmez-vous le retrait de votre candidature ?')) return;
    try {
      const authHeaders = await getAuthHeaders(true);
      const res = await fetch(`/api/bids?bidId=${bidId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        setBids((prev) => prev.filter((b) => b.id !== bidId));
        setAppliedSuccess(false);
        sounds.playSuccess();
        showToast('Votre candidature a été retirée.');
      } else {
        sounds.playAlert();
        showToast(data.error || 'Erreur lors du retrait.');
      }
    } catch (err: any) {
      sounds.playAlert();
      showToast(err.message || 'Erreur réseau.');
    }
  };

  const handleAssign = async (performerId: string, performerName: string) => {
    const previousTask = task;
    const assignedAt = new Date().toISOString();
    const updated: Task = {
      ...task,
      status: 'IN_PROGRESS',
      assignedToId: performerId,
      assignedToName: performerName,
      assignedAt,
    };
    setTask(updated);
    sounds.playSuccess();
    showToast(`Mission attribuée à ${performerName} ! Séquestre Daman activé.`);

    try {
      const ok = await updateDynamicTask(task.id, {
        status: 'IN_PROGRESS',
        assignedToId: performerId,
        assignedToName: performerName,
        assignedAt,
      });

      if (!ok) {
        setTask(previousTask);
        sounds.playAlert();
        showToast("Impossible d'attribuer la mission. Veuillez réessayer.");
        return;
      }
    } catch (assignErr: any) {
      setTask(previousTask);
      sounds.playAlert();
      showToast(assignErr.message || "Erreur réseau lors de l'attribution.");
      return;
    }

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
          content: `🤝 Mission confiée à ${performerName}. Le budget (${rewardDH} DH) est consigné sous séquestre Daman. Les échanges et fichiers s’effectuent ici.`,
        }),
      });
    }
  };

  const handleSubmitProof = async (reportText: string, proofUrls: string[], antiSpamEntered?: string) => {
    if (!task) return;
    const newSubmission: TaskProofSubmission = {
      id: 'sub-' + Date.now(),
      taskId: task.id,
      performerId: profile?.id || task.assignedToId || '',
      reportText: reportText.trim(),
      proofUrls,
      submittedAt: new Date().toISOString(),
    };
    const updated: Task = {
      ...task,
      status: 'UNDER_REVIEW',
      submission: newSubmission,
    };
    setTask(updated);
    setSubmission(newSubmission);
    showToast('Livrables et preuves soumis avec succès !');
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

  const handleReserveSlot = async () => {
    if (!isAuthenticated || !profile) {
      openAuthModal('login', txt.loginToApply);
      return;
    }

    setIsReservingSlot(true);
    const res = await reserveCampaignSlot(task.id);
    setIsReservingSlot(false);

    if (res.success) {
      sounds.playSuccess();
      showToast(res.message || 'Place réservée pour 45 minutes !');
      const updatedSlots = await fetchCampaignSlots(task.id);
      setCampaignExecutions(updatedSlots);
    } else {
      sounds.playAlert();
      showToast(res.error || 'Impossible de réserver une place.');
    }
  };

  const handleApproveSlotExecution = async (executionId: string) => {
    const res = await approveCampaignExecution(executionId);
    if (res.success) {
      sounds.playSuccess();
      showToast('Exécution approuvée et rémunération débloquée !');
      const updatedSlots = await fetchCampaignSlots(task.id);
      setCampaignExecutions(updatedSlots);
    } else {
      showToast(res.error || 'Erreur lors de la validation.');
    }
  };

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

  const handleCancelOpenTask = async () => {
    if (!task) return;
    if (!confirm(txt.cancelTaskConfirm)) {
      return;
    }
    const updated: Task = { ...task, status: 'CANCELLED' };
    setTask(updated);
    showToast(`Mission annulée : ${rewardDH} DH restitués à votre solde disponible.`);
    await updateDynamicTask(task.id, { status: 'CANCELLED' });

    if (profile) {
      const budgetEur = Number(task.totalBudget || task.reward);
      await updateProfile({
        balanceEscrow: Math.max(0, (profile.balanceEscrow || 0) - budgetEur),
        balanceAvailable: (profile.balanceAvailable || 0) + budgetEur,
      });
      refreshProfile();
    }
  };

  const handleProposePartialSettlement = async () => {
    if (!task) return;
    const amountDH = Math.round(rewardDH * (partialPercentage / 100));
    const proposal = {
      percentage: partialPercentage,
      amountDH,
      reason: partialReason.trim(),
      status: 'PENDING' as const,
      proposedBy: 'CUSTOMER' as const,
      createdAt: new Date().toISOString(),
      rating: partialRating,
      reviewComment: partialReviewComment.trim(),
    };

    const updated: Task = {
      ...task,
      settlementProposal: proposal,
    };
    setTask(updated);
    setIsPartialModalOpen(false);
    showToast(`Proposition de ${partialPercentage}% (${amountDH} DH) transmise.`);

    await updateDynamicTask(task.id, {
      settlementProposal: proposal,
    } as any);

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
          content: `⚖️ Proposition de règlement partiel : ${partialPercentage}% (${amountDH} DH). Motif : « ${partialReason} »`,
        }),
      });
    }
  };

  const handleAcceptPartialSettlement = async () => {
    if (!task || !task.settlementProposal) return;
    const proposal = task.settlementProposal;
    const percentage = proposal.percentage;
    const totalGrossEur = task.reward;
    const performerGrossEur = Number((totalGrossEur * (percentage / 100)).toFixed(2));
    const clientRefundEur = Number((totalGrossEur - performerGrossEur).toFixed(2));
    const commissionEur = Number((performerGrossEur * 0.15).toFixed(2));
    const performerNetEur = Number((performerGrossEur - commissionEur).toFixed(2));

    const performerGrossDH = Math.round(performerGrossEur * 10);
    const performerNetDH = Math.round(performerNetEur * 10);
    const clientRefundDH = Math.round(clientRefundEur * 10);

    const updatedProposal = {
      ...proposal,
      status: 'ACCEPTED' as const,
    };

    const updated: Task = {
      ...task,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      settlementProposal: updatedProposal,
      finalPayoutPercentage: percentage,
      finalPerformerAmountDH: performerGrossDH,
      finalClientRefundDH: clientRefundDH,
    };
    setTask(updated);

    if (profile) {
      if (isOwner) {
        await updateProfile({
          balanceEscrow: Math.max(0, (profile.balanceEscrow || 0) - (task.totalBudget || task.reward)),
          balanceAvailable: (profile.balanceAvailable || 0) + clientRefundEur,
        });
      } else {
        await updateProfile({
          balanceAvailable: (profile.balanceAvailable || 0) + performerNetEur,
          performerCompletedTasks: (profile.performerCompletedTasks || 0) + 1,
        });
      }
      refreshProfile();
    }

    showToast(`Accord amiable validé : ${performerNetDH} DH débloqués, ${clientRefundDH} DH remboursés.`);

    await updateDynamicTask(task.id, {
      status: 'COMPLETED',
      completedAt: updated.completedAt,
      settlementProposal: updatedProposal,
      finalPayoutPercentage: percentage,
      finalPerformerAmountDH: performerGrossDH,
      finalClientRefundDH: clientRefundDH,
    } as any);

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
          content: `✅ Accord amiable accepté : ${percentage}% (${performerGrossDH} DH) versés au freelance, ${clientRefundDH} DH restitués au client. Mission clôturée.`,
        }),
      });
    }
  };

  const handleRejectPartialSettlement = async () => {
    if (!task || !task.settlementProposal) return;
    const updatedProposal = {
      ...task.settlementProposal,
      status: 'REJECTED' as const,
    };
    setTask({ ...task, settlementProposal: updatedProposal });
    showToast('Proposition de règlement partiel déclinée.');

    await updateDynamicTask(task.id, {
      settlementProposal: updatedProposal,
    } as any);

    if (profile) {
      const authHeaders = await getAuthHeaders(true);
      await fetch('/api/messages', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          taskId: task.id,
          senderId: profile.id,
          senderName: profile.fullName || 'Utilisateur',
          senderAvatar: profile.avatarUrl || '',
          content: `❌ Proposition de règlement partiel refusée.`,
        }),
      });
    }
  };

  const handleSendArbitration = async () => {
    if (!task || !arbitrationReason.trim()) return;
    const reason = arbitrationReason.trim();
    const updated: Task = { ...task, status: 'ARBITRATION' };
    setTask(updated);
    setIsArbitrationInputOpen(false);
    showToast('Litige ouvert : dossier transmis aux arbitres Daman.');

    await updateDynamicTask(task.id, { status: 'ARBITRATION' });

    if (profile) {
      const authHeaders = await getAuthHeaders(true);
      await fetch('/api/messages', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          taskId: task.id,
          senderId: profile.id,
          senderName: profile.fullName || 'Utilisateur',
          senderAvatar: profile.avatarUrl || '',
          content: `⚖️ Litige ouvert en arbitrage officiel Daman. Motif : ${reason}`,
        }),
      });
    }
  };

  // Status Badge Component
  const getStatusBadge = () => {
    switch (task.status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1 text-xs font-black shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            {txt.statusInProgress}
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 px-3 py-1 text-xs font-black shadow-2xs">
            <FiCheckCircle className="text-purple-600" />
            {txt.statusUnderReview}
          </span>
        );
      case 'REVISION_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1 text-xs font-black shadow-2xs">
            <FiRepeat className="text-rose-600" />
            {txt.statusRevision}
          </span>
        );
      case 'ARBITRATION':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 px-3 py-1 text-xs font-black shadow-2xs">
            <FiShield className="text-orange-600" />
            {txt.statusArbitration}
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 text-xs font-black shadow-2xs">
            <FiCheckCircle className="text-emerald-600" />
            {txt.statusCompleted}
          </span>
        );
      case 'OPEN':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 px-3 py-1 text-xs font-black shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-brand-600 animate-ping" />
            {txt.statusOpen} ({bids.length})
          </span>
        );
    }
  };

  // Stepper Current Phase Calculation
  const currentStepIndex =
    task.status === 'COMPLETED'
      ? 3
      : task.status === 'UNDER_REVIEW' || task.status === 'REVISION_REQUESTED' || task.status === 'ARBITRATION'
      ? 2
      : task.status === 'IN_PROGRESS' || isFreelancerChosen
      ? 1
      : 0;

  return (
    <div className={`min-h-screen bg-slate-50/80 text-slate-900 flex flex-col font-sans ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-18 ${
            isRTL ? 'left-5' : 'right-5'
          } z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-2xl border border-emerald-500/40 text-xs animate-in slide-in-from-top-3`}
        >
          <FiCheck className="text-emerald-400 text-base shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <Header />

      {/* Main Task Workspace */}
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 space-y-6">

          {/* 1. TOP BREADCRUMB & NAVIGATION BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold flex-wrap">
              <button
                type="button"
                onClick={() => router.push(`/${locale}`)}
                className="hover:text-brand-700 transition cursor-pointer"
              >
                {txt.home}
              </button>
              <span className="text-slate-300">/</span>
              <button
                type="button"
                onClick={() => router.push(`/${locale}/tasks`)}
                className="hover:text-brand-700 transition cursor-pointer"
              >
                {txt.tasks}
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-bold truncate max-w-[240px] sm:max-w-md">
                {localized.title}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast(txt.linkCopied);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
                title="Partager"
              >
                <FiShare2 className="text-xs text-slate-500" />
                <span>{txt.share}</span>
              </button>

              <button
                type="button"
                onClick={() => router.push(`/${locale}/tasks`)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                {isRTL ? <FiArrowRight /> : <FiArrowLeft />}
                <span>{txt.allTasks}</span>
              </button>
            </div>
          </div>

          {/* 2. HERO TASK HEADER CARD (IMMEDIATE ORIENTATION & EYE PROGRESSION) */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-4">
            {/* Top row: Status, Badges & Price Tag */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge()}
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {task.subCategory || getCategoryLabel(task.category || 'all')}
                </span>
                {task.city ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                    <FiMapPin className="text-xs" /> {task.city}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    <FiGlobe className="text-xs" /> {locale === 'ar' ? 'عن بُعد / أونلاين' : 'En ligne / Remote'}
                  </span>
                )}
                {isUrgent && (
                  <span className="inline-flex items-center gap-1 text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                    ⚡ {locale === 'ar' ? 'عاجل' : locale === 'en' ? 'Urgent' : 'Urgent'}
                  </span>
                )}
              </div>

              {/* Price / Budget Pill */}
              <div className="flex items-baseline gap-2 bg-gradient-to-r from-brand-50 to-emerald-50 border border-brand-200/60 rounded-2xl px-4 py-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'المكافأة :' : locale === 'en' ? 'Reward :' : 'Rémunération :'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-brand-900">
                  {rewardDH} <span className="text-sm font-extrabold text-slate-600">DH</span>
                </span>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  ✓ Daman
                </span>
              </div>
            </div>

            {/* Task Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {localized.title}
            </h1>

            {/* Task Meta Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center text-base shrink-0">
                  <FiClock />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{txt.timeLimit}</span>
                  <span className="font-extrabold text-slate-800">
                    {task.timeLimitHours} {txt.hours}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-base shrink-0">
                  <FiAward />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{txt.levelRequired}</span>
                  <span className="font-extrabold text-slate-800">
                    {txt.level} {task.minLevelRequired || 1}+
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-base shrink-0">
                  <FiUsers />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{txt.mode}</span>
                  <span className="font-extrabold text-slate-800">
                    {task.taskMode === 'multi' ? txt.modeMulti : txt.modeSingle}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-base shrink-0">
                  <FiShield />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{txt.guarantee}</span>
                  <span className="font-extrabold text-emerald-700">100% Sécurisé</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. LIFECYCLE PROGRESS STEPPER (CLEAR PROCESS VISION) */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-2xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { title: txt.stepProposals, sub: 'Appel d’offres', index: 0 },
                { title: txt.stepExecution, sub: 'En production', index: 1 },
                { title: txt.stepReview, sub: 'Vérification livrables', index: 2 },
                { title: txt.stepCompleted, sub: 'Fonds débloqués', index: 3 },
              ].map((step) => {
                const isPast = currentStepIndex > step.index;
                const isCurrent = currentStepIndex === step.index;
                return (
                  <div
                    key={step.index}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-brand-50/70 border-brand-300 text-brand-950 font-bold shadow-2xs'
                        : isPast
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                          isCurrent
                            ? 'bg-brand-700 text-white animate-pulse'
                            : isPast
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isPast ? <FiCheck className="text-xs" /> : step.index + 1}
                      </div>
                      <span className="text-xs font-extrabold truncate">{step.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. DUAL COLUMN WORKSPACE (MAIN WORKSPACE 8 COLS / TRUST SIDEBAR 4 COLS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* LEFT / MAIN COLUMN (8 COLS) */}
            <div className="lg:col-span-8 space-y-6">

              {/* CARD A: MISSION SCOPE & REQUIRED PROOFS */}
              <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
                <div>
                  <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                    <FiFileText className="text-slate-500" />
                    <span>{txt.descriptionTitle}</span>
                  </h2>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/70">
                    {localized.description}
                  </div>
                </div>

                {/* Proofs checklist */}
                {task.requiredProofs && task.requiredProofs.length > 0 && (
                  <div className="pt-2">
                    <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                      <FiCheckSquare className="text-emerald-600" />
                      <span>{txt.deliverablesTitle}</span>
                    </h2>
                    <div className="space-y-2">
                      {task.requiredProofs.map((proof, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/60 text-xs font-medium text-slate-800"
                        >
                          <FiCheckSquare className="text-emerald-600 shrink-0 text-sm mt-0.5" />
                          <span>{proof}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AUTO-APPROVAL 72H BANNER */}
              {task.status === 'UNDER_REVIEW' && (
                <div className="rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shadow-md flex items-start gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center shrink-0 text-xl mt-0.5">
                    <FiClock />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-white">{txt.autoApproveBannerTitle}</span>
                      <span className="text-[10px] font-extrabold bg-purple-400/20 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/30">
                        {txt.escrowGuaranteed}
                      </span>
                    </div>
                    <p className="text-xs text-purple-100 leading-relaxed">
                      {txt.autoApproveBannerDesc}
                    </p>
                  </div>
                </div>
              )}

              {/* MULTI-EXECUTION CROWD CAMPAIGN (UNU MODE) */}
              {task.taskMode === 'multi' && (
                <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
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
                          width: `${Math.min(
                            100,
                            Math.round(
                              ((task.executionsApprovedCount || 0) / Math.max(1, task.targetExecutionsCount || 1)) * 100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

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

                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Suivi des exécutions ({campaignExecutions.length})
                    </h3>

                    {isLoadingSlots ? (
                      <div className="p-6 text-center text-xs text-slate-400">Chargement des exécutions...</div>
                    ) : campaignExecutions.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                        Aucune exécution enregistrée pour l’instant.
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
                                  <span
                                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                      exec.status === 'APPROVED'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : exec.status === 'SUBMITTED'
                                        ? 'bg-purple-100 text-purple-800'
                                        : exec.status === 'RESERVED'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {exec.status === 'APPROVED'
                                      ? '✓ Validé & Payé'
                                      : exec.status === 'SUBMITTED'
                                      ? '⏳ Livrable déposé'
                                      : exec.status === 'RESERVED'
                                      ? '⏱️ Place réservée (45 min)'
                                      : exec.status}
                                  </span>
                                </div>
                                {exec.reportText && (
                                  <p className="text-slate-600 mt-1 line-clamp-1 italic">"{exec.reportText}"</p>
                                )}
                              </div>
                            </div>

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

              {/* CARD B: CONTEXTUAL ACTION ENGINE (PROPOSALS / DELIVERABLES / REVIEWS) */}
              {task.status === 'OPEN' && task.taskMode !== 'multi' ? (
                /* OPEN STATUS: PROPOSALS & APPLICATION HUB */
                <div id="proposals-hub" className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        {isOwner ? `${txt.bidsReceivedTitle} (${bids.length})` : txt.applyTitle}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isOwner ? txt.bidsReceivedSubtitle : txt.applySubtitle}
                      </p>
                    </div>

                    {!isOwner && !isAssigned && isPerformerRole && (
                      <div className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                        {txt.netPayout} : {netRewardDH} DH
                      </div>
                    )}
                  </div>

                  {/* Owner Banner OR Performer Proposal Form */}
                  {isOwner ? (
                    <div className="p-4 rounded-2xl bg-brand-50/80 border border-brand-200 flex items-start gap-3">
                      <FiShield className="text-brand-700 text-lg shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-brand-900">
                            {txt.clientManageNoticeTitle}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-800 leading-relaxed">
                          {txt.clientManageNoticeDesc}
                        </p>
                      </div>
                    </div>
                  ) : !isAssigned ? (
                    <div className="space-y-4 pt-1">
                      {/* Case: Already submitted bid */}
                      {myExistingBid ? (
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm shrink-0">
                                <FiCheck />
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-emerald-900">
                                  {txt.applicationSent}
                                </h4>
                                <p className="text-[11px] text-emerald-700">
                                  {txt.bidPendingNotice}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ⏳ En attente
                            </span>
                          </div>

                          {myExistingBid.pitch && (
                            <div className="p-3 rounded-xl bg-white/90 border border-emerald-200 text-xs text-slate-700 italic">
                              &ldquo;{myExistingBid.pitch}&rdquo;
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-emerald-800 font-semibold text-[11px]">
                              {txt.timeLimit} : {myExistingBid.proposedHours || task.timeLimitHours || 24}h
                            </span>
                            <button
                              type="button"
                              onClick={() => handleWithdrawBid(myExistingBid.id)}
                              className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                            >
                              {txt.withdrawBid}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Guard: Must be in PERFORMER role */}
                          {!isPerformerRole && isAuthenticated && (
                            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <FiUser className="text-indigo-500 text-base shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-extrabold text-indigo-900">
                                    {txt.switchRoleToPerformer}
                                  </p>
                                  <p className="text-[11px] text-indigo-700 mt-0.5">
                                    {txt.switchRoleDesc}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleRole('PERFORMER')}
                                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 text-xs shadow-xs transition cursor-pointer"
                              >
                                <FiRepeat />
                                <span>{txt.switchRoleBtn}</span>
                              </button>
                            </div>
                          )}

                          {/* Guard: Not authenticated */}
                          {!isAuthenticated && (
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                              <FiUser className="text-slate-400 text-base shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-extrabold text-slate-800">
                                  {txt.loginToApply}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {txt.loginToApplyDesc}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => openAuthModal('login', txt.loginToApply)}
                                className="shrink-0 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold px-4 py-2 transition cursor-pointer"
                              >
                                Connexion
                              </button>
                            </div>
                          )}

                          {/* Apply form */}
                          {isPerformerRole && !appliedSuccess && (
                            <div className="space-y-3">
                              {/* Earnings preview calculation */}
                              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-brand-50 border border-emerald-200/80 flex items-center justify-between text-xs">
                                <div>
                                  <span className="text-slate-600 block text-[11px]">Budget mission : <strong>{rewardDH} DH</strong></span>
                                  <span className="text-slate-500 text-[10px]">Séquestre Daman (-15%) : -{Math.round(rewardDH * 0.15)} DH</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Votre gain net</span>
                                  <span className="text-base font-black text-emerald-700">{netRewardDH} DH</span>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <label htmlFor="candidate-pitch" className="text-xs font-bold text-slate-700">
                                  {txt.yourPitch}
                                </label>
                                <textarea
                                  id="candidate-pitch"
                                  name="candidatePitch"
                                  aria-label={txt.yourPitch}
                                  rows={3}
                                  value={pitch}
                                  onChange={(e) => setPitch(e.target.value)}
                                  placeholder={txt.pitchPlaceholder}
                                  className="w-full rounded-2xl border border-slate-300 p-3.5 text-xs focus:border-brand-700 focus:outline-hidden focus:ring-1 focus:ring-brand-700 bg-white shadow-2xs"
                                />
                              </div>

                              {/* Quick pitch templates */}
                              <div className="flex flex-wrap gap-1.5">
                                {quickPitches.map((qp, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setPitch(qp)}
                                    className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-700 transition cursor-pointer text-left"
                                  >
                                    {qp}
                                  </button>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleApplyBid()}
                                disabled={!pitch.trim()}
                                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-extrabold py-3.5 text-xs shadow-md transition cursor-pointer"
                              >
                                <FiSend />
                                <span>{txt.sendApplication} ({rewardDH} DH)</span>
                              </button>
                            </div>
                          )}

                          {appliedSuccess && (
                            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                              <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-lg">
                                <FiCheck />
                              </div>
                              <h4 className="text-sm font-extrabold text-emerald-900">
                                {txt.applicationSent}
                              </h4>
                              <p className="text-xs text-emerald-700">
                                {txt.applicationSentDesc}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : null}

                  {/* List of candidates / Bids */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      {txt.bidsReceivedTitle} ({bids.length})
                    </h3>

                    {bids.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                        {txt.noBidsYetDesc}
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {bids.map((b) => (
                          <div
                            key={b.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-brand-300 transition"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={b.performerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                                alt={b.performerName}
                                className="h-11 w-11 rounded-2xl object-cover border border-slate-300 shrink-0 shadow-2xs"
                              />
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-xs text-slate-900">{b.performerName}</span>
                                  {b.isVerified ? (
                                    <span
                                      className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shadow-2xs"
                                    >
                                      <FiCheckCircle className="text-emerald-600 text-xs shrink-0" />
                                      <span>Vérifié</span>
                                    </span>
                                  ) : (
                                    <span
                                      className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-1.5 py-0.2 text-[9px] font-medium text-slate-500"
                                    >
                                      Nouveau
                                    </span>
                                  )}
                                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                                    <FiStar className="fill-amber-400 text-amber-500 text-[10px]" />
                                    {b.performerRating || 5.0} ({b.performerCompletedCount || 0} missions)
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1 line-clamp-2 italic">
                                  "{b.pitch}"
                                </p>
                              </div>
                            </div>

                            {isOwner && (
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleAssign(b.performerId, b.performerName)}
                                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold px-4 py-2 text-xs shadow-xs transition cursor-pointer"
                                >
                                  <FiCheck />
                                  <span>{txt.selectFreelancer}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeclineBid(b.id)}
                                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-300 bg-white hover:bg-rose-50 hover:border-rose-300 text-slate-600 hover:text-rose-700 font-bold px-3 py-2 text-xs transition cursor-pointer"
                                  title="Décliner cette candidature"
                                >
                                  <FiX className="text-xs" />
                                  <span className="hidden sm:inline">{txt.declineBid}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Client Cancellation in OPEN state */}
                    {isOwner && (
                      <div className="pt-3 border-t border-slate-200 flex justify-end">
                        <button
                          type="button"
                          onClick={handleCancelOpenTask}
                          className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                        >
                          <FiX />
                          <span>{txt.cancelTask} ({rewardDH} DH)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* IN_PROGRESS / UNDER_REVIEW / COMPLETED / REVISION / ARBITRATION */
                <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        {locale === 'ar' ? 'حالة التسليم وإجراءات المهمة' : 'État de livraison & Actions'}
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
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold py-3 text-xs shadow-xs transition cursor-pointer"
                      >
                        <FiUploadCloud />
                        <span>{txt.submitWorkBtn}</span>
                      </button>
                    </div>
                  )}

                  {/* Settlement Proposal Banner */}
                  {task.settlementProposal && task.settlementProposal.status === 'PENDING' && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                          <FiPercent className="text-amber-600 text-base" />
                          <span>Proposition d'accord partiel : {task.settlementProposal.percentage}% ({task.settlementProposal.amountDH} DH)</span>
                        </div>
                        <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                          En attente
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 leading-snug">
                        Motif : « {task.settlementProposal.reason} »
                      </p>
                      {isAssignedToMe ? (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleAcceptPartialSettlement}
                            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <FiCheck />
                            <span>Accepter {task.settlementProposal.percentage}% ({task.settlementProposal.amountDH} DH)</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleRejectPartialSettlement}
                            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold px-4 py-2 text-xs transition cursor-pointer"
                          >
                            Refuser
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-700 italic">
                          Votre proposition a été transmise au prestataire. S'il accepte, {task.settlementProposal.amountDH} DH lui seront versés et le restant ({Math.round(rewardDH - task.settlementProposal.amountDH)} DH) vous sera restitué.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Delivered Deliverables & Proofs Display */}
                  {(task.status === 'UNDER_REVIEW' || task.status === 'COMPLETED' || task.status === 'REVISION_REQUESTED' || submission) && (
                    <div className="rounded-2xl bg-purple-50/80 border border-purple-200 p-4 sm:p-5 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-200 text-purple-800">
                            <FiFileText className="text-sm" />
                          </span>
                          <div>
                            <h3 className="text-xs sm:text-sm font-black text-slate-900">
                              Livrables déposés par {task.assignedToName || 'le prestataire'}
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              {submission?.submittedAt
                                ? `Remis le ${new Date(submission.submittedAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}`
                                : 'Travail soumis pour inspection'}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : task.status === 'REVISION_REQUESTED'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {task.status === 'COMPLETED'
                            ? '✓ Livrables approuvés'
                            : task.status === 'REVISION_REQUESTED'
                            ? 'Retouche en cours'
                            : 'Prêt pour vérification'}
                        </span>
                      </div>

                      {/* Report text */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          Rapport d&apos;exécution / Message :
                        </span>
                        <div className="p-3.5 rounded-xl bg-white border border-purple-200 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed shadow-2xs">
                          {submission?.reportText || (
                            <span className="text-slate-500 italic">
                              Livrables finaux remis par le freelance. Fichiers et preuves disponibles ci-dessous.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Files */}
                      {submission?.proofUrls && submission.proofUrls.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <FiPaperclip className="text-purple-700" />
                            {txt.submittedFilesTitle} ({submission.proofUrls.length})
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {submission.proofUrls.map((url, idx) => {
                              const isImage = /\.(png|jpe?g|webp|gif)$/i.test(url) || url.startsWith('data:image');
                              const fileName = url.split('/').pop()?.split('?')[0] || `Fichier ${idx + 1}`;
                              return (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center justify-between p-3 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 transition shadow-2xs cursor-pointer text-xs"
                                >
                                  <div className="flex items-center gap-2.5 truncate pr-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700 group-hover:bg-purple-200 shrink-0 transition">
                                      {isImage ? <FiEye className="text-xs" /> : <FiLink className="text-xs" />}
                                    </span>
                                    <div className="truncate">
                                      <span className="font-bold text-slate-800 group-hover:text-purple-900 truncate block">
                                        {fileName.length > 28 ? `${fileName.slice(0, 25)}...` : fileName}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {isImage ? 'Aperçu image' : 'Lien / Document'}
                                      </span>
                                    </div>
                                  </div>
                                  <FiExternalLink className="text-xs text-slate-400 group-hover:text-purple-700 shrink-0" />
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Client Approval & Actions */}
                  {isOwner && (task.status === 'UNDER_REVIEW' || task.status === 'REVISION_REQUESTED') && (
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">
                          Actions du Donneur d’ordre :
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700">
                          Séquestre disponible : {rewardDH} DH
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setIsReviewModalOpen(true)}
                          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 text-xs shadow-xs transition cursor-pointer"
                        >
                          <FiCheckCircle />
                          <span>{txt.approveAndPay} ({rewardDH} DH)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsRevisionInputOpen(!isRevisionInputOpen)}
                          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold py-3 text-xs transition cursor-pointer"
                        >
                          <FiRepeat />
                          <span>{txt.requestRevision}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsPartialModalOpen(true)}
                          className="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold py-3 text-xs transition cursor-pointer"
                        >
                          <FiPercent />
                          <span>{txt.partialSettlement}</span>
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
                            className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 text-xs transition cursor-pointer"
                          >
                            Transmettre la demande de retouche
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dispute / Arbitration Trigger */}
                  {(isOwner || isAssignedToMe) &&
                    (task.status === 'UNDER_REVIEW' || task.status === 'IN_PROGRESS' || task.status === 'REVISION_REQUESTED') && (
                      <div className="pt-2 border-t border-slate-200">
                        {!isArbitrationInputOpen ? (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => setIsArbitrationInputOpen(true)}
                              className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                            >
                              <FiShield />
                              <span>{txt.disputeLink}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                                <FiShield className="text-rose-600" />
                                <span>Saisir l'arbitrage officiel Daman</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsArbitrationInputOpen(false)}
                                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                              >
                                Fermer
                              </button>
                            </div>
                            <p className="text-[11px] text-rose-700 leading-snug">
                              En cas de désaccord persistant, nos arbitres interviennent pour analyser les preuves et ordonner un règlement équitable.
                            </p>
                            <textarea
                              rows={2}
                              value={arbitrationReason}
                              onChange={(e) => setArbitrationReason(e.target.value)}
                              placeholder="Motif précis du litige..."
                              className="w-full rounded-xl border border-rose-300 p-2.5 text-xs bg-white focus:outline-hidden focus:border-rose-600"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setIsArbitrationInputOpen(false)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                              >
                                Annuler
                              </button>
                              <button
                                type="button"
                                onClick={handleSendArbitration}
                                disabled={!arbitrationReason.trim()}
                                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition cursor-pointer disabled:opacity-50"
                              >
                                Transmettre aux arbitres Daman
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Arbitration Status Banner */}
                  {task.status === 'ARBITRATION' && (
                    <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200 space-y-2.5">
                      <div className="flex items-center gap-2 text-orange-900 font-black text-sm">
                        <FiShield className="text-orange-600 text-lg" />
                        <span>Mission en cours d'arbitrage officiel Daman</span>
                      </div>
                      <p className="text-xs text-orange-800 leading-relaxed">
                        Un médiateur examine actuellement les échanges, les livrables déposés et le cahier des charges initial. Une décision équitable sera rendue sous 24h.
                      </p>
                    </div>
                  )}

                  {/* Completed Banner */}
                  {task.status === 'COMPLETED' && (
                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
                      <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-lg">
                        <FiCheckCircle />
                      </div>
                      <h4 className="text-sm font-extrabold text-emerald-900">
                        {txt.statusCompleted}
                      </h4>
                      <p className="text-xs text-emerald-700">
                        Les fonds ont été versés au freelance et le séquestre a été clôturé avec succès.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* CARD C: IN-TASK REALTIME MESSENGER */}
              {isFreelancerChosen ? (
                <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col h-[560px] overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-brand-700 text-white flex items-center justify-center">
                        <FiMessageSquare className="text-sm" />
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-slate-900 leading-tight">
                          {txt.chatTitle}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {txt.chatSubtitle}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      En direct
                    </span>
                  </div>

                  {/* Message Stream */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <FiMessageSquare className="text-3xl mb-2 text-slate-300" />
                        <p className="text-xs font-bold text-slate-600">Aucun message pour le moment</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Posez vos questions ou partagez vos précisions de travail ici.
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
                            <div
                              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs ${
                                isMe
                                  ? 'bg-brand-700 text-white rounded-tr-xs'
                                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                              }`}
                            >
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

                  {/* Input Form */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white space-y-2">
                    {filterOffPlatformContact(chatInput).hasViolation && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium animate-in fade-in">
                        <FiAlertTriangle className="text-amber-600 shrink-0" />
                        <span>{txt.safeNotice}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="workspace-chat-file"
                        name="chatFile"
                        aria-label="Joindre un fichier"
                        ref={chatFileInputRef}
                        onChange={handleChatFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => chatFileInputRef.current?.click()}
                        disabled={isUploadingChatFile}
                        className="p-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                        title="Joindre un fichier"
                      >
                        {isUploadingChatFile ? <FiLoader className="animate-spin text-sm" /> : <FiPaperclip className="text-sm" />}
                      </button>

                      <input
                        type="text"
                        id="workspace-chat-input"
                        name="chatMessage"
                        aria-label="Message"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={txt.writeMessagePlaceholder}
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:border-brand-700 focus:outline-hidden"
                      />

                      <button
                        type="submit"
                        disabled={!chatInput.trim() || isSendingMessage}
                        className="rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white p-2.5 transition cursor-pointer"
                      >
                        <FiSend className="text-sm" />
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Compact Locked Messenger Banner */
                <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                      <FiLock className="text-lg" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{txt.chatLockedTitle}</h4>
                      <p className="text-[11px] text-slate-500">{txt.chatLockedDesc}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full shrink-0">
                    {txt.chatLockedBadge}
                  </span>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN (STICKY ACTION & TRUST SIDEBAR - 4 COLS) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">

              {/* 1. FINANCIAL SUMMARY & PRIMARY CTA CARD */}
              <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {locale === 'ar' ? 'الميزانية' : locale === 'en' ? 'Budget' : 'Montant de la mission'}
                  </span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    ✓ Séquestre Daman
                  </span>
                </div>

                <div className="text-center py-1">
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 leading-none">
                    {rewardDH} <span className="text-base font-extrabold text-slate-500">DH</span>
                  </div>
                  {!isOwner && (
                    <span className="text-xs font-bold text-emerald-700 block mt-1.5">
                      {txt.netPayout} : {netRewardDH} DH
                    </span>
                  )}
                </div>

                {/* Primary Quick CTA Button */}
                {task.status === 'OPEN' && !isOwner && !myExistingBid && (
                  <button
                    type="button"
                    onClick={() => {
                      const hub = document.getElementById('proposals-hub');
                      if (hub) hub.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-extrabold py-3.5 text-xs shadow-md transition cursor-pointer"
                  >
                    <FiSend />
                    <span>{txt.applyTitle}</span>
                  </button>
                )}

                {task.status === 'IN_PROGRESS' && isAssignedToMe && (
                  <button
                    type="button"
                    onClick={() => setIsProofDrawerOpen(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-extrabold py-3.5 text-xs shadow-md transition cursor-pointer"
                  >
                    <FiUploadCloud />
                    <span>{txt.submitWorkBtn}</span>
                  </button>
                )}

                {/* Specs List */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <FiClock className="text-xs text-brand-600" />
                      <span>{txt.timeLimit} :</span>
                    </span>
                    <strong className="text-slate-800">{task.timeLimitHours}h</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <FiAward className="text-xs text-amber-500" />
                      <span>{txt.levelRequired} :</span>
                    </span>
                    <strong className="text-slate-800">{txt.level} {task.minLevelRequired || 1}+</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <FiShield className="text-xs text-emerald-600" />
                      <span>Protection :</span>
                    </span>
                    <strong className="text-emerald-700">100% Garantie</strong>
                  </div>
                </div>
              </div>

              {/* 2. EMPLOYER / CLIENT PROFILE CARD */}
              <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  {txt.clientCardTitle}
                </span>
                <div className="flex items-center gap-3">
                  <img
                    src={task.clientAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={displayClientName}
                    className="h-12 w-12 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{displayClientName}</h4>
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

              {/* 3. ASSIGNED FREELANCER (IF ASSIGNED) */}
              {task.assignedToName && (
                <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    {txt.freelancerCardTitle}
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

              {/* 4. DAMAN ESCROW GUARANTEE CARD */}
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
                  <FiShield className="text-base" />
                  <span>{txt.escrowCardTitle}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {txt.escrowCardDesc}
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
        onSubmitProof={(taskId, reportText, urls, antiSpam) => handleSubmitProof(reportText, urls, antiSpam)}
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

      {/* Partial Settlement Modal */}
      {isPartialModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
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
              Si le travail n'est que partiellement exploitable, convenez d'un compromis financier amiable.
            </p>

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

            <div className="space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Ajuster : {partialPercentage}%</span>
                <span className="text-amber-700 font-extrabold">
                  {Math.round(rewardDH * (partialPercentage / 100))} DH
                </span>
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
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-slate-500 block">Freelance perçoit :</span>
                  <strong className="text-emerald-700 font-black text-xs">
                    {Math.round(rewardDH * (partialPercentage / 100))} DH
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-200">
                  <span className="text-slate-500 block">Vous récupérez :</span>
                  <strong className="text-brand-700 font-black text-xs">
                    {Math.round(rewardDH * (1 - partialPercentage / 100))} DH
                  </strong>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Motif de la proposition :</label>
              <textarea
                rows={2}
                value={partialReason}
                onChange={(e) => setPartialReason(e.target.value)}
                placeholder="Explication claire et constructive pour le freelance..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white focus:outline-hidden focus:border-brand-700"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsPartialModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleProposePartialSettlement}
                disabled={!partialReason.trim()}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition cursor-pointer disabled:opacity-50"
              >
                Envoyer la proposition ({partialPercentage}%)
              </button>
            </div>
          </div>
        </div>
      )}

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
