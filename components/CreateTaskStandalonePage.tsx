'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { useAnalytics } from '@/lib/analytics';
import { Header } from '@/components/Header';
import { Task } from '@/types/database';
import { createDynamicTask } from '@/lib/supabaseService';
import { getTaskSlug } from '@/lib/slug';
import {
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiShield,
  FiZap,
  FiUser,
  FiUsers,
  FiMapPin,
  FiGlobe,
  FiPlus,
  FiTrash2,
  FiAlertCircle,
  FiDollarSign,
  FiLock,
  FiCheck,
  FiRefreshCw
} from 'react-icons/fi';

type DecisionStep = 1 | 2 | 3;

const DRAFT_STORAGE_KEY = 'taches_task_draft_v3';

const MOROCCAN_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Tanger',
  'Fès',
  'Agadir',
  'Meknès',
  'Oujda',
  'Kénitra',
  'Tétouan',
];

export const CreateTaskStandalonePage: React.FC = () => {
  const { t, isRTL, locale } = useLanguage();
  const { isAuthenticated, profile, openAuthModal, toggleRole, updateProfile } = useAuth();
  const { track } = useAnalytics();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Query parameters for pre-filling
  const queryTitle = searchParams.get('title') || searchParams.get('q') || '';
  const queryDescription = searchParams.get('description') || searchParams.get('desc') || '';
  const queryCategory = searchParams.get('category') || '';
  const queryBudget = searchParams.get('budget') ? parseInt(searchParams.get('budget')!, 10) : undefined;
  const queryCity = searchParams.get('city') || '';

  // Decision Tree Current Step (1: Format -> 2: Details & Labels -> 3: Budget & Escrow)
  const [currentStep, setCurrentStep] = useState<DecisionStep>(1);

  // Step 1: Execution Format
  const [taskExecutionMode, setTaskExecutionMode] = useState<'single' | 'multi'>('single');
  const [targetExecutionsCount, setTargetExecutionsCount] = useState<number>(10);
  const [unitPriceDH, setUnitPriceDH] = useState<number>(15);

  // Step 2: Task Details & Deliverables
  const [title, setTitle] = useState<string>(queryTitle);
  const [description, setDescription] = useState<string>(queryDescription);
  const [deliverables, setDeliverables] = useState<string[]>([
    'Capture d’écran ou fichier de preuve complet',
  ]);
  const [newDeliverableInput, setNewDeliverableInput] = useState('');
  const [referenceLinks, setReferenceLinks] = useState<string>('');

  // Step 3: Budget, Location & Security Options
  const isQueryInPerson = queryCity && queryCity !== 'En ligne' && queryCity !== 'online' && queryCity !== 'all';
  const [locationMode, setLocationMode] = useState<'online' | 'in_person'>(isQueryInPerson ? 'in_person' : 'online');
  const [selectedCity, setSelectedCity] = useState<string>(isQueryInPerson ? queryCity : 'Casablanca');
  const [enableAntiSpam, setEnableAntiSpam] = useState<boolean>(false);
  const [antiSpamKeyword, setAntiSpamKeyword] = useState<string>('MAROC');
  const [rewardDH, setRewardDH] = useState<number>(queryBudget || 120);
  const [timeLimitHours, setTimeLimitHours] = useState<number>(24);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);
  const [whatsappAlert, setWhatsappAlert] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [insufficientFundsInfo, setInsufficientFundsInfo] = useState<{ requiredDH: number; availableDH: number } | null>(null);

  // Restore Draft from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved && !queryTitle && !queryCategory) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.taskExecutionMode) setTaskExecutionMode(parsed.taskExecutionMode);
        if (parsed.rewardDH) setRewardDH(parsed.rewardDH);
        if (parsed.unitPriceDH) setUnitPriceDH(parsed.unitPriceDH);
        if (parsed.targetExecutionsCount) setTargetExecutionsCount(parsed.targetExecutionsCount);
        if (parsed.timeLimitHours) setTimeLimitHours(parsed.timeLimitHours);
        if (parsed.deliverables && Array.isArray(parsed.deliverables)) setDeliverables(parsed.deliverables);
        if (parsed.locationMode) setLocationMode(parsed.locationMode);
        if (parsed.selectedCity) setSelectedCity(parsed.selectedCity);
        if (parsed.enableAntiSpam !== undefined) setEnableAntiSpam(parsed.enableAntiSpam);
        if (parsed.antiSpamKeyword) setAntiSpamKeyword(parsed.antiSpamKeyword);
        if (parsed.whatsappAlert !== undefined) setWhatsappAlert(parsed.whatsappAlert);
        setHasRestoredDraft(true);
      }
    } catch (e) {
      console.warn('Could not restore draft:', e);
    }
  }, [queryTitle, queryCategory]);

  // Auto-save Draft to LocalStorage
  useEffect(() => {
    if (title || description) {
      try {
        const draft = {
          title,
          description,
          taskExecutionMode,
          rewardDH,
          unitPriceDH,
          targetExecutionsCount,
          timeLimitHours,
          deliverables,
          locationMode,
          selectedCity,
          enableAntiSpam,
          antiSpamKeyword,
          whatsappAlert,
          savedAt: Date.now(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch (e) {
        // ignore
      }
    }
  }, [
    title,
    description,
    taskExecutionMode,
    rewardDH,
    unitPriceDH,
    targetExecutionsCount,
    timeLimitHours,
    deliverables,
    locationMode,
    selectedCity,
    enableAntiSpam,
    antiSpamKeyword,
    whatsappAlert,
  ]);

  // Update total rewardDH when mode or multi params change
  useEffect(() => {
    if (taskExecutionMode === 'multi') {
      const computedTotal = targetExecutionsCount * unitPriceDH;
      setRewardDH(computedTotal);
    }
  }, [taskExecutionMode, targetExecutionsCount, unitPriceDH]);

  // Add / Remove Deliverables
  const handleAddDeliverable = () => {
    const trimmed = newDeliverableInput.trim();
    if (trimmed && !deliverables.includes(trimmed)) {
      setDeliverables([...deliverables, trimmed]);
      setNewDeliverableInput('');
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    if (deliverables.length > 1) {
      setDeliverables(deliverables.filter((_, i) => i !== index));
    }
  };

  // Price Benchmark Status Calculation
  const priceBenchmarkInfo = useMemo(() => {
    const benchmark = taskExecutionMode === 'multi' ? 150 : 120;
    const minRec = taskExecutionMode === 'multi' ? 50 : 60;

    if (rewardDH >= benchmark * 1.15) {
      return {
        badge: '⚡ Ultra-Express',
        label: 'Tarif très attractif : candidats sous moins de 3 minutes',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      };
    } else if (rewardDH >= minRec) {
      return {
        badge: '✓ Prix Recommandé',
        label: 'Tarif conforme au marché marocain (candidats sous 5-10 min)',
        color: 'text-brand-700 bg-brand-50 border-brand-200',
      };
    } else {
      return {
        badge: '⚠️ Délai plus long',
        label: 'Budget en dessous de la moyenne recommandée',
        color: 'text-amber-800 bg-amber-50 border-amber-200',
      };
    }
  }, [rewardDH, taskExecutionMode]);

  // Validation before proceeding
  const isStep1Valid = true;
  const isStep2Valid = Boolean(title.trim().length >= 5 && description.trim().length >= 10);
  const isStep3Valid = rewardDH >= (taskExecutionMode === 'multi' ? 30 : 50);

  const canProceed = useMemo(() => {
    if (currentStep === 1) return isStep1Valid;
    if (currentStep === 2) return isStep2Valid;
    if (currentStep === 3) return isStep3Valid;
    return false;
  }, [currentStep, isStep1Valid, isStep2Valid, isStep3Valid]);

  // Submit Handler: Creates task and redirects
  const handleSubmitTask = async () => {
    if (!title.trim() || description.trim().length < 5) {
      setCurrentStep(2);
      return;
    }

    if (!isAuthenticated) {
      openAuthModal('login', 'Connectez-vous pour publier votre mission sous séquestre Daman', () => {
        handleSubmitTask();
      });
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (profile?.activeRole !== 'CUSTOMER') {
        await toggleRole('CUSTOMER');
      }

      const cleanBudgetDH = rewardDH;
      const performerRewardDH = Math.round(cleanBudgetDH * 0.9);
      const platformFeeDH = Math.round(cleanBudgetDH * 0.1);

      // Platform accounting (10 MAD = 1 EUR)
      const rewardEur = Number((performerRewardDH / 10).toFixed(2));
      const platformFeeEur = Number((platformFeeDH / 10).toFixed(2));
      const totalBudgetEur = Number((cleanBudgetDH / 10).toFixed(2));

      let fullDescription = description.trim();
      if (referenceLinks.trim()) {
        fullDescription += `\n\n🔗 Liens et ressources :\n${referenceLinks.trim()}`;
      }
      const finalAntiSpam = enableAntiSpam && antiSpamKeyword.trim() ? antiSpamKeyword.trim().toUpperCase() : undefined;
      if (finalAntiSpam) {
        fullDescription += `\n\n🔒 Mot de passe anti-spam : ${finalAntiSpam}`;
      }

      const clientName = profile?.fullName || 'Client';

      const newTaskData: Omit<Task, 'id' | 'applicantsCount' | 'createdAt'> = {
        title: title.trim(),
        description: fullDescription,
        category: taskExecutionMode === 'multi' ? 'micro' : ((queryCategory || 'assistance') as any),
        subCategory: taskExecutionMode === 'multi' ? 'Micro-Tâche' : 'Mission Personnalisée',
        city: locationMode === 'in_person' ? selectedCity : 'Casablanca',
        taskMode: taskExecutionMode,
        unitPriceDH: taskExecutionMode === 'multi' ? unitPriceDH : cleanBudgetDH,
        targetExecutionsCount: taskExecutionMode === 'multi' ? targetExecutionsCount : 1,
        antiSpamKeyword: finalAntiSpam,
        status: 'OPEN',
        reward: rewardEur,
        platformFee: platformFeeEur,
        totalBudget: totalBudgetEur,
        timeLimitHours: timeLimitHours,
        minLevelRequired: 1,
        requiredProofs: deliverables,
        clientId: profile?.id || '',
        clientName: clientName,
        clientAvatar: profile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        clientRating: profile?.customerRating || 5.0,
        clientHireRate: 100,
      };

      const res = await createDynamicTask(newTaskData);
      if (!res.success) {
        throw new Error(res.error || 'Erreur lors de la création de la tâche');
      }

      const createdTask = res.task || { ...newTaskData, id: `tsk_${Date.now()}` };

      // GA4 tracking
      track.taskPosted({
        id: createdTask.id,
        title: createdTask.title,
        category: createdTask.category,
        totalBudget: createdTask.totalBudget,
        reward: createdTask.reward,
        isUrgent: false,
        city: createdTask.city,
        attachments: createdTask.requiredProofs,
      });

      // Clear draft on successful creation
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      // Update client posted count and escrow balance
      if (profile) {
        await updateProfile({
          customerTasksPosted: (profile.customerTasksPosted || 0) + 1,
          balanceEscrow: (profile.balanceEscrow || 0) + totalBudgetEur,
          balanceAvailable: Math.max(0, (profile.balanceAvailable || 0) - totalBudgetEur),
        });
      }

      const slug = getTaskSlug(createdTask as Task);
      router.push(`/${locale}/task/${slug}?created=true`);
    } catch (err: any) {
      console.error('Task creation failed:', err);
      const errMsg = err.message || 'Une erreur est survenue lors de la publication. Veuillez réessayer.';
      setFormError(errMsg);
      if (errMsg.toLowerCase().includes('solde') || errMsg.toLowerCase().includes('insuffisant')) {
        setInsufficientFundsInfo({
          requiredDH: Math.round(rewardDH),
          availableDH: Math.round(Number(profile?.balanceAvailable || 0) * 10),
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Header Title Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-brand-700">
                  Plateforme Sécurisée Maroc (MAD)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Publier une mission sous Séquestre Daman
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Décrivez votre besoin, fixez votre budget en Dirhams. Des prestataires qualifiés postulent en quelques minutes. Vos fonds sont sécurisés jusqu’à votre validation finale.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black">
                <FiLock className="text-lg" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900">Garantie Daman 100%</div>
                <div className="text-slate-500">Remboursement intégral garanti</div>
              </div>
            </div>
          </div>

          {/* Stepper Header (3 Clean Frictionless Steps) */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs mb-8">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {[
                { step: 1, title: '1. Format', sub: 'Freelance ou Micro-tâche' },
                { step: 2, title: '2. Détails', sub: 'Brief & Livrables' },
                { step: 3, title: '3. Budget', sub: 'MAD & Séquestre Daman' },
              ].map((s) => {
                const isActive = currentStep === s.step;
                const isPassed = currentStep > s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => {
                      if (isPassed || (s.step === 2 && isStep1Valid) || (s.step === 3 && isStep2Valid)) {
                        setCurrentStep(s.step as DecisionStep);
                      }
                    }}
                    className={`text-left p-3 rounded-xl transition cursor-pointer border ${
                      isActive
                        ? 'bg-brand-50 border-brand-700 ring-2 ring-brand-700/10 shadow-xs'
                        : isPassed
                        ? 'bg-emerald-50/60 border-emerald-300 text-slate-900'
                        : 'bg-slate-50/60 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs sm:text-sm font-black ${isActive ? 'text-brand-700' : isPassed ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {s.title}
                      </span>
                      {isPassed && <FiCheckCircle className="text-emerald-600 text-xs hidden sm:inline" />}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium hidden sm:block truncate mt-0.5">
                      {s.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Grid: Form Left (8 cols), Summary Right (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">

              {/* STEP 1: EXECUTION FORMAT */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      Étape 1 : Quel est le format de votre mission ?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Sélectionnez si vous cherchez 1 prestataire dédié pour un travail personnalisé, ou plusieurs personnes pour une micro-tâche en masse.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setTaskExecutionMode('single')}
                      className={`flex flex-col text-left p-5 rounded-2xl border-2 transition cursor-pointer ${
                        taskExecutionMode === 'single'
                          ? 'border-brand-700 bg-brand-50/50 shadow-sm ring-2 ring-brand-700/10'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-700 text-white flex items-center justify-center font-bold">
                          <FiUser className="text-xl" />
                        </div>
                        {taskExecutionMode === 'single' && (
                          <span className="h-6 w-6 rounded-full bg-brand-700 text-white flex items-center justify-center text-xs">
                            <FiCheck />
                          </span>
                        )}
                      </div>
                      <div className="font-extrabold text-base text-slate-900">
                        1 Freelance Dédié
                      </div>
                      <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Logo, site web, rédaction, traduction, saisie comptable, montage vidéo, service client.
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-brand-700">
                        <FiCheckCircle />
                        <span>Sélection sur devis et profil</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTaskExecutionMode('multi');
                        setRewardDH(targetExecutionsCount * unitPriceDH);
                      }}
                      className={`flex flex-col text-left p-5 rounded-2xl border-2 transition cursor-pointer ${
                        taskExecutionMode === 'multi'
                          ? 'border-brand-700 bg-brand-50/50 shadow-sm ring-2 ring-brand-700/10'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                          <FiUsers className="text-xl" />
                        </div>
                        {taskExecutionMode === 'multi' && (
                          <span className="h-6 w-6 rounded-full bg-brand-700 text-white flex items-center justify-center text-xs">
                            <FiCheck />
                          </span>
                        )}
                      </div>
                      <div className="font-extrabold text-base text-slate-900">
                        Micro-Tâche (Multi-exécuteurs)
                      </div>
                      <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Tests d’application, sondages, avis vérifiés, inscriptions, partage sur réseaux sociaux.
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-purple-700">
                        <FiZap />
                        <span>Exécution rapide en masse</span>
                      </div>
                    </button>
                  </div>

                  {taskExecutionMode === 'multi' && (
                    <div className="bg-purple-50/70 p-5 rounded-2xl border border-purple-200 space-y-4 animate-in fade-in duration-100">
                      <div className="font-bold text-xs text-purple-900 uppercase tracking-wider">
                        Paramètres de la campagne en masse
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nombre d'exécutions souhaitées :
                          </label>
                          <input
                            type="number"
                            min="2"
                            max="500"
                            value={targetExecutionsCount}
                            onChange={(e) => setTargetExecutionsCount(Math.max(2, parseInt(e.target.value) || 2))}
                            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-bold text-slate-900 focus:border-purple-600 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Rémunération unitaire par personne (DH) :
                          </label>
                          <input
                            type="number"
                            min="5"
                            value={unitPriceDH}
                            onChange={(e) => setUnitPriceDH(Math.max(5, parseInt(e.target.value) || 5))}
                            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-bold text-slate-900 focus:border-purple-600 outline-none"
                          />
                        </div>
                      </div>
                      <div className="text-xs text-purple-800 bg-purple-100/60 p-2.5 rounded-xl font-medium">
                        💰 Budget total séquestre : <strong className="font-extrabold">{targetExecutionsCount * unitPriceDH} DH</strong> ({targetExecutionsCount} personnes × {unitPriceDH} DH)
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: DETAILS, DELIVERABLES & LABELS */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      Étape 2 : Détails de la mission & Livrables
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Définissez un titre précis, les consignes d'exécution et les preuves attendues pour valider le travail.
                    </p>
                  </div>

                  {/* Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="create-task-title" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                        Titre de la mission *
                      </label>
                      <span className={`text-[11px] font-mono font-bold ${title.trim().length >= 5 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {title.trim().length}/5 car. min
                      </span>
                    </div>
                    <input
                      id="create-task-title"
                      name="taskTitle"
                      aria-label="Titre de la mission (minimum 5 caractères)"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Traduction contrat Arabe -> Français (3 pages), Création Logo startup IA, Saisie factures..."
                      className={`w-full rounded-xl border bg-white p-3.5 text-xs sm:text-sm text-slate-900 font-bold outline-none transition shadow-xs ${
                        title.trim().length > 0 && title.trim().length < 5
                          ? 'border-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10'
                          : 'border-slate-300 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10'
                      }`}
                    />
                    <div className="flex items-center justify-between text-[11px] mt-1.5">
                      {title.trim().length === 0 ? (
                        <span className="text-slate-400">Précisez l’objectif principal en quelques mots (au moins 5 caractères).</span>
                      ) : title.trim().length < 5 ? (
                        <span className="text-amber-600 font-medium">Encore {5 - title.trim().length} caractère(s) pour valider le titre.</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">✓ Titre conforme</span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="create-task-description" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                        Consignes & Instructions détaillées *
                      </label>
                      <span className={`text-[11px] font-mono font-bold ${description.trim().length >= 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {description.trim().length}/10 car. min
                      </span>
                    </div>
                    <textarea
                      id="create-task-description"
                      name="taskDescription"
                      aria-label="Consignes et instructions détaillées (minimum 10 caractères)"
                      rows={5}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Précisez les attentes, les formats de livraison, les étapes et toutes les informations nécessaires à la réalisation..."
                      className={`w-full rounded-xl border bg-white p-3.5 text-xs sm:text-sm text-slate-900 outline-none transition shadow-xs leading-relaxed ${
                        description.trim().length > 0 && description.trim().length < 10
                          ? 'border-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10'
                          : 'border-slate-300 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10'
                      }`}
                    />
                    <div className="flex items-center justify-between text-[11px] mt-1.5">
                      {description.trim().length === 0 ? (
                        <span className="text-slate-400">Détaillez le cahier des charges (au moins 10 caractères).</span>
                      ) : description.trim().length < 10 ? (
                        <span className="text-amber-600 font-medium">Encore {10 - description.trim().length} caractère(s) pour valider la description.</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">✓ Instructions conformes</span>
                      )}
                    </div>
                  </div>

                  {/* Deliverables / Proofs */}
                  <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        Preuves de réalisation exigées (Livrables pour débloquer le paiement) :
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Le freelance devra déposer ces éléments dans l'espace de travail pour demander la validation.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {deliverables.map((del, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <FiCheckCircle className="text-emerald-600 shrink-0" />
                            <span>{del}</span>
                          </div>
                          {deliverables.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDeliverable(idx)}
                              className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-1"
                            >
                              <FiTrash2 className="text-xs" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={newDeliverableInput}
                        onChange={(e) => setNewDeliverableInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddDeliverable();
                          }
                        }}
                        placeholder="Ex: Fichier source .AI / .PSD, Lien GitHub, Document relu, Capture d’écran..."
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-brand-700"
                      />
                      <button
                        type="button"
                        onClick={handleAddDeliverable}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <FiPlus />
                        <span>Ajouter</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: BUDGET, TIMELINES & ESCROW */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      Étape 3 : Budget en Dirhams & Délais
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Définissez la rémunération de la mission. Vos fonds restent protégés sous séquestre Daman jusqu'à votre approbation.
                    </p>
                  </div>

                  {/* Budget input with Moroccan presets */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        Budget total de la mission (MAD / DH) :
                      </label>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${priceBenchmarkInfo.color}`}>
                        {priceBenchmarkInfo.badge}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        min="30"
                        step="10"
                        value={rewardDH}
                        onChange={(e) => setRewardDH(Math.max(30, parseInt(e.target.value) || 30))}
                        className="w-full rounded-2xl border-2 border-brand-700 bg-white py-3.5 px-4 text-2xl font-black text-slate-900 outline-none shadow-xs"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500">
                        DH
                      </span>
                    </div>

                    {/* Quick presets */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-500 font-semibold">Montants fréquents :</span>
                      {[70, 100, 150, 250, 500, 1000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setRewardDH(amt)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                            rewardDH === amt
                              ? 'bg-brand-700 text-white border-brand-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {amt} DH
                        </button>
                      ))}
                    </div>

                    <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                      {priceBenchmarkInfo.label}
                    </div>
                  </div>

                  {/* Turnaround Time */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      Délai de réalisation maximal accordé :
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { hours: 6, label: '⚡ 6 Heures', sub: 'Urgent' },
                        { hours: 24, label: '⏱️ 24 Heures', sub: 'Standard' },
                        { hours: 48, label: '📅 48 Heures', sub: 'Confort' },
                        { hours: 120, label: '🗓️ 5 Jours', sub: 'Projet complet' },
                      ].map((d) => (
                        <button
                          key={d.hours}
                          type="button"
                          onClick={() => setTimeLimitHours(d.hours)}
                          className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                            timeLimitHours === d.hours
                              ? 'border-brand-700 bg-brand-50 text-brand-700 font-bold ring-1 ring-brand-700 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-xs font-bold">{d.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{d.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      Lieu d'exécution de la mission :
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                      <button
                        type="button"
                        onClick={() => setLocationMode('online')}
                        className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                          locationMode === 'online'
                            ? 'border-brand-700 bg-brand-50 text-brand-700 font-black shadow-xs ring-1 ring-brand-700/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <FiGlobe className="text-base" />
                        <span>100% En ligne (À distance)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocationMode('in_person')}
                        className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                          locationMode === 'in_person'
                            ? 'border-brand-700 bg-brand-50 text-brand-700 font-black shadow-xs ring-1 ring-brand-700/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <FiMapPin className="text-base" />
                        <span>Sur place / En présentiel</span>
                      </button>
                    </div>

                    {locationMode === 'in_person' && (
                      <div className="mt-3 max-w-lg">
                        <select
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-brand-700"
                        >
                          {MOROCCAN_CITIES.map((city) => (
                            <option key={city} value={city}>
                              📍 {city}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Options (Clean Checkboxes for WhatsApp, Anti-Spam & Verification) */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      Options & Sécurité de la mission :
                    </label>

                    {/* WhatsApp Checkbox */}
                    <div className={`p-4 rounded-2xl border transition ${whatsappAlert ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300/30' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'}`}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={whatsappAlert}
                          onChange={(e) => setWhatsappAlert(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded text-brand-700 focus:ring-brand-700 cursor-pointer"
                        />
                        <div className="text-xs flex-1">
                          <div className="font-extrabold text-slate-900 flex items-center gap-2">
                            <span>📲 Notification WhatsApp instantanée</span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Recommandé</span>
                          </div>
                          <div className="text-slate-500 mt-1 leading-relaxed">
                            Recevez une alerte sur votre WhatsApp dès qu'un freelance marocain qualifié postule à votre mission.
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Anti-spam Checkbox */}
                    <div className={`p-4 rounded-2xl border transition ${enableAntiSpam ? 'bg-brand-50/60 border-brand-300 ring-1 ring-brand-300/30' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'}`}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableAntiSpam}
                          onChange={(e) => setEnableAntiSpam(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded text-brand-700 focus:ring-brand-700 cursor-pointer"
                        />
                        <div className="text-xs flex-1">
                          <div className="font-extrabold text-slate-900 flex items-center gap-2">
                            <span>🛡️ Filtre anti-spam / Mot de passe obligatoire</span>
                          </div>
                          <div className="text-slate-500 mt-1 leading-relaxed">
                            Les freelances doivent mentionner un mot-clé précis dans leur message pour certifier qu'ils ont bien lu toutes vos consignes.
                          </div>
                        </div>
                      </label>

                      {enableAntiSpam && (
                        <div className="mt-3 pl-7 animate-in fade-in duration-150">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-700">Mot de passe exigé :</span>
                            <input
                              type="text"
                              value={antiSpamKeyword}
                              onChange={(e) => setAntiSpamKeyword(e.target.value.toUpperCase())}
                              placeholder="MAROC"
                              className="w-36 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 font-mono font-bold uppercase outline-none focus:border-brand-700 shadow-2xs"
                            />
                            <span className="text-[11px] text-slate-400 font-medium">(Ex: MAROC, DAMAN...)</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Verified Only Checkbox */}
                    <div className={`p-4 rounded-2xl border transition ${verifiedOnly ? 'bg-slate-100/80 border-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'}`}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={verifiedOnly}
                          onChange={(e) => setVerifiedOnly(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded text-brand-700 focus:ring-brand-700 cursor-pointer"
                        />
                        <div className="text-xs flex-1">
                          <div className="font-extrabold text-slate-900">Prestataires vérifiés uniquement (CIN & Avis)</div>
                          <div className="text-slate-500 mt-1 leading-relaxed">
                            Candidatures réservées aux freelances avec CIN vérifiée et avis vérifiés sur Tâches.ma.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Inline Form Error & Insufficient Funds Banner */}
              {formError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <FiAlertCircle className="text-base text-rose-600 shrink-0" />
                    <span>Impossible de publier la mission</span>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed">{formError}</p>
                  {insufficientFundsInfo && (
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <a
                        href={`/${locale}/wallet?deposit=${Math.max(50, insufficientFundsInfo.requiredDH - insufficientFundsInfo.availableDH)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-xs transition"
                      >
                        <FiDollarSign />
                        <span>Recharger mon portefeuille (+{Math.max(50, insufficientFundsInfo.requiredDH - insufficientFundsInfo.availableDH)} DH)</span>
                      </a>
                      <span className="text-2xs text-rose-500">Séquestre Daman garanti à 100%</span>
                    </div>
                  )}
                </div>
              )}

              {/* Step Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => (prev - 1) as DecisionStep)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold transition cursor-pointer"
                  >
                    <FiArrowLeft />
                    <span>Précédent</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <div className="flex items-center gap-3">
                    {currentStep === 2 && !isStep2Valid && (
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-medium">
                        <FiAlertCircle className="text-amber-600 text-xs shrink-0" />
                        <span>Titre (5+ car.) et Consignes (10+ car.) requis pour continuer</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => (prev + 1) as DecisionStep)}
                      disabled={!canProceed}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-98 cursor-pointer"
                    >
                      <span>Continuer vers l'étape {currentStep + 1}</span>
                      <FiArrowRight />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitTask}
                    disabled={isSubmitting || !canProceed}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm sm:text-base font-extrabold shadow-md transition active:scale-98 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <FiRefreshCw className="animate-spin text-lg" />
                        <span>Publication en cours...</span>
                      </>
                    ) : (
                      <>
                        <FiShield className="text-lg" />
                        <span>Publier la mission ({rewardDH} DH sous Séquestre)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Sticky Order Summary Column (4 cols) */}
            <div className="lg:col-span-4 sticky top-24 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="font-extrabold text-sm text-slate-900">
                    Récapitulatif de la commande
                  </span>
                  <span className="text-[10px] font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md uppercase">
                    Séquestre Daman
                  </span>
                </div>

                {/* Live Data Recap */}
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="text-slate-400 font-medium">Titre de la mission :</div>
                    <div className="font-bold text-slate-900 line-clamp-2 mt-0.5">
                      {title.trim() || 'Non renseigné pour le moment'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                    <div>
                      <div className="text-slate-400 font-medium">Format :</div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {taskExecutionMode === 'single' ? '1 Freelance Dédié' : `${targetExecutionsCount} Micro-exécutions`}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Lieu :</div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {locationMode === 'online' ? '100% En ligne' : `📍 ${selectedCity}`}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                    <div>
                      <div className="text-slate-400 font-medium">Délai :</div>
                      <div className="font-bold text-slate-800 mt-0.5">{timeLimitHours} heures</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Sécurité :</div>
                      <div className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                        <FiShield className="text-xs" />
                        <span>Séquestre 100%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Rémunération du prestataire (90%) :</span>
                    <span className="font-bold text-slate-900">{Math.round(rewardDH * 0.9)} DH</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Frais séquestre & plateforme (10%) :</span>
                    <span className="font-bold text-slate-900">{Math.round(rewardDH * 0.1)} DH</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                    <span className="font-black text-slate-900">Total à bloquer :</span>
                    <span className="font-black text-xl text-brand-700">{rewardDH} DH</span>
                  </div>
                </div>

                {/* Escrow Guarantee Box */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
                  <FiShield className="text-emerald-700 text-base shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">
                    Vos fonds sont bloqués sous séquestre sécurisé. Le freelance n’est payé que lorsque vous validez le travail rendu.
                  </div>
                </div>

                {/* Fast Moroccan Payout Badges */}
                <div className="pt-1 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                    Moyens de paiement acceptés
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-600 font-semibold flex-wrap">
                    <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200">💳 Carte CMI</span>
                    <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200">💸 Virement</span>
                    <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200">🟡 Binance Pay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
