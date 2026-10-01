'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Task } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { useAnalytics } from '@/lib/analytics';
import { Header } from '@/components/Header';
import { AuthModal } from '@/components/AuthModal';
import { getTaskSlug } from '@/lib/slug';
import { createDynamicTask } from '@/lib/supabaseService';
import {
  TASK_CATEGORIES,
  MOROCCAN_CITIES,
  CategoryInfo,
  SubCategory,
  getAllTaskSuggestions,
  FlatTaskSuggestion,
} from '@/lib/categories';
import {
  FiShield,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiGlobe,
  FiFileText,
  FiPlus,
  FiTrash2,
  FiZap,
  FiChevronDown,
  FiChevronUp,
  FiHelpCircle,
  FiUsers,
  FiStar,
  FiAward,
  FiSearch,
  FiSliders,
  FiCheckCircle,
  FiTrendingUp,
  FiTag,
  FiInfo,
  FiLock,
  FiAlertCircle,
  FiRefreshCw,
  FiUser
} from 'react-icons/fi';

type DecisionStep = 1 | 2 | 3 | 4;

const DRAFT_STORAGE_KEY = 'taches_task_draft_v2';

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

  // Post Creation Mode: Express (1-Step fast mode) vs Advanced (4-Step detailed mode)
  const [modeView, setModeView] = useState<'express' | 'advanced'>(queryTitle ? 'express' : 'express');

  // Decision Tree Current Step (for Advanced mode)
  const [currentStep, setCurrentStep] = useState<DecisionStep>(1);

  // Decision 1: Execution Mode & Capacity
  const [taskExecutionMode, setTaskExecutionMode] = useState<'single' | 'multi'>('single');
  const [targetExecutionsCount, setTargetExecutionsCount] = useState<number>(10);
  const [unitPriceDH, setUnitPriceDH] = useState<number>(15);

  // Decision 2: Task Category & Suggestions Dropdown
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>(queryCategory || 'development');
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Decision 3: Specification & Details
  const isQueryInPerson = queryCity && queryCity !== 'En ligne' && queryCity !== 'online' && queryCity !== 'all';
  const [locationMode, setLocationMode] = useState<'online' | 'in_person'>(isQueryInPerson ? 'in_person' : 'online');
  const [selectedCity, setSelectedCity] = useState<string>(isQueryInPerson ? queryCity : 'Casablanca');
  const [title, setTitle] = useState<string>(queryTitle);
  const [description, setDescription] = useState<string>(queryDescription);
  const [antiSpamKeyword, setAntiSpamKeyword] = useState<string>('MAROC');

  const [deliverables, setDeliverables] = useState<string[]>([
    'Capture d’écran ou fichier de preuve complet',
  ]);
  const [newDeliverableInput, setNewDeliverableInput] = useState('');
  const [referenceLinks, setReferenceLinks] = useState<string>('');

  // Decision 4: Budget & Options
  const [rewardDH, setRewardDH] = useState<number>(queryBudget || 120);
  const [timeLimitHours, setTimeLimitHours] = useState<number>(24);
  const [pinToTop, setPinToTop] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);
  const [whatsappAlert, setWhatsappAlert] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);

  // All Suggestions from Knowledge Base
  const allSuggestions = useMemo(() => getAllTaskSuggestions(), []);
  const [suggestionTab, setSuggestionTab] = useState<string>('unusual');

  // Filtered Suggestions
  const filteredSuggestions = useMemo(() => {
    return allSuggestions.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.categoryName.toLowerCase().includes(q) ||
          (item.templateTitle && item.templateTitle.toLowerCase().includes(q)) ||
          (item.templateDesc && item.templateDesc.toLowerCase().includes(q)) ||
          (item.badge && item.badge.toLowerCase().includes(q)) ||
          (item.tag && item.tag.toLowerCase().includes(q))
        );
      }

      if (suggestionTab === 'unusual') return item.isUnusual === true;
      if (suggestionTab === 'multi') return item.executionMode === 'multi';
      if (suggestionTab === 'mystery') return item.tag === 'mystery' || item.tag === 'queue';
      if (suggestionTab === 'calls') return item.tag === 'calls';
      if (suggestionTab === 'excel') return item.tag === 'excel';
      if (suggestionTab === 'telecom') return item.tag === 'telecom';
      if (suggestionTab !== 'all') return item.categoryKey === suggestionTab;

      return true;
    });
  }, [allSuggestions, searchQuery, suggestionTab]);

  // Active Category Object
  const activeCategory: CategoryInfo = useMemo(() => {
    return (
      TASK_CATEGORIES.find((c) => c.key === selectedCategoryKey) || TASK_CATEGORIES[0]
    );
  }, [selectedCategoryKey]);

  // Restore Draft from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved && !queryTitle && !queryCategory) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.taskExecutionMode) setTaskExecutionMode(parsed.taskExecutionMode);
        if (parsed.selectedCategoryKey) setSelectedCategoryKey(parsed.selectedCategoryKey);
        if (parsed.rewardDH) setRewardDH(parsed.rewardDH);
        if (parsed.unitPriceDH) setUnitPriceDH(parsed.unitPriceDH);
        if (parsed.targetExecutionsCount) setTargetExecutionsCount(parsed.targetExecutionsCount);
        if (parsed.timeLimitHours) setTimeLimitHours(parsed.timeLimitHours);
        if (parsed.deliverables && Array.isArray(parsed.deliverables)) setDeliverables(parsed.deliverables);
        if (parsed.locationMode) setLocationMode(parsed.locationMode);
        if (parsed.selectedCity) setSelectedCity(parsed.selectedCity);
        if (parsed.antiSpamKeyword) setAntiSpamKeyword(parsed.antiSpamKeyword);
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
          selectedCategoryKey,
          rewardDH,
          unitPriceDH,
          targetExecutionsCount,
          timeLimitHours,
          deliverables,
          locationMode,
          selectedCity,
          antiSpamKeyword,
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
    selectedCategoryKey,
    rewardDH,
    unitPriceDH,
    targetExecutionsCount,
    timeLimitHours,
    deliverables,
    locationMode,
    selectedCity,
    antiSpamKeyword,
  ]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update total rewardDH when mode or multi params change
  useEffect(() => {
    if (taskExecutionMode === 'multi') {
      const computedTotal = targetExecutionsCount * unitPriceDH;
      setRewardDH(computedTotal);
    }
  }, [taskExecutionMode, targetExecutionsCount, unitPriceDH]);

  // Select Suggestion Handler
  const handleSelectSuggestion = (suggestion: FlatTaskSuggestion | SubCategory) => {
    setSelectedSubcategory(suggestion);
    if ('categoryKey' in suggestion) {
      setSelectedCategoryKey(suggestion.categoryKey);
    }
    if (suggestion.templateTitle) setTitle(suggestion.templateTitle);
    if (suggestion.templateDesc) setDescription(suggestion.templateDesc);
    if (suggestion.suggestedDeliverables && suggestion.suggestedDeliverables.length > 0) {
      setDeliverables(suggestion.suggestedDeliverables);
    }
    if (suggestion.timeEstimateHours) setTimeLimitHours(suggestion.timeEstimateHours);

    if (suggestion.executionMode && suggestion.executionMode !== 'both') {
      setTaskExecutionMode(suggestion.executionMode);
      if (suggestion.executionMode === 'multi') {
        const count = suggestion.recommendedPerformerCount || 10;
        const unit = suggestion.suggestedPriceDH || 15;
        setTargetExecutionsCount(count);
        setUnitPriceDH(unit);
        setRewardDH(count * unit);
      } else {
        setRewardDH(suggestion.suggestedPriceDH || 120);
      }
    } else {
      if (taskExecutionMode === 'multi') {
        setUnitPriceDH(suggestion.suggestedPriceDH || 15);
        setRewardDH(targetExecutionsCount * (suggestion.suggestedPriceDH || 15));
      } else {
        setRewardDH(suggestion.suggestedPriceDH || 120);
      }
    }

    setIsDropdownOpen(false);
    setSearchQuery('');
  };

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

  const handleResetDraft = () => {
    if (confirm('Voulez-vous réinitialiser le formulaire ?')) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setTitle('');
      setDescription('');
      setRewardDH(120);
      setDeliverables(['Capture d’écran ou fichier de preuve complet']);
      setCurrentStep(1);
      setHasRestoredDraft(false);
    }
  };

  // Price Benchmark Status Calculation
  const priceBenchmarkInfo = useMemo(() => {
    const benchmark = selectedSubcategory?.marketAverageDH || (taskExecutionMode === 'multi' ? 150 : 150);
    const minRec = selectedSubcategory?.minPriceDH || (taskExecutionMode === 'multi' ? 50 : 70);

    if (rewardDH >= benchmark * 1.15) {
      return {
        status: 'high',
        badge: '⚡ Ultra-Express',
        label: 'Tarif très attractif : candidats sous moins de 3 minutes',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      };
    } else if (rewardDH >= minRec) {
      return {
        status: 'fair',
        badge: '✓ Prix Recommandé',
        label: 'Tarif conforme au marché marocain (candidats sous 5-10 min)',
        color: 'text-brand-700 bg-brand-50 border-brand-200',
      };
    } else {
      return {
        status: 'low',
        badge: '⚠️ Délai plus long',
        label: 'Budget en dessous de la moyenne recommandée',
        color: 'text-amber-800 bg-amber-50 border-amber-200',
      };
    }
  }, [rewardDH, selectedSubcategory, taskExecutionMode]);

  // Validation before proceeding
  const isStep1Valid = true;
  const isStep2Valid = Boolean(selectedCategoryKey);
  const isStep3Valid = Boolean(title.trim().length >= 5 && description.trim().length >= 10);
  const isStep4Valid = rewardDH >= (taskExecutionMode === 'multi' ? 30 : 50);

  const canProceed = useMemo(() => {
    if (currentStep === 1) return isStep1Valid;
    if (currentStep === 2) return isStep2Valid;
    if (currentStep === 3) return isStep3Valid;
    if (currentStep === 4) return isStep4Valid;
    return false;
  }, [currentStep, isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid]);

  // Submit Handler: Creates task and redirects
  const handleSubmitTask = async () => {
    if (!title.trim() || !description.trim()) {
      setCurrentStep(3);
      return;
    }

    if (!isAuthenticated) {
      openAuthModal('login', 'Connectez-vous pour publier votre mission sous séquestre Daman', () => {
        handleSubmitTask();
      });
      return;
    }

    setIsSubmitting(true);

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
      if (antiSpamKeyword.trim()) {
        fullDescription += `\n\n🔒 Mot de passe anti-spam : ${antiSpamKeyword.trim().toUpperCase()}`;
      }

      const clientName = profile?.fullName ? `${profile.fullName} (Vous)` : 'Client (Vous)';

      const newTaskData: Omit<Task, 'id' | 'applicantsCount' | 'createdAt'> = {
        title: title.trim(),
        description: fullDescription,
        category: (selectedCategoryKey as any) || 'development',
        subCategory: selectedSubcategory?.name || activeCategory.name,
        city: locationMode === 'in_person' ? selectedCity : 'Casablanca',
        taskMode: taskExecutionMode,
        unitPriceDH: taskExecutionMode === 'multi' ? unitPriceDH : cleanBudgetDH,
        targetExecutionsCount: taskExecutionMode === 'multi' ? targetExecutionsCount : 1,
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

      // GA4 & GTM tracking: Task Posted
      track.taskPosted({
        id: createdTask.id,
        title: createdTask.title,
        category: createdTask.category,
        totalBudget: createdTask.totalBudget,
        reward: createdTask.reward,
        isUrgent: Boolean((createdTask as any).isUrgent),
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

      // Redirect to newly created task
      router.push(`/${locale}/task/${slug}?created=true`);
    } catch (err: any) {
      console.error('Task creation failed:', err);
      alert(err.message || 'Une erreur est survenue lors de la publication. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col">
      <Header />

      <main className="flex-1 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Top Breadcrumb & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <a href={`/${locale}`} className="hover:text-brand-700 transition">Accueil</a>
              <span>/</span>
              <a href={`/${locale}/tasks`} className="hover:text-brand-700 transition">Missions</a>
              <span>/</span>
              <span className="text-slate-900 font-bold">Déposer une mission</span>
            </div>

            {hasRestoredDraft && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                  <FiInfo className="text-brand-700" />
                  Brouillon restauré
                </span>
                <button
                  type="button"
                  onClick={handleResetDraft}
                  className="text-xs text-slate-500 hover:text-red-600 font-medium transition cursor-pointer underline"
                >
                  Effacer
                </button>
              </div>
            )}
          </div>

          {/* Hero Banner with Daman Escrow Badge */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1 text-xs font-bold mb-2">
                <FiShield className="text-brand-700" />
                <span>Paiement 100% garanti sous Séquestre Daman</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Publier une mission au Maroc
              </h1>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                Décrivez votre besoin, fixez votre budget en Dirhams (MAD). Des freelances qualifiés postulent en quelques minutes. Vos fonds restent bloqués jusqu’à votre validation.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black">
                <FiLock className="text-lg" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900">Protection Client</div>
                <div className="text-slate-500">Remboursement garanti si non satisfait</div>
              </div>
            </div>
          </div>

          {/* Mode Selector Toggle: Express vs Advanced */}
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center bg-slate-200/70 p-1 rounded-2xl max-w-md w-full shadow-inner">
              <button
                type="button"
                onClick={() => setModeView('express')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition cursor-pointer ${
                  modeView === 'express'
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FiZap className="text-amber-500 text-sm" />
                <span>⚡ Mode Express (30s)</span>
              </button>
              <button
                type="button"
                onClick={() => setModeView('advanced')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition cursor-pointer ${
                  modeView === 'advanced'
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FiSliders className="text-sm" />
                <span>⚙️ Mode Avancé (4 étapes)</span>
              </button>
            </div>
          </div>

          {/* Stepper Header (Only shown in Advanced Mode) */}
          {modeView === 'advanced' && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-8 animate-in fade-in duration-150">
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {[
                  { step: 1, title: '1. Type', sub: 'Mode d’exécution' },
                  { step: 2, title: '2. Catégorie', sub: 'Domaine & Modèle' },
                  { step: 3, title: '3. Détails', sub: 'Brief & Livrables' },
                  { step: 4, title: '4. Budget', sub: 'Dirhams & Séquestre' },
                ].map((s) => {
                  const isActive = currentStep === s.step;
                  const isPassed = currentStep > s.step;
                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => {
                        if (isPassed || (s.step === 2 && isStep1Valid) || (s.step === 3 && isStep2Valid) || (s.step === 4 && isStep3Valid)) {
                          setCurrentStep(s.step as DecisionStep);
                        }
                      }}
                      className={`text-left p-2.5 sm:p-3 rounded-xl transition cursor-pointer border ${
                        isActive
                          ? 'bg-brand-50/80 border-brand-600 ring-2 ring-brand-600/20 shadow-xs'
                          : isPassed
                          ? 'bg-emerald-50/60 border-emerald-300 text-slate-900'
                          : 'bg-slate-50/60 border-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black ${isActive ? 'text-brand-700' : isPassed ? 'text-emerald-700' : 'text-slate-500'}`}>
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
          )}

          {/* Main Grid: Form Left, Sticky Summary Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Column (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">

              {/* EXPRESS 1-STEP FORM */}
              {modeView === 'express' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <span>⚡ Publication Express</span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Moins de 1 minute
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Remplissez l'essentiel, fixez votre budget et recevez vos premières propositions immédiatement.
                      </p>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Que souhaitez-vous faire réaliser ? <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Traduction de contrat Arabe vers Français (3 pages), Création de Logo, etc."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10 font-medium"
                    />
                  </div>

                  {/* Category Pills */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Domaine d'activité :
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {TASK_CATEGORIES.map((cat) => {
                        const isSelected = selectedCategoryKey === cat.key;
                        return (
                          <button
                            key={cat.key}
                            type="button"
                            onClick={() => setSelectedCategoryKey(cat.key)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition cursor-pointer ${
                              isSelected
                                ? 'bg-brand-50 border-brand-700 text-brand-900 font-bold shadow-xs'
                                : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-lg">{cat.icon}</span>
                            <div className="text-xs truncate">{cat.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Budget Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700">
                        Budget proposé : <span className="text-brand-700 font-extrabold text-sm">{rewardDH} DH</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-medium">
                        ≈ {(rewardDH * 0.095).toFixed(1)} €
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {[50, 100, 150, 250, 500, 1000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setRewardDH(amt)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                            rewardDH === amt
                              ? 'bg-brand-700 text-white border-brand-700 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {amt} DH
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min={30}
                      value={rewardDH}
                      onChange={(e) => setRewardDH(Math.max(30, parseInt(e.target.value) || 30))}
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-brand-700 font-bold"
                    />
                  </div>

                  {/* Description / Instructions */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Instructions & Détails pour le prestataire : <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Expliquez ce qui est attendu, les consignes particulières, et ce que le freelance doit livrer comme preuve..."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs text-slate-900 outline-none focus:border-brand-700 leading-relaxed"
                    />
                  </div>

                  {/* Time limit & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Délai de réalisation :
                      </label>
                      <select
                        value={timeLimitHours}
                        onChange={(e) => setTimeLimitHours(parseInt(e.target.value, 10))}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-brand-700 cursor-pointer font-medium"
                      >
                        <option value={12}>⚡ 12 Heures (Urgent)</option>
                        <option value={24}>⏱️ 24 Heures (Standard)</option>
                        <option value={48}>📅 48 Heures</option>
                        <option value={72}>🗓️ 3 Jours</option>
                        <option value={168}>📆 7 Jours (Projet complet)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Lieu d'exécution :
                      </label>
                      <select
                        value={locationMode === 'online' ? 'online' : selectedCity}
                        onChange={(e) => {
                          if (e.target.value === 'online') {
                            setLocationMode('online');
                          } else {
                            setLocationMode('in_person');
                            setSelectedCity(e.target.value);
                          }
                        }}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-brand-700 cursor-pointer font-medium"
                      >
                        <option value="online">🌐 100% En ligne (À distance)</option>
                        {MOROCCAN_CITIES.map((city) => (
                          <option key={city} value={city}>📍 {city}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Express Direct Submit Button */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleSubmitTask}
                      disabled={isSubmitting || !title.trim() || description.trim().length < 5}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm sm:text-base font-black shadow-lg shadow-brand-700/20 transition active:scale-98 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <FiRefreshCw className="animate-spin text-lg" />
                          <span>Publication en cours...</span>
                        </>
                      ) : (
                        <>
                          <FiShield className="text-lg text-emerald-300" />
                          <span>⚡ Publier la mission ({rewardDH} DH sous Séquestre)</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-center text-slate-500 mt-2">
                      Fonds protégés à 100% par le séquestre Daman • Prestataires notifiés instantanément.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 1: EXECUTION MODE (Only shown in Advanced Mode) */}
              {modeView === 'advanced' && currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Étape 1 : Quel est le format de votre mission ?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Choisissez si vous cherchez 1 prestataire dédié pour un projet complet, ou plusieurs personnes pour une micro-tâche répétitive.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setTaskExecutionMode('single')}
                      className={`flex flex-col text-left p-5 rounded-2xl border-2 transition cursor-pointer ${
                        taskExecutionMode === 'single'
                          ? 'border-brand-700 bg-brand-50/50 shadow-md ring-2 ring-brand-700/10'
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
                        Logo, site web, traduction de document, saisie complète, montage vidéo, service client.
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-brand-700">
                        <FiCheckCircle />
                        <span>Sélection sur devis & profil</span>
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
                          ? 'border-brand-700 bg-brand-50/50 shadow-md ring-2 ring-brand-700/10'
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
                        Test d'application, avis vérifié, sondage, inscription, partage réseaux sociaux.
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-purple-700">
                        <FiZap />
                        <span>Exécution instantanée en masse</span>
                      </div>
                    </button>
                  </div>

                  {taskExecutionMode === 'multi' && (
                    <div className="bg-purple-50/70 p-5 rounded-2xl border border-purple-200 space-y-4 animate-in fade-in duration-100">
                      <div className="font-bold text-xs text-purple-900 uppercase tracking-wider">
                        Paramètres de la micro-tâche en masse
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
                            Rémunération par personne (DH) :
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
                        💰 Budget total bloqué sous séquestre : <strong className="font-extrabold">{targetExecutionsCount * unitPriceDH} DH</strong> ({targetExecutionsCount} personnes × {unitPriceDH} DH)
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: CATEGORY & TEMPLATES */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Étape 2 : Sélectionnez la catégorie de votre besoin
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Choisissez un domaine pour attirer les experts spécialisés, ou utilisez un modèle prédéfini.
                    </p>
                  </div>

                  {/* Category Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {TASK_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategoryKey === cat.key;
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => {
                            setSelectedCategoryKey(cat.key);
                            if (cat.subcategories && cat.subcategories.length > 0) {
                              handleSelectSuggestion(cat.subcategories[0]);
                            }
                          }}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition cursor-pointer ${
                            isSelected
                              ? 'border-brand-700 bg-brand-50/70 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <span className="text-2xl">{cat.icon}</span>
                          <div>
                            <div className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                              {cat.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                              Dès {cat.subcategories?.[0]?.minPriceDH || cat.subcategories?.[0]?.suggestedPriceDH || 50} DH
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Fast Template / Suggestion Selector */}
                  <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <FiZap className="text-amber-500 text-lg" />
                        <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                          Modèles rapides & Suggestions Maroc
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Cliquez pour remplir automatiquement
                      </span>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                      {[
                        { id: 'unusual', label: '⭐ Recommandés' },
                        { id: 'development', label: '💻 Web & Dev' },
                        { id: 'design', label: '🎨 Design & Logo' },
                        { id: 'assistance', label: '📊 Saisie & Excel' },
                        { id: 'copywriting', label: '✍️ Traduction' },
                        { id: 'marketing', label: '📱 Réseaux Sociaux' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSuggestionTab(tab.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer text-xs ${
                            suggestionTab === tab.id
                              ? 'bg-brand-700 text-white shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Suggestions List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                      {filteredSuggestions.slice(0, 8).map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-brand-600 hover:bg-brand-50/40 text-left transition cursor-pointer group shadow-2xs"
                        >
                          <div className="truncate pr-2">
                            <div className="text-xs font-bold text-slate-900 group-hover:text-brand-700 truncate">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium truncate">
                              {item.categoryName} • {item.suggestedPriceDH || 100} DH
                            </div>
                          </div>
                          <FiArrowRight className="text-slate-400 group-hover:text-brand-700 text-xs shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: SPECIFICATIONS & DELIVERABLES */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Étape 3 : Détails de la mission & Preuves exigées
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Donnez un titre clair et spécifiez les livrables indispensables pour valider la livraison.
                    </p>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                      Titre de la tâche / mission *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Conception logo café moderne, Saisie factures sous Excel, Traduction contrat Darija..."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 font-bold outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20 shadow-2xs"
                    />
                    {title.trim().length > 0 && title.trim().length < 5 && (
                      <span className="text-[11px] text-red-500 font-medium mt-1 block">
                        Le titre doit contenir au moins 5 caractères.
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                      Consignes détaillées & Cahier des charges *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Expliquez clairement les étapes attendues, les fichiers sources fournis, les contraintes et votre objectif final..."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20 shadow-2xs font-sans leading-relaxed"
                    />
                    {description.trim().length > 0 && description.trim().length < 10 && (
                      <span className="text-[11px] text-red-500 font-medium mt-1 block">
                        La description doit contenir au moins 10 caractères.
                      </span>
                    )}
                  </div>

                  {/* Required Deliverables Checklist */}
                  <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        Preuves de réalisation exigées (Livrables pour validation) :
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Le prestataire devra fournir ces éléments pour débloquer le paiement sous séquestre.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {deliverables.map((del, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <FiCheckCircle className="text-emerald-600 shrink-0" />
                            <span>{del}</span>
                          </div>
                          {deliverables.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDeliverable(idx)}
                              className="text-slate-400 hover:text-red-500 transition cursor-pointer p-1"
                            >
                              <FiTrash2 className="text-xs" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add deliverable input */}
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
                        placeholder="Ex: Fichier Excel .xlsx rempli, Fichiers sources .AI/.PSD, Capture d'écran..."
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

                  {/* Location & Anti-spam */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Localisation de la mission :
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setLocationMode('online')}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            locationMode === 'online'
                              ? 'border-brand-700 bg-brand-50 text-brand-700'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <FiGlobe />
                          <span>100% En ligne</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocationMode('in_person')}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            locationMode === 'in_person'
                              ? 'border-brand-700 bg-brand-50 text-brand-700'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <FiMapPin />
                          <span>Sur place / Ville</span>
                        </button>
                      </div>

                      {locationMode === 'in_person' && (
                        <div className="mt-2.5">
                          <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-bold text-slate-900 outline-none"
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

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Mot de passe anti-spam (Optionnel) :
                      </label>
                      <input
                        type="text"
                        value={antiSpamKeyword}
                        onChange={(e) => setAntiSpamKeyword(e.target.value)}
                        placeholder="Ex: MAROC, DAMAN..."
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono uppercase outline-none focus:border-brand-700"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Les candidats devront inclure ce mot dans leur offre pour prouver leur lecture intégrale.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: BUDGET & ESCROW CONFIRMATION */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Étape 4 : Budget en Dirhams & Délais d’exécution
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Définissez la rémunération totale de la mission. Vos fonds sont sécurisés sous séquestre Daman.
                    </p>
                  </div>

                  {/* Budget Selector */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        Budget total proposé (MAD / DH) :
                      </label>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${priceBenchmarkInfo.color}`}>
                        {priceBenchmarkInfo.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="30"
                          step="10"
                          value={rewardDH}
                          onChange={(e) => setRewardDH(Math.max(30, parseInt(e.target.value) || 30))}
                          className="w-full rounded-2xl border-2 border-brand-700 bg-white py-3.5 px-4 text-2xl font-black text-slate-900 outline-none shadow-sm"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500">
                          DH
                        </span>
                      </div>
                    </div>

                    {/* Quick Budget Presets */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-500 font-semibold">Montants fréquents :</span>
                      {[70, 100, 150, 250, 500, 1000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setRewardDH(amt)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                            rewardDH === amt
                              ? 'bg-brand-700 text-white border-brand-700'
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
                              ? 'border-brand-700 bg-brand-50/70 text-brand-700 font-bold ring-1 ring-brand-700'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-xs font-bold">{d.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{d.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
                      <input
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                        className="h-4 w-4 rounded text-brand-700 focus:ring-brand-700"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-slate-900">Prestataires certifiés uniquement</div>
                        <div className="text-slate-500">Candidatures réservées aux freelances avec pièces d’identité et avis positifs</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
                      <input
                        type="checkbox"
                        checked={whatsappAlert}
                        onChange={(e) => setWhatsappAlert(e.target.checked)}
                        className="h-4 w-4 rounded text-brand-700 focus:ring-brand-700"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-slate-900">Notification WhatsApp instantanée</div>
                        <div className="text-slate-500">Recevez une alerte sur votre téléphone dès qu'un candidat postule</div>
                      </div>
                    </label>
                  </div>
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

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => (prev + 1) as DecisionStep)}
                    disabled={!canProceed}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-98 cursor-pointer"
                  >
                    <span>Continuer vers l'étape {currentStep + 1}</span>
                    <FiArrowRight />
                  </button>
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
                        <span>Création en cours...</span>
                      </>
                    ) : (
                      <>
                        <FiShield className="text-lg" />
                        <span>Publier la mission ({rewardDH} DH)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Sticky Order Summary Column (4 cols) */}
            <div className="lg:col-span-4 sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
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
                      <div className="text-slate-400 font-medium">Catégorie :</div>
                      <div className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <span>{activeCategory.icon}</span>
                        <span className="truncate">{activeCategory.name}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Format :</div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {taskExecutionMode === 'single' ? '1 Freelance' : `${targetExecutionsCount} Micro-exécutions`}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                    <div>
                      <div className="text-slate-400 font-medium">Délai :</div>
                      <div className="font-bold text-slate-800 mt-0.5">{timeLimitHours} heures</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Lieu :</div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {locationMode === 'online' ? '100% En ligne' : `📍 ${selectedCity}`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
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
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
                  <FiShield className="text-emerald-700 text-base shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">
                    Vos fonds sont bloqués sous séquestre sécurisé. Le freelance n’est payé que lorsque vous validez le travail rendu.
                  </div>
                </div>

                {/* Fast Moroccan Payout Badges */}
                <div className="pt-2 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                    Moyens de paiement acceptés
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-600 font-semibold flex-wrap">
                    <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200">💳 CMI / Carte</span>
                    <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200">🏦 Virement RIB</span>
                    <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200">💵 Cash Plus</span>
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
