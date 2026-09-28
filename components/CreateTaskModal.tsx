'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Task } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { TASK_CATEGORIES, MOROCCAN_CITIES, CategoryInfo, SubCategory } from '@/lib/categories';
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
  FiUser,
  FiUsers,
  FiFileText,
  FiLink,
  FiHelpCircle,
  FiPlus,
  FiTrash2,
  FiZap,
  FiStar
} from 'react-icons/fi';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (newTask: Omit<Task, 'id' | 'applicantsCount' | 'createdAt'>) => void;
  initialTitle?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  initialTitle = '',
}) => {
  const { t, isRTL } = useLanguage();
  const { profile, user: authUser } = useAuth();

  // Wizard Step: 1 = Category/Mode, 2 = Description/Deliverables, 3 = Deadline/Budget, 4 = Review
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('copywriting');
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null);
  const [taskMode, setTaskMode] = useState<'single' | 'multi'>('single');
  const [locationMode, setLocationMode] = useState<'online' | 'in_person'>('online');
  const [selectedCity, setSelectedCity] = useState<string>('Casablanca');

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>([
    'Livrable final validé et conforme aux consignes',
  ]);
  const [newDeliverableInput, setNewDeliverableInput] = useState('');
  const [referenceLinks, setReferenceLinks] = useState<string>('');
  const [verificationQuestion, setVerificationQuestion] = useState<string>('');

  const [timeLimitHours, setTimeLimitHours] = useState<number>(24);
  const [rewardDH, setRewardDH] = useState<number>(200);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Active Category & Subcategory Objects
  const activeCategory: CategoryInfo = useMemo(() => {
    return (
      TASK_CATEGORIES.find((c) => c.key === selectedCategoryKey) || TASK_CATEGORIES[0]
    );
  }, [selectedCategoryKey]);

  // Set default subcategory on category change
  useEffect(() => {
    if (activeCategory.subcategories.length > 0) {
      const defaultSub = activeCategory.subcategories[0];
      setSelectedSubcategory(defaultSub);
      if (!initialTitle && currentStep === 1) {
        setRewardDH(defaultSub.suggestedPriceDH || 150);
        setTimeLimitHours(defaultSub.timeEstimateHours || 24);
      }
    }
  }, [activeCategory, initialTitle]);

  // Sync initial title from hero search
  useEffect(() => {
    if (isOpen) {
      if (initialTitle) {
        setTitle(initialTitle);
        // If coming from search with a title, skip directly to step 2 or stay on 1
        setCurrentStep(1);
      } else {
        setTitle('');
      }
      setIsSubmitting(false);
    }
  }, [isOpen, initialTitle]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Internal accounting in EUR equivalent (1 EUR ~ 10 DH)
  const rewardEur = Number((rewardDH / 10).toFixed(2));
  const platformFeeEur = Number((rewardEur * 0.1).toFixed(2));
  const totalBudgetEur = Number((rewardEur * 1.1).toFixed(2));
  const totalBudgetDH = Math.round(rewardDH * 1.1);
  const platformFeeDH = Math.round(rewardDH * 0.1);

  // Quick template selection handler
  const handleApplyTemplate = (sub: SubCategory) => {
    setSelectedSubcategory(sub);
    if (sub.templateTitle) setTitle(sub.templateTitle);
    if (sub.templateDesc) setDescription(sub.templateDesc);
    if (sub.suggestedDeliverables && sub.suggestedDeliverables.length > 0) {
      setDeliverables(sub.suggestedDeliverables);
    }
    if (sub.suggestedPriceDH) setRewardDH(sub.suggestedPriceDH);
    if (sub.timeEstimateHours) setTimeLimitHours(sub.timeEstimateHours);
  };

  // Add custom deliverable item
  const handleAddDeliverable = () => {
    const trimmed = newDeliverableInput.trim();
    if (trimmed && !deliverables.includes(trimmed)) {
      setDeliverables([...deliverables, trimmed]);
      setNewDeliverableInput('');
    }
  };

  // Remove deliverable item
  const handleRemoveDeliverable = (index: number) => {
    if (deliverables.length > 1) {
      setDeliverables(deliverables.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !rewardDH || rewardDH <= 0) return;

    setIsSubmitting(true);

    const clientId = profile?.id || authUser?.id || `usr_${Date.now()}`;
    const clientName = profile?.fullName ? `${profile.fullName} (Vous)` : 'Vous';
    const clientAvatar =
      profile?.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';

    onCreateTask({
      title: title.trim(),
      description: description.trim(),
      category: activeCategory.key,
      subCategory: selectedSubcategory?.name || activeCategory.name,
      locationMode,
      city: locationMode === 'in_person' ? selectedCity : undefined,
      taskMode,
      referenceLinks: referenceLinks.trim() ? [referenceLinks.trim()] : [],
      verificationQuestion: verificationQuestion.trim() || undefined,
      status: 'OPEN',
      reward: rewardEur,
      platformFee: platformFeeEur,
      totalBudget: totalBudgetEur,
      timeLimitHours,
      minLevelRequired: 1,
      clientId,
      clientName,
      clientAvatar,
      clientRating: profile?.customerRating || 5.0,
      clientHireRate: 100,
      requiredProofs: deliverables.length > 0 ? deliverables : ['Livrable final validé'],
    });

    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-200 my-auto">
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

        {/* Modal Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 mb-2">
            <FiShield className="text-emerald-700" />
            <span>{t('createTaskHeaderBadge')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('createTaskTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('simpleTaskSubtitle')}
          </p>
        </div>

        {/* Step Indicator Pills */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-6 bg-slate-100 p-1.5 rounded-xl text-xs font-bold text-center">
          {[
            { step: 1, label: t('step1Tab') },
            { step: 2, label: t('step2Tab') },
            { step: 3, label: t('step3Tab') },
            { step: 4, label: t('step4Tab') },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => {
                if (item.step < currentStep) setCurrentStep(item.step);
                else if (item.step === 2 && title.trim()) setCurrentStep(2);
                else if (item.step === 3 && title.trim() && description.trim()) setCurrentStep(3);
                else if (item.step === 4 && title.trim() && description.trim() && rewardDH > 0) setCurrentStep(4);
              }}
              className={`py-1.5 px-1 sm:px-2 rounded-lg transition-all truncate text-[11px] sm:text-xs cursor-pointer ${
                currentStep === item.step
                  ? 'bg-white text-brand-800 shadow-xs font-extrabold'
                  : currentStep > item.step
                  ? 'text-emerald-700 bg-emerald-50/70 hover:bg-white'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* STEP 1: CATEGORY & WORK MODE */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                {t('chooseCategory')} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {TASK_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategoryKey === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryKey(cat.key);
                        if (cat.subcategories.length > 0) {
                          setSelectedSubcategory(cat.subcategories[0]);
                          setRewardDH(cat.subcategories[0].suggestedPriceDH);
                        }
                      }}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-700 bg-brand-50/70 shadow-xs ring-2 ring-brand-700/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className="text-xl">{cat.icon}</span>
                        {isSelected && <FiCheck className="text-brand-700 font-bold text-sm" />}
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 leading-tight">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subcategories Selector */}
            {activeCategory.subcategories.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  {t('chooseSubcategory')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {activeCategory.subcategories.map((sub) => {
                    const isSubSelected = selectedSubcategory?.id === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSubSelected
                            ? 'bg-brand-700 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 1-Click Fast Templates Banner */}
            {selectedSubcategory?.templateTitle && (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <FiZap className="text-amber-600 text-lg shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-extrabold block">
                      {t('quickTemplatesTitle')}
                    </span>
                    <span className="text-xs text-amber-900 font-medium line-clamp-1">
                      « {selectedSubcategory.templateTitle} »
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate(selectedSubcategory)}
                  className="rounded-lg bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 text-xs font-bold shrink-0 shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  {t('useTemplate')}
                </button>
              </div>
            )}

            {/* Mode & Location Dual Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              {/* Task Mode (Single vs Multi) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  {t('taskModeTitle')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTaskMode('single')}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      taskMode === 'single'
                        ? 'border-brand-700 bg-brand-50 text-brand-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FiUser className="text-sm" />
                    <span>{t('taskModeSingle')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskMode('multi')}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      taskMode === 'multi'
                        ? 'border-brand-700 bg-brand-50 text-brand-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FiUsers className="text-sm" />
                    <span>{t('taskModeMulti')}</span>
                  </button>
                </div>
              </div>

              {/* Location Mode (Online vs In-person) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  {t('locationModeTitle')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLocationMode('online')}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      locationMode === 'online'
                        ? 'border-brand-700 bg-brand-50 text-brand-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FiGlobe className="text-sm" />
                    <span>{t('locationOnline')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationMode('in_person')}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      locationMode === 'in_person'
                        ? 'border-brand-700 bg-brand-50 text-brand-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FiMapPin className="text-sm" />
                    <span>{t('locationInPerson')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* If In-Person, pick City */}
            {locationMode === 'in_person' && (
              <div className="animate-in fade-in duration-100">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  {t('selectCity')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-brand-700"
                >
                  {MOROCCAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Next Button */}
            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold px-6 py-3 text-xs shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <span>{t('btnContinueStep2')}</span>
                <FiArrowRight className={isRTL ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DETAILS, DELIVERABLES & INSTRUCTIONS */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  {t('titleLabel')} <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">{title.length}/100</span>
              </div>
              <input
                type="text"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={selectedSubcategory?.templateTitle || t('titlePlaceholder')}
                autoFocus
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20 transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {t('descLabel')} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={selectedSubcategory?.templateDesc || t('descPlaceholder')}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20 transition-all resize-y"
              />
            </div>

            {/* Mandatory Deliverables Checklist */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  {t('proofsRequiredLabel')}
                </label>
                <span className="text-[11px] text-slate-400">
                  {deliverables.length} livrable(s)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                {t('deliverablesHelp')}
              </p>

              <div className="space-y-1.5 mb-2.5">
                {deliverables.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <FiCheck className="text-emerald-600 font-bold shrink-0" />
                      <span>{item}</span>
                    </span>
                    {deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(index)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Custom Deliverable */}
              <div className="flex items-center gap-2">
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
                  placeholder={t('proofPlaceholder')}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-700"
                />
                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  disabled={!newDeliverableInput.trim()}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 px-3.5 py-2 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  <FiPlus className="text-sm" />
                </button>
              </div>
            </div>

            {/* Optional Links & Anti-Spam Question */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t('referenceLinksLabel')}
                </label>
                <input
                  type="url"
                  value={referenceLinks}
                  onChange={(e) => setReferenceLinks(e.target.value)}
                  placeholder={t('referenceLinksPlaceholder')}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t('verificationQuestionLabel')}
                </label>
                <input
                  type="text"
                  value={verificationQuestion}
                  onChange={(e) => setVerificationQuestion(e.target.value)}
                  placeholder={t('verificationQuestionPlaceholder')}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-brand-700"
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <FiArrowLeft className={isRTL ? 'rotate-180' : ''} />
                <span>{t('btnBack')}</span>
              </button>
              <button
                type="button"
                disabled={!title.trim() || !description.trim()}
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-40 disabled:pointer-events-none text-white font-bold px-6 py-2.5 text-xs shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <span>{t('btnContinueStep3')}</span>
                <FiArrowRight className={isRTL ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DEADLINE & BUDGET */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Execution Turnaround Time */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                {t('timeAllowedLabel')} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { hours: 2, label: t('timeOption2h') },
                  { hours: 6, label: t('timeOption6h') },
                  { hours: 12, label: t('timeOption12h') },
                  { hours: 24, label: t('timeOption24h') },
                  { hours: 48, label: t('timeOption48h') },
                  { hours: 72, label: t('timeOption72h') },
                ].map((opt) => {
                  const isTimeSelected = timeLimitHours === opt.hours;
                  return (
                    <button
                      key={opt.hours}
                      type="button"
                      onClick={() => setTimeLimitHours(opt.hours)}
                      className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        isTimeSelected
                          ? 'border-brand-700 bg-brand-50 text-brand-800 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget Input in DH */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  {t('rewardPerformerLabel')} <span className="text-red-500">*</span>
                </label>
                <span className="text-xs font-semibold text-slate-500">
                  (~{rewardEur} €)
                </span>
              </div>

              {/* Benchmark guidance */}
              {selectedSubcategory?.suggestedPriceDH && (
                <p className="text-[11px] text-brand-700 font-semibold mb-2">
                  {t('budgetBenchmarkText', {
                    range: `${Math.round(selectedSubcategory.suggestedPriceDH * 0.8)} - ${Math.round(
                      selectedSubcategory.suggestedPriceDH * 1.5
                    )}`,
                  })}
                </p>
              )}

              <div className="relative">
                <input
                  type="number"
                  min={50}
                  max={50000}
                  step={10}
                  required
                  value={rewardDH || ''}
                  onChange={(e) => setRewardDH(Math.max(0, Number(e.target.value)))}
                  placeholder="200"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-black text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20 transition-all"
                />
                <span
                  className={`absolute ${
                    isRTL ? 'left-4' : 'right-4'
                  } top-1/2 -translate-y-1/2 text-sm font-black text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-lg pointer-events-none`}
                >
                  DH
                </span>
              </div>

              {/* Quick Budget Chips */}
              <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                <span className="text-[11px] font-medium text-slate-500 mr-1">
                  {t('simpleTaskPriceQuick')}
                </span>
                {[50, 100, 150, 250, 400, 700, 1200].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setRewardDH(amount)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      rewardDH === amount
                        ? 'bg-brand-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {amount} DH
                  </button>
                ))}
              </div>
            </div>

            {/* Escrow Daman Breakdown Card */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>{t('breakdownPerformerNet')}</span>
                <span className="font-bold text-slate-900">{rewardDH} DH</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>{t('breakdownPlatformFee')}</span>
                <span className="font-bold text-slate-900">{platformFeeDH} DH</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-emerald-900 font-extrabold text-sm">
                <span>{t('breakdownTotalEscrow')}</span>
                <span>{totalBudgetDH} DH</span>
              </div>
            </div>

            {/* Reassurance Notice */}
            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-xs text-emerald-900">
              <FiShield className="text-emerald-700 text-base shrink-0 mt-0.5" />
              <p className="leading-relaxed">{t('escrowNoticeCreate')}</p>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <FiArrowLeft className={isRTL ? 'rotate-180' : ''} />
                <span>{t('btnBack')}</span>
              </button>
              <button
                type="button"
                disabled={!rewardDH || rewardDH <= 0}
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-40 text-white font-bold px-6 py-2.5 text-xs shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <span>{t('btnContinueStep4')}</span>
                <FiArrowRight className={isRTL ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: FINAL REVIEW & PUBLISH */}
        {currentStep === 4 && (
          <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-150">
            {/* Live Review Card */}
            <div className="rounded-2xl border border-brand-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-md bg-brand-100 text-brand-800">
                  <span>{activeCategory.icon}</span>
                  <span>{activeCategory.name}</span>
                  {selectedSubcategory && <span>• {selectedSubcategory.name}</span>}
                </span>

                <div className="text-right">
                  <span className="text-base font-black text-brand-800">{rewardDH} DH</span>
                  <span className="text-[10px] text-slate-500 block">
                    (Total séquestre: {totalBudgetDH} DH)
                  </span>
                </div>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 mb-2 leading-snug">
                {title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                {description}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200/80 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <FiClock className="text-brand-600" />
                  <span>Délai : {timeLimitHours}h</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {locationMode === 'online' ? (
                    <>
                      <FiGlobe className="text-emerald-600" />
                      <span>En ligne (À distance)</span>
                    </>
                  ) : (
                    <>
                      <FiMapPin className="text-rose-500" />
                      <span>{selectedCity}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Deliverables summary */}
              <div className="mt-3 pt-3 border-t border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                  {t('summaryDeliverables')} :
                </span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {deliverables.map((d, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <FiCheck className="text-emerald-600 text-xs shrink-0" />
                      <span className="line-clamp-1">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Final Security Reassurance Banner */}
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3.5 border border-emerald-200 text-xs text-emerald-900">
              <FiShield className="text-xl text-emerald-700 shrink-0" />
              <p className="leading-snug font-medium">
                {t('escrowNoticeCreate')}
              </p>
            </div>

            {/* Final Action Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <FiArrowLeft className={isRTL ? 'rotate-180' : ''} />
                <span>{t('btnBack')}</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim() || !rewardDH}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-40 disabled:pointer-events-none px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg active:scale-98 transition cursor-pointer"
              >
                <FiShield className="text-base" />
                <span>
                  {isSubmitting ? 'Publication en cours...' : t('btnLockEscrowAndPost')}
                </span>
                <FiArrowRight className={`text-sm ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
