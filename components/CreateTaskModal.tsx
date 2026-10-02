'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  TASK_CATEGORIES,
  MOROCCAN_CITIES,
  CategoryInfo,
  SubCategory,
  getAllTaskSuggestions,
  FlatTaskSuggestion,
} from '@/lib/categories';
import {
  FiX,
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
} from 'react-icons/fi';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (newTask: Omit<Task, 'id' | 'applicantsCount' | 'createdAt'>) => void;
  initialTitle?: string;
  initialDescription?: string;
  initialRewardDH?: number;
  initialCategoryKey?: string;
}

type DecisionStep = 1 | 2 | 3 | 4;

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  initialTitle = '',
  initialDescription = '',
  initialRewardDH,
  initialCategoryKey,
}) => {
  const { t, isRTL, locale } = useLanguage();
  const { profile, user: authUser } = useAuth();

  // Decision Tree Current Step
  const [currentStep, setCurrentStep] = useState<DecisionStep>(1);

  // Decision 1: Execution Mode & Capacity
  const [taskExecutionMode, setTaskExecutionMode] = useState<'single' | 'multi'>('single');
  const [targetExecutionsCount, setTargetExecutionsCount] = useState<number>(10);
  const [unitPriceDH, setUnitPriceDH] = useState<number>(15);

  // Decision 2: Task Category & Suggestions Dropdown
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>(initialCategoryKey || 'micro');
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Decision 3: Specification & Details
  const [locationMode, setLocationMode] = useState<'online' | 'in_person'>('online');
  const [selectedCity, setSelectedCity] = useState<string>('Casablanca');
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [antiSpamKeyword, setAntiSpamKeyword] = useState<string>('MAROC');

  const [deliverables, setDeliverables] = useState<string[]>([
    'Capture d’écran ou fichier de preuve complet',
  ]);
  const [newDeliverableInput, setNewDeliverableInput] = useState('');
  const [referenceLinks, setReferenceLinks] = useState<string>('');

  // Decision 4: Budget & Accelerators (Tâches.ma Fast-track Add-ons)
  const [rewardDH, setRewardDH] = useState<number>(initialRewardDH || 120);
  const [timeLimitHours, setTimeLimitHours] = useState<number>(24);
  const [pinToTop, setPinToTop] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);
  const [whatsappAlert, setWhatsappAlert] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // All Suggestions from Knowledge Base
  const allSuggestions = useMemo(() => getAllTaskSuggestions(), []);

  // Filter tab inside dropdown & suggestions: 'unusual' by default to inspire users!
  const [suggestionTab, setSuggestionTab] = useState<string>('unusual');

  // Specific list of unusual / clever suggestions that people don't think of
  const unusualSuggestions = useMemo(() => {
    return allSuggestions.filter((item) => item.isUnusual);
  }, [allSuggestions]);

  // Filtered Suggestions based on Search, Tab & Execution Mode
  const filteredSuggestions = useMemo(() => {
    return allSuggestions.filter((item) => {
      // If user typed in search query, search across name, category, templateTitle, templateDesc, badge, tag
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

      // Filter by suggestion tab
      if (suggestionTab === 'unusual') {
        return item.isUnusual === true;
      }
      if (suggestionTab === 'multi') {
        return item.executionMode === 'multi';
      }
      if (suggestionTab === 'mystery') {
        return item.tag === 'mystery' || item.tag === 'queue';
      }
      if (suggestionTab === 'calls') {
        return item.tag === 'calls';
      }
      if (suggestionTab === 'excel') {
        return item.tag === 'excel';
      }
      if (suggestionTab === 'telecom') {
        return item.tag === 'telecom';
      }
      if (suggestionTab !== 'all') {
        return item.categoryKey === suggestionTab;
      }

      return true;
    });
  }, [allSuggestions, searchQuery, suggestionTab]);

  // Active Category Object
  const activeCategory: CategoryInfo = useMemo(() => {
    return (
      TASK_CATEGORIES.find((c) => c.key === selectedCategoryKey) || TASK_CATEGORIES[0]
    );
  }, [selectedCategoryKey]);

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

  // Sync initial props
  useEffect(() => {
    if (isOpen) {
      if (initialTitle) setTitle(initialTitle);
      if (initialDescription) setDescription(initialDescription);
      if (initialRewardDH) setRewardDH(initialRewardDH);
      if (initialCategoryKey) setSelectedCategoryKey(initialCategoryKey);
      setIsSubmitting(false);
      setCurrentStep(1);
    }
  }, [isOpen, initialTitle, initialDescription, initialRewardDH, initialCategoryKey]);

  // Update total rewardDH when mode or multi params change
  useEffect(() => {
    if (taskExecutionMode === 'multi') {
      const computedTotal = targetExecutionsCount * unitPriceDH;
      setRewardDH(computedTotal);
    }
  }, [taskExecutionMode, targetExecutionsCount, unitPriceDH]);

  // When a suggestion is selected from dropdown
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

    // If it has a specific execution mode, adopt it
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

  // Price Benchmark Status Calculation (Tâches.ma Engine)
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
        color: 'text-blue-700 bg-blue-50 border-blue-200',
      };
    } else {
      return {
        status: 'low',
        badge: '⚠️ Tarif Économique',
        label: 'Tarif en dessous de la moyenne (peut ralentir les candidatures)',
        color: 'text-amber-800 bg-amber-50 border-amber-200',
      };
    }
  }, [rewardDH, selectedSubcategory, taskExecutionMode]);

  // Financial Escrow Breakdown
  const finalRewardDH = pinToTop ? rewardDH + 15 : rewardDH;
  const rewardEur = Number((finalRewardDH / 10).toFixed(2));
  const platformFeeEur = Number((rewardEur * 0.1).toFixed(2));
  const totalBudgetEur = Number((rewardEur * 1.1).toFixed(2));
  const totalBudgetDH = Math.round(finalRewardDH * 1.1);

  // Form Submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !rewardDH || rewardDH <= 0) return;

    setIsSubmitting(true);

    const clientId = profile?.id || authUser?.id || `usr_${Date.now()}`;
    const clientName = profile?.fullName ? `${profile.fullName} (Vous)` : 'Vous';
    const clientAvatar =
      profile?.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';

    onCreateTask({
      title: title.trim(),
      description: description.trim() || title.trim(),
      category: activeCategory.key,
      subCategory: selectedSubcategory?.name || activeCategory.name,
      locationMode,
      city: locationMode === 'in_person' ? selectedCity : undefined,
      taskMode: taskExecutionMode,
      targetExecutionsCount: taskExecutionMode === 'multi' ? targetExecutionsCount : 1,
      unitPriceDH: taskExecutionMode === 'multi' ? unitPriceDH : rewardDH,
      referenceLinks: referenceLinks.trim() ? [referenceLinks.trim()] : [],
      status: 'OPEN',
      reward: rewardEur,
      platformFee: platformFeeEur,
      totalBudget: totalBudgetEur,
      timeLimitHours,
      minLevelRequired: verifiedOnly ? 2 : 1,
      clientId,
      clientName,
      clientAvatar,
      clientRating: profile?.customerRating || 5.0,
      clientHireRate: 100,
      requiredProofs: deliverables.length > 0 ? deliverables : ['Livrable final validé'],
    });

    onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-200 max-h-[94vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className={`absolute ${
            isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
          } top-4 sm:top-6 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer z-10`}
        >
          <FiX className="text-lg" />
        </button>

        {/* Modal Top Header */}
        <div className="mb-4 pr-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 mb-1.5">
            <FiShield className="text-emerald-700" />
            <span>Paiement 100% protégé sous séquestre Daman</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Publier une tâche au Maroc
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Processus guidé intelligent avec suggestions et prix conseillés du marché marocain.
          </p>
        </div>

        {/* DECISION TREE PROGRESS STEPPER */}
        <div className="mb-5 bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <div className="grid grid-cols-4 gap-1 sm:gap-2">
            {[
              { step: 1, label: '1. Exécution', icon: '🎯' },
              { step: 2, label: '2. Suggestions & Prix', icon: '💡' },
              { step: 3, label: '3. Consignes', icon: '📝' },
              { step: 4, label: '4. Budget & Daman', icon: '🛡️' },
            ].map((node) => {
              const isActive = currentStep === node.step;
              const isPast = currentStep > node.step;
              return (
                <button
                  key={node.step}
                  type="button"
                  onClick={() => setCurrentStep(node.step as DecisionStep)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-2 rounded-xl text-center text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-brand-700 text-white shadow-xs'
                      : isPast
                      ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="text-sm">{isPast ? '✓' : node.icon}</span>
                  <span className="truncate text-[11px] sm:text-xs">{node.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: DECISION TREE BRANCH 1 - EXECUTION MODE */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-brand-700 block mb-1">
                Branche 1 de l'Arbre de Décision
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Quel est le mode d'exécution souhaité ?
              </h3>
              <p className="text-xs text-slate-500">
                Choisissez si un seul freelance dédié doit réaliser la mission ou si la tâche doit être effectuée par plusieurs participants en parallèle.
              </p>
            </div>

            {/* Decision Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option A: 1 Single Performer */}
              <div
                onClick={() => setTaskExecutionMode('single')}
                className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  taskExecutionMode === 'single'
                    ? 'border-brand-700 bg-brand-50/50 shadow-sm ring-1 ring-brand-700/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl p-2 rounded-xl bg-white shadow-2xs border border-slate-200">
                      🎯
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        taskExecutionMode === 'single'
                          ? 'bg-brand-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Sur-mesure
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mb-1">
                    1 Exécution (Freelance unique)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Un travailleur qualifié dédié prend en charge l'ensemble de votre projet de A à Z avec révisions.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 text-[11px] text-slate-500 flex flex-wrap gap-1">
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Logo</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Traduction</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Site Web</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Excel</span>
                </div>
              </div>

              {/* Option B: Multiple Performers */}
              <div
                onClick={() => setTaskExecutionMode('multi')}
                className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  taskExecutionMode === 'multi'
                    ? 'border-brand-700 bg-brand-50/50 shadow-sm ring-1 ring-brand-700/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl p-2 rounded-xl bg-white shadow-2xs border border-slate-200">
                      👥
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        taskExecutionMode === 'multi'
                          ? 'bg-brand-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Micro-tâches de masse
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mb-1">
                    Exécutions multiples (Multi-exécutants)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Plusieurs personnes effectuent la même tâche en parallèle pour collecter un maximum de résultats rapides.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 text-[11px] text-slate-500 flex flex-wrap gap-1">
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Avis Maps</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Tests App</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Sondages</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Social</span>
                </div>
              </div>
            </div>

            {/* Sub-parameters if Multiple Execution */}
            {taskExecutionMode === 'multi' && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5 animate-in fade-in duration-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">
                    Paramètres des exécutions multiples :
                  </span>
                  <span className="text-xs font-black text-brand-700">
                    {targetExecutionsCount} places × {unitPriceDH} DH = {targetExecutionsCount * unitPriceDH} DH
                  </span>
                </div>

                {/* Number of performers */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nombre d'exécutants souhaité (Spots) :
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 mb-1.5">
                    {[5, 10, 20, 50, 100].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTargetExecutionsCount(num)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          targetExecutionsCount === num
                            ? 'bg-brand-700 text-white shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={2}
                      max={500}
                      value={targetExecutionsCount}
                      onChange={(e) => setTargetExecutionsCount(Math.max(2, Number(e.target.value)))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                      placeholder="Autre nombre de participants"
                    />
                    <span className="text-xs text-slate-500 whitespace-nowrap font-medium">participants</span>
                  </div>
                </div>

                {/* Price per performer */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Rémunération par participant :
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                    {[10, 15, 25, 50].map((pr) => (
                      <button
                        key={pr}
                        type="button"
                        onClick={() => setUnitPriceDH(pr)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          unitPriceDH === pr
                            ? 'bg-brand-700 text-white shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {pr} DH
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={5}
                      max={1000}
                      value={unitPriceDH}
                      onChange={(e) => setUnitPriceDH(Math.max(5, Number(e.target.value)))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                      placeholder="Autre montant par participant"
                    />
                    <span className="text-xs text-slate-500 whitespace-nowrap font-medium">DH / personne</span>
                  </div>
                </div>

                {/* Live Multi Calculator Summary Box */}
                <div className="p-3 bg-brand-50/70 rounded-xl border border-brand-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-600 block">Budget total réservé :</span>
                    <span className="font-extrabold text-brand-900">
                      {targetExecutionsCount} exécutants certifiés × {unitPriceDH} DH
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-brand-800">
                      {targetExecutionsCount * unitPriceDH} DH
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      +10% séquestre ({Math.round(targetExecutionsCount * unitPriceDH * 0.1)} DH)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Continue to Step 2 Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-extrabold py-3 text-sm shadow-md transition cursor-pointer"
              >
                <span>Étape suivante : Choisir la tâche & Voir les prix conseillés</span>
                <FiArrowRight className="text-base" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: DECISION TREE BRANCH 2 - TASK SUGGESTIONS & TACHES.MA PRICING */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-brand-700 block mb-1">
                Branche 2 de l'Arbre de Décision
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Suggestions de tâches avec tarifs conseillés Tâches.ma
              </h3>
              <p className="text-xs text-slate-500">
                Sélectionnez une tâche type dans le catalogue ou tapez un mot-clé pour pré-remplir le cahier des charges et le prix moyen recommandé.
              </p>
            </div>

            {/* Interactive Search & Dropdown Picker */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Rechercher ou sélectionner dans la liste des suggestions :
              </label>

              <div
                onClick={() => setIsDropdownOpen(true)}
                className="w-full flex items-center justify-between rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-800 font-medium cursor-pointer hover:border-brand-600 transition shadow-2xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <FiSearch className="text-slate-400 text-sm shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder={
                      selectedSubcategory
                        ? `${selectedSubcategory.name} (${selectedSubcategory.suggestedPriceDH} DH)`
                        : 'Rechercher une tâche type (ex: avis, logo, test, excel, traduction...)'
                    }
                    className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm"
                  />
                </div>
                <FiChevronDown
                  className={`text-slate-500 transition-transform duration-200 shrink-0 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {/* Suggestions Dropdown Popover */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-80 overflow-y-auto rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 divide-y divide-slate-100 animate-in fade-in duration-100">
                  {/* Category & Topic Filter Tabs inside dropdown */}
                  <div className="pb-2 pt-1 px-1 flex items-center gap-1 overflow-x-auto scrollbar-none text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSuggestionTab('unusual')}
                      className={`px-2.5 py-1 rounded-lg font-black shrink-0 transition flex items-center gap-1 ${
                        suggestionTab === 'unusual'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <span>💡</span>
                      <span>Idées insolites ({unusualSuggestions.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuggestionTab('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
                        suggestionTab === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Toutes ({allSuggestions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuggestionTab('mystery')}
                      className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition flex items-center gap-1 ${
                        suggestionTab === 'mystery'
                          ? 'bg-brand-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>🕵️</span>
                      <span>Terrain & Mystère</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuggestionTab('calls')}
                      className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition flex items-center gap-1 ${
                        suggestionTab === 'calls'
                          ? 'bg-brand-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>📞</span>
                      <span>Appels & Négociation</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuggestionTab('excel')}
                      className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition flex items-center gap-1 ${
                        suggestionTab === 'excel'
                          ? 'bg-brand-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>📊</span>
                      <span>Saisie & Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuggestionTab('telecom')}
                      className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition flex items-center gap-1 ${
                        suggestionTab === 'telecom'
                          ? 'bg-brand-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>📶</span>
                      <span>Tests & Réseau</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuggestionTab('multi')}
                      className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition flex items-center gap-1 ${
                        suggestionTab === 'multi'
                          ? 'bg-indigo-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>👥</span>
                      <span>Multi-exécutions</span>
                    </button>
                  </div>

                  {/* List of Suggestions */}
                  <div className="py-1 space-y-1">
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((item) => {
                        const isChosen = selectedSubcategory?.id === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectSuggestion(item)}
                            className={`p-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition ${
                              isChosen
                                ? 'bg-brand-50 border border-brand-300 text-brand-950 font-bold'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                <span className="text-xs">
                                  {'categoryIcon' in item ? item.categoryIcon : '📌'}
                                </span>
                                <span className="text-xs font-bold text-slate-900">
                                  {item.name}
                                </span>
                                {item.badge && (
                                  <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 font-extrabold px-1.5 py-0.2 rounded-sm shrink-0">
                                    {item.badge}
                                  </span>
                                )}
                                {item.isUnusual && (
                                  <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-black px-1 py-0.2 rounded-sm shrink-0">
                                    💡 Idée astucieuse
                                  </span>
                                )}
                              </div>
                              {item.templateDesc && (
                                <p className="text-[11px] text-slate-500 line-clamp-1 mb-0.5 font-normal">
                                  {item.templateDesc}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span>~{item.timeEstimateHours}h</span>
                                <span>•</span>
                                <span>
                                  {item.executionMode === 'multi'
                                    ? '👥 Multi-exécutions'
                                    : '🎯 1 Freelance dédié'}
                                </span>
                              </div>
                            </div>

                            {/* Suggested Price Pill */}
                            <div className="text-right shrink-0">
                              <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-black shadow-2xs">
                                {item.suggestedPriceDH} DH
                                {item.executionMode === 'multi' ? '/pers' : ''}
                              </span>
                              <span className="block text-[9px] text-slate-400 font-medium">
                                Moyenne: ~{item.marketAverageDH || item.suggestedPriceDH} DH
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Aucune tâche ne correspond à votre recherche. Vous pouvez saisir un titre personnalisé à l'étape suivante.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* UNUSUAL SERVICES SHOWCASE: Ideas people wouldn't think about */}
            <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">💡</span>
                  <span className="text-xs font-black text-amber-950">
                    Idées de tâches surprenantes & utiles (auxquelles on ne pense pas) :
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full">
                  1-Clic prêt à poster
                </span>
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {unusualSuggestions.slice(0, 12).map((unusual) => {
                  const isSel = selectedSubcategory?.id === unusual.id;
                  return (
                    <button
                      key={unusual.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(unusual)}
                      className={`shrink-0 flex flex-col text-left p-2 rounded-xl border transition cursor-pointer max-w-[210px] ${
                        isSel
                          ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                          : 'bg-white hover:bg-amber-100/60 text-slate-800 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[10px] font-bold truncate ${isSel ? 'text-amber-100' : 'text-amber-800'}`}>
                          {unusual.badge || '💡 Insolite'}
                        </span>
                        <span className={`text-[10px] font-black px-1 rounded ${isSel ? 'bg-white/20 text-white' : 'bg-slate-900 text-white'}`}>
                          {unusual.suggestedPriceDH} DH{unusual.executionMode === 'multi' ? '/p' : ''}
                        </span>
                      </div>
                      <span className="text-xs font-bold line-clamp-2 leading-tight">
                        {unusual.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Suggestions Pills (Category context) */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                Autres tâches recommandées ({activeCategory.name}) :
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {activeCategory.subcategories.map((sub) => {
                  const isSubSelected = selectedSubcategory?.id === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(sub)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                        isSubSelected
                          ? 'bg-brand-700 text-white border-brand-800 shadow-2xs font-bold'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{sub.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                          isSubSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        {sub.suggestedPriceDH} DH
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TACHES.MA PRICE BENCHMARK CARD */}
            {selectedSubcategory && (
              <div className="p-3.5 rounded-2xl border bg-slate-50 border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FiTrendingUp className="text-brand-600 text-sm" />
                    <span className="text-xs font-black text-slate-800">
                      Indicateur de tarif Tâches.ma
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${priceBenchmarkInfo.color}`}
                  >
                    {priceBenchmarkInfo.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-snug">
                  {priceBenchmarkInfo.label}
                </p>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 text-slate-500">
                  <span>Minimum conseillé : {selectedSubcategory.minPriceDH || 50} DH</span>
                  <span>Moyenne marché : {selectedSubcategory.marketAverageDH || 150} DH</span>
                </div>
              </div>
            )}

            {/* Back / Next Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 text-xs sm:text-sm transition cursor-pointer"
              >
                <FiArrowLeft className="text-base" />
                <span>Précédent</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex-2 flex items-center justify-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-extrabold py-3 text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                <span>Passer au cahier des charges</span>
                <FiArrowRight className="text-base" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: DECISION TREE BRANCH 3 - SPECIFICATION & DETAILS */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-brand-700 block mb-1">
                Branche 3 de l'Arbre de Décision
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Cahier des charges & Consignes d'exécution
              </h3>
              <p className="text-xs text-slate-500">
                Définissez clairement ce que les exécutants doivent accomplir pour valider leur paiement.
              </p>
            </div>

            {/* Location Choice: Online vs In-person */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Lieu d'exécution :
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLocationMode('online')}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      locationMode === 'online'
                        ? 'border-brand-700 bg-brand-50 text-brand-900 ring-2 ring-brand-700/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FiGlobe className="text-xs" />
                    <span>En ligne</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationMode('in_person')}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      locationMode === 'in_person'
                        ? 'border-brand-700 bg-brand-50 text-brand-900 ring-2 ring-brand-700/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FiMapPin className="text-xs" />
                    <span>Sur place (Maroc)</span>
                  </button>
                </div>
              </div>

              {locationMode === 'in_person' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Ville concernée au Maroc :
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900 font-semibold outline-none transition focus:border-brand-700"
                  >
                    {MOROCCAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Catégorie active :
                  </label>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>{activeCategory.icon}</span>
                    <span>{activeCategory.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Task Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Titre de la tâche : <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Avis Google Maps vérifié Casablanca, Conception logo café, Traduction 2 pages..."
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs sm:text-sm text-slate-900 font-medium outline-none transition focus:border-brand-700 focus:ring-1 focus:ring-brand-700 shadow-2xs"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Consignes détaillées & Brief :
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Expliquez clairement les étapes à réaliser, les contraintes et ce que vous attendez..."
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none transition focus:border-brand-700 shadow-2xs font-mono"
              />
            </div>

            {/* Required Deliverables Checklist */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Preuves de réalisation exigées (Livrables) :
              </label>

              <div className="space-y-1.5">
                {deliverables.map((d, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  >
                    <span className="truncate text-slate-800 flex items-center gap-1.5">
                      <FiCheckCircle className="text-emerald-600 text-xs shrink-0" />
                      <span>{d}</span>
                    </span>
                    {deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="text-slate-400 hover:text-red-600 ml-2 cursor-pointer"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Custom Deliverable */}
              <div className="flex gap-1.5 pt-1">
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
                  placeholder="Ajouter un livrable (ex: Capture d'écran, lien...)"
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
                >
                  Ajouter
                </button>
              </div>
            </div>

            {/* Anti-spam Verification Keyword */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Mot-clé anti-spam (Vérification de lecture) :
                </label>
                <span className="text-[10px] text-slate-500 font-medium">Contrôle Tâches.ma</span>
              </div>
              <input
                type="text"
                value={antiSpamKeyword}
                onChange={(e) => setAntiSpamKeyword(e.target.value)}
                placeholder="Ex: MAROC"
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs outline-none uppercase font-mono font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Les candidats doivent écrire ce mot au début de leur message pour attester qu'ils ont lu le brief.
              </span>
            </div>

            {/* Back / Next Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 text-xs sm:text-sm transition cursor-pointer"
              >
                <FiArrowLeft className="text-base" />
                <span>Précédent</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                disabled={!title.trim()}
                className="flex-2 flex items-center justify-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-extrabold py-3 text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                <span>Finaliser le budget & Délais</span>
                <FiArrowRight className="text-base" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: DECISION TREE BRANCH 4 - BUDGET, UPSELLS & DAMAN VALIDATION */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-brand-700 block mb-1">
                Branche 4 de l'Arbre de Décision
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Budget, Options d'accélération & Garantie Daman
              </h3>
              <p className="text-xs text-slate-500">
                Révisez le montant de rémunération et activez les options de mise en avant express.
              </p>
            </div>

            {/* Budget Adjustment Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Rémunération totale du/des freelance(s) :
                </label>
                <span className="text-sm font-black text-brand-700">
                  {rewardDH} DH <span className="text-slate-400 font-normal">(~{rewardEur} €)</span>
                </span>
              </div>

              {taskExecutionMode === 'single' ? (
                <>
                  {/* Single presets */}
                  <div className="grid grid-cols-6 gap-1.5">
                    {[50, 100, 150, 200, 300, 500].map((pr) => (
                      <button
                        key={pr}
                        type="button"
                        onClick={() => setRewardDH(pr)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          rewardDH === pr
                            ? 'bg-brand-700 text-white shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {pr} DH
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min={20}
                      max={50000}
                      value={rewardDH}
                      onChange={(e) => setRewardDH(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 outline-none transition focus:border-brand-700"
                      placeholder="Montant personnalisé en DH"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                      DH Marocains
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Nombre de places réservées :</span>
                    <span className="font-bold">{targetExecutionsCount} personnes</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Rémunération par participant :</span>
                    <span className="font-bold">{unitPriceDH} DH</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-extrabold text-slate-900">
                    <span>Sous-total exécutants :</span>
                    <span className="text-brand-700">{rewardDH} DH</span>
                  </div>
                </div>
              )}
            </div>

            {/* Deadline Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Délai imparti pour la réalisation :
              </label>
              <select
                value={timeLimitHours}
                onChange={(e) => setTimeLimitHours(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-semibold outline-none transition focus:border-brand-700 shadow-2xs cursor-pointer"
              >
                <option value={2}>⚡ 2h (Ultra-Express)</option>
                <option value={6}>🕒 6h (Aujourd’hui)</option>
                <option value={24}>📅 24h (1 jour standard)</option>
                <option value={48}>🗓️ 48h (2 jours)</option>
                <option value={168}>📆 7 jours (Grand projet)</option>
              </select>
            </div>

            {/* Quality & Speed Add-ons (Tâches.ma Fast-track Upsells) */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1">
                Options d’accélération Tâches.ma :
              </span>

              <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <span className="font-semibold flex items-center gap-1">
                  <FiAward className="text-emerald-600" />
                  <span>Réservé aux freelances vérifiés avec Carte Nationale (CIN)</span>
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pinToTop}
                  onChange={(e) => setPinToTop(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <span className="font-semibold flex items-center gap-1">
                  <FiZap className="text-amber-500" />
                  <span>Épingler en haut du flux (+15 DH • 5x plus de candidatures)</span>
                </span>
              </label>
            </div>

            {/* Escrow Daman Summary Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-700">
                <span>Rémunération mission :</span>
                <span className="font-bold">{rewardDH} DH</span>
              </div>
              {pinToTop && (
                <div className="flex items-center justify-between text-slate-700">
                  <span>Option Épinglage en haut :</span>
                  <span className="font-bold">+15 DH</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-700">
                <span>Frais de protection séquestre Daman (10%) :</span>
                <span className="font-bold">{Math.round(finalRewardDH * 0.1)} DH</span>
              </div>
              <div className="pt-2 border-t border-emerald-200 flex items-center justify-between font-black text-emerald-950 text-sm">
                <span>Total garanti sous séquestre :</span>
                <span>{totalBudgetDH} DH</span>
              </div>
              <div className="text-[10px] text-emerald-800 pt-0.5">
                🔒 0 DH débité maintenant. Le montant est mis sous séquestre et n'est libéré qu'après votre validation finale des preuves.
              </div>
            </div>

            {/* Back & Final Submit Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 text-xs sm:text-sm transition cursor-pointer"
              >
                <FiArrowLeft className="text-base" />
                <span>Précédent</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting || !title.trim() || rewardDH <= 0}
                className="flex-2 flex items-center justify-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-extrabold py-3.5 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all active:scale-98 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span>Publier ma tâche ({totalBudgetDH} DH)</span>
                    <FiArrowRight className="text-lg" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
