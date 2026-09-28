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
  FiMessageSquare,
  FiActivity
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

  // Form State
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>(initialCategoryKey || 'copywriting');
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null);
  const [taskExecutionMode, setTaskExecutionMode] = useState<'single' | 'multi'>('single');
  const [locationMode, setLocationMode] = useState<'online' | 'in_person'>('online');
  const [selectedCity, setSelectedCity] = useState<string>('Casablanca');

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [isEnhancingAI, setIsEnhancingAI] = useState(false);
  const [antiSpamKeyword, setAntiSpamKeyword] = useState<string>('MAROC');

  const [deliverables, setDeliverables] = useState<string[]>([
    'Livrable final complet et conforme aux consignes',
  ]);
  const [newDeliverableInput, setNewDeliverableInput] = useState('');
  const [referenceLinks, setReferenceLinks] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Quality Upsells (Workzilla Add-ons)
  const [pinToTop, setPinToTop] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [whatsappAlert, setWhatsappAlert] = useState(false);

  const [timeLimitHours, setTimeLimitHours] = useState<number>(24);
  const [rewardDH, setRewardDH] = useState<number>(initialRewardDH || 150);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Quick price presets
  const pricePresets = [50, 100, 150, 200, 300, 500];
  const timePresets = [
    { label: '⚡ 2h (Ultra-Express)', hours: 2 },
    { label: '🕒 6h (Aujourd’hui)', hours: 6 },
    { label: '📅 24h (1 jour)', hours: 24 },
    { label: '🗓️ 48h (2 jours)', hours: 48 },
    { label: '📆 7 jours (Standard)', hours: 168 },
  ];

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
      if (!initialRewardDH && defaultSub.suggestedPriceDH) {
        setRewardDH(defaultSub.suggestedPriceDH);
      }
    }
  }, [activeCategory, initialRewardDH]);

  // Sync initial props
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle || '');
      setDescription(initialDescription || '');
      if (initialRewardDH) setRewardDH(initialRewardDH);
      if (initialCategoryKey) setSelectedCategoryKey(initialCategoryKey);
      setIsSubmitting(false);
    }
  }, [isOpen, initialTitle, initialDescription, initialRewardDH, initialCategoryKey]);

  // AI Task Specification Enhancer (Workzilla style AI Prompt-to-Spec)
  const handleEnhanceWithAI = () => {
    if (!title.trim() && !description.trim()) return;
    setIsEnhancingAI(true);

    setTimeout(() => {
      const currentTitle = title.trim() || 'Mission Freelance';
      const catName = activeCategory.name;
      
      const structured = `🎯 OBJECTIF PRINCIPAL :
${currentTitle} dans le domaine ${catName}.

📋 CONSIGNES ET DÉTAILS D'EXÉCUTION :
- Respecter les instructions fournies et la charte de qualité de tâches.ma.
- Délais stricts à respecter : livraison sous ${timeLimitHours}h maximum.
- Communication courtoise et professionnelle (Darija ou Français).

📦 LIVRABLES EXIGÉS POUR VALIDATION :
1. Fichiers complets haute résolution ou tableau Excel propre sans erreur.
2. Liens de vérification directe ou captures d'écran avant / après.

🔒 CONTRÔLE ANTI-SPAM :
Merci de mentionner le mot « ${antiSpamKeyword || 'MAROC'} » au tout début de votre message pour confirmer que vous avez lu ce brief en entier.`;

      setDescription(structured);
      setIsEnhancingAI(false);
    }, 450);
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          } top-4 sm:top-6 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer z-10`}
        >
          <FiX className="text-lg" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pr-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 mb-2">
            <FiShield className="text-emerald-700" />
            <span>Paiement 100% protégé sous séquestre (Daman)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Publier une tâche au Maroc
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Publication gratuite. Vous êtes mis en relation avec des freelances testés sous 4 minutes.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 1. Execution Mode Switch (Single Performer vs Multi/Mass Execution) */}
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTaskExecutionMode('single')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                taskExecutionMode === 'single'
                  ? 'bg-white text-brand-700 shadow-xs border border-brand-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FiAward />
              <span>1 Freelance dédié</span>
            </button>
            <button
              type="button"
              onClick={() => setTaskExecutionMode('multi')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                taskExecutionMode === 'multi'
                  ? 'bg-white text-brand-700 shadow-xs border border-brand-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FiUsers />
              <span>Exécutions multiples (Avis, Tests, Sondages)</span>
            </button>
          </div>

          {/* 2. Task Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Que voulez-vous faire faire ? <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Conception logo café restaurant, Traduction Arabe/Français, Saisie de 60 factures..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 font-medium outline-none transition focus:border-brand-700 focus:ring-1 focus:ring-brand-700 shadow-2xs"
            />
          </div>

          {/* 3. Category Selector Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Catégorie de la tâche :
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
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
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer ${
                      isSelected
                        ? 'border-brand-700 bg-brand-50/80 text-brand-900 ring-2 ring-brand-700/20 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base sm:text-lg mb-0.5">{cat.icon}</span>
                    <span className="text-[10px] sm:text-[11px] truncate w-full">{cat.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategory Template Quick Action */}
          {activeCategory.subcategories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-slate-400 text-[11px] font-bold shrink-0">Suggestions :</span>
              {activeCategory.subcategories.map((sub) => {
                const isSubSelected = selectedSubcategory?.id === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleApplyTemplate(sub)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      isSubSelected
                        ? 'bg-brand-700 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* 4. Description & AI Enhancer */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800">
                Instructions & Cahier des charges :
              </label>
              <button
                type="button"
                onClick={handleEnhanceWithAI}
                disabled={isEnhancingAI}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100/80 px-2 py-0.5 rounded-md border border-brand-200 transition cursor-pointer"
              >
                <FiZap className={isEnhancingAI ? 'animate-spin text-amber-500' : 'text-amber-500'} />
                <span>{isEnhancingAI ? 'Génération...' : '✨ Structurer avec l’IA'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre besoin, le contexte, et les étapes clés. (Ou cliquez sur 'Structurer avec l’IA')..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-1 focus:ring-brand-700 shadow-2xs font-mono text-[12px]"
            />
          </div>

          {/* 5. Budget & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Votre budget (Rémunération du freelance) : <span className="text-red-500">*</span>
              </label>
              <span className="text-xs font-black text-brand-700">
                {rewardDH} DH <span className="text-slate-400 font-normal">(~{rewardEur} €)</span>
              </span>
            </div>

            {/* Quick Price Buttons */}
            <div className="grid grid-cols-6 gap-1.5 mb-2">
              {pricePresets.map((pr) => (
                <button
                  key={pr}
                  type="button"
                  onClick={() => setRewardDH(pr)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    rewardDH === pr
                      ? 'bg-brand-700 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {pr} DH
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
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
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                DH Marocains
              </span>
            </div>
          </div>

          {/* 6. Deadline & Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Délai imparti :
              </label>
              <select
                value={timeLimitHours}
                onChange={(e) => setTimeLimitHours(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-semibold outline-none transition focus:border-brand-700 shadow-2xs cursor-pointer"
              >
                {timePresets.map((tp) => (
                  <option key={tp.hours} value={tp.hours}>
                    {tp.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Lieu :
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setLocationMode('online')}
                  className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
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
                  className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    locationMode === 'in_person'
                      ? 'border-brand-700 bg-brand-50 text-brand-900 ring-2 ring-brand-700/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FiMapPin className="text-xs" />
                  <span>Sur place</span>
                </button>
              </div>
            </div>
          </div>

          {/* City Selector if In-Person */}
          {locationMode === 'in_person' && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Ville au Maroc :
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-semibold outline-none transition focus:border-brand-700 shadow-2xs"
              >
                {MOROCCAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 7. Workzilla Add-ons / Visibility Options */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1">
              Options d’accélération & Qualité :
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
                <span>Réservé aux freelances certifiés avec Carte Nationale (CIN)</span>
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
                <span>Épingler en haut du flux (+15 DH • 5x plus de réponses rapides)</span>
              </span>
            </label>
          </div>

          {/* 8. Optional Advanced Deliverables Accordion */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-xs font-bold text-slate-500 hover:text-slate-800 py-1 transition cursor-pointer"
            >
              <span>+ Options avancées (Livrables requis, Mot-clé anti-spam, Liens)</span>
              {showAdvanced ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 animate-in fade-in duration-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Livrables obligatoires attendus :
                  </label>
                  <div className="space-y-1.5 mb-2">
                    {deliverables.map((d, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                        <span className="truncate">{d}</span>
                        {deliverables.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDeliverable(idx)}
                            className="text-slate-400 hover:text-red-600 ml-2"
                          >
                            <FiTrash2 className="text-xs" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDeliverableInput}
                      onChange={(e) => setNewDeliverableInput(e.target.value)}
                      placeholder="Ex: Fichier source PSD + PDF haute définition"
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddDeliverable}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mot-clé de vérification anti-copier/coller :
                  </label>
                  <input
                    type="text"
                    value={antiSpamKeyword}
                    onChange={(e) => setAntiSpamKeyword(e.target.value)}
                    placeholder="Ex: MAROC"
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs outline-none uppercase font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Les candidats doivent écrire ce mot au début de leur message pour prouver qu’ils ont lu le brief.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lien Google Drive, Dropbox ou site exemple (Optionnel) :
                  </label>
                  <input
                    type="url"
                    value={referenceLinks}
                    onChange={(e) => setReferenceLinks(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Big Prominent 1-Click Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-extrabold py-3.5 sm:py-4 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all active:scale-98 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Publier ma tâche gratuitement ({rewardDH} DH)</span>
                  <FiArrowRight className="text-lg" />
                </>
              )}
            </button>

            {/* Escrow Guarantee Trust Subline */}
            <div className="mt-2.5 text-center text-[11px] text-slate-500 font-medium">
              <span>🔒 0 DH débité maintenant. Paiement conservé sous séquestre Daman jusqu’à votre validation.</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
