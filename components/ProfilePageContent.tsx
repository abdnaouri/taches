'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserProfile, UserPortfolioItem, UserLanguage, UserRole } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { uploadDynamicProofFile } from '@/lib/supabaseService';
import {
  FiUser,
  FiAward,
  FiBriefcase,
  FiCheckCircle,
  FiStar,
  FiClock,
  FiShield,
  FiDollarSign,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiExternalLink,
  FiSave,
  FiCheck,
  FiShare2,
  FiEye,
  FiSliders,
  FiZap,
  FiLock,
  FiMessageSquare,
  FiArrowRight,
  FiTrendingUp,
  FiAlertCircle,
  FiRefreshCw,
  FiCopy,
  FiUploadCloud,
  FiFileText,
  FiCamera,
  FiX
} from 'react-icons/fi';

const MOROCCAN_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Tanger',
  'Agadir',
  'Fès',
  'Meknès',
  'Oujda',
  'Kénitra',
  'Tétouan',
  'Salé',
  'Mohammédia',
  'El Jadida',
  'Nador',
  'Autre / 100% En ligne',
];

const AVAILABLE_SKILLS_SUGGESTIONS = [
  'Shopify',
  'WooCommerce',
  'Next.js & React',
  'Tailwind CSS',
  'WordPress',
  'Stripe',
  'HTML / CSS / JS',
  'Canva Pro',
  'Photoshop',
  'Figma UI/UX',
  'Illustrator',
  'Saisie de données Excel',
  'Nettoyage de fichiers CSV',
  'Traduction Arabe-Français',
  'Traduction Français-Anglais',
  'Rédaction SEO',
  'Voix off Darija / Français',
  'Gestion Instagram & TikTok',
  'Google Ads & Facebook Ads',
  'Démarches administratives',
  'Support client WhatsApp',
  'Recherche de prospects B2B',
];

const DEFAULT_CATEGORIES = [
  { id: 'development', label: 'Web & E-commerce', icon: '💻', desc: 'Sites Shopify, WooCommerce, Next.js, WordPress' },
  { id: 'design', label: 'Design & Graphisme', icon: '🎨', desc: 'Logos, bannières, menus, retouches photo' },
  { id: 'assistance', label: 'Saisie & Secrétariat', icon: '📊', desc: 'Excel, fiches produits, qualification contacts' },
  { id: 'copywriting', label: 'Traduction & Rédaction', icon: '✍️', desc: 'Arabe, Darija, Français, Anglais' },
  { id: 'marketing', label: 'Marketing & Réseaux', icon: '🚀', desc: 'TikTok, Instagram, Ads, création contenu' },
  { id: 'micro', label: 'Micro-tâches & Démarches', icon: '⚡', desc: 'Tests d’apps, vérifications, formulaires' },
];

export const ProfilePageContent: React.FC = () => {
  const { t, locale, isRTL } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, profile, updateProfile, toggleRole, openAuthModal } = useAuth();

  const defaultUserProfile: UserProfile = {
    id: 'guest',
    email: 'contact@taches.ma',
    fullName: 'Utilisateur Tâches.ma',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
    activeRole: 'PERFORMER',
    balanceAvailable: 0,
    balanceEscrow: 0,
    isAdmin: false,
    performerTier: 'level_1',
    performerXp: 0,
    performerRating: 5.0,
    performerReviewsCount: 0,
    performerCompletedTasks: 0,
    passedQualification: false,
    customerRating: 5.0,
    customerTotalSpent: 0,
    customerTasksPosted: 0,
    headline: 'Prestataire indépendant certifié',
    bio: '',
    city: 'Casablanca',
    phone: '',
    whatsappEnabled: true,
    cin: '',
    cinVerified: false,
    languages: [],
    skills: [],
    specializedCategories: ['development', 'design', 'assistance', 'copywriting'],
    minTaskReward: 30,
    isAvailableForHire: true,
    bankName: 'CIH Bank',
    bankRib: '',
    bankAccountHolder: '',
    portfolio: [],
    certifications: [],
    notifyWhatsapp: true,
    notifyEmail: true,
    createdAt: new Date().toISOString(),
  };

  const user: UserProfile = profile || defaultUserProfile;
  const isCustomer = user.activeRole === 'CUSTOMER';

  // Dynamic reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(false);

  useEffect(() => {
    if (user.id && user.id !== 'guest') {
      setIsLoadingReviews(true);
      fetch(`/api/reviews?userId=${encodeURIComponent(user.id)}`, { cache: 'no-store' })
        .then(r => r.json())
        .then(d => {
          if (d.success && Array.isArray(d.reviews)) {
            setReviews(d.reviews);
          }
        })
        .catch(err => console.error('Error fetching reviews:', err))
        .finally(() => setIsLoadingReviews(false));
    }
  }, [user.id]);

  // Active Tab from URL query or default to 'overview'
  const activeTabQuery = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState<string>(activeTabQuery);

  useEffect(() => {
    if (activeTabQuery) {
      setActiveTab(activeTabQuery);
    }
  }, [activeTabQuery]);

  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`/${locale}/profile?${params.toString()}`, { scroll: false });
  };

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Editable Form States
  const [fullName, setFullName] = useState<string>(user.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user.avatarUrl || '');
  const [headline, setHeadline] = useState<string>(user.headline || 'Prestataire indépendant certifié');
  const [bio, setBio] = useState<string>(user.bio || '');
  const [city, setCity] = useState<string>(user.city || 'Casablanca');
  const [phone, setPhone] = useState<string>(user.phone || '');
  const [whatsappEnabled, setWhatsappEnabled] = useState<boolean>(user.whatsappEnabled ?? true);
  const [cin, setCin] = useState<string>(user.cin || '');
  const [isAvailableForHire, setIsAvailableForHire] = useState<boolean>(user.isAvailableForHire ?? true);
  const [minTaskReward, setMinTaskReward] = useState<number>(user.minTaskReward || 30);
  const [specializedCategories, setSpecializedCategories] = useState<string[]>(
    user.specializedCategories || ['development', 'design', 'assistance', 'copywriting']
  );
  const [skills, setSkills] = useState<string[]>(
    user.skills || []
  );
  const [newSkillInput, setNewSkillInput] = useState<string>('');

  // Languages State
  const [languages, setLanguages] = useState<UserLanguage[]>(
    user.languages || []
  );
  const [newLangName, setNewLangName] = useState<string>('');
  const [newLangLevel, setNewLangLevel] = useState<'native' | 'fluent' | 'intermediate'>('fluent');

  // Banking State
  const [bankName, setBankName] = useState<string>(user.bankName || 'CIH Bank');
  const [bankRib, setBankRib] = useState<string>(user.bankRib || '');
  const [bankAccountHolder, setBankAccountHolder] = useState<string>(user.bankAccountHolder || user.fullName || '');

  // Notifications State
  const [notifyWhatsapp, setNotifyWhatsapp] = useState<boolean>(user.notifyWhatsapp ?? true);
  const [notifyEmail, setNotifyEmail] = useState<boolean>(user.notifyEmail ?? true);

  // Portfolio State
  const [portfolio, setPortfolio] = useState<UserPortfolioItem[]>(user.portfolio || []);
  const [isAddPortfolioModalOpen, setIsAddPortfolioModalOpen] = useState<boolean>(false);
  const [newPortTitle, setNewPortTitle] = useState<string>('');
  const [newPortDesc, setNewPortDesc] = useState<string>('');
  const [newPortCat, setNewPortCat] = useState<string>('development');
  const [newPortImg, setNewPortImg] = useState<string>('');
  const [newPortLink, setNewPortLink] = useState<string>('');

  // Public Preview Modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  // Fast Payout Request Modal
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [withdrawAmountDH, setWithdrawAmountDH] = useState<number>(Math.round(user.balanceAvailable * 10));

  // KYC & CIN Documents State
  const [cinDocumentFrontUrl, setCinDocumentFrontUrl] = useState<string>(user.cinDocumentFrontUrl || '');
  const [cinDocumentBackUrl, setCinDocumentBackUrl] = useState<string>(user.cinDocumentBackUrl || '');
  const [kycStatus, setKycStatus] = useState<'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'>(
    user.kycStatus || (user.cinVerified ? 'VERIFIED' : 'UNVERIFIED')
  );
  const [kycRejectionReason, setKycRejectionReason] = useState<string>(user.kycRejectionReason || '');
  const [isUploadingFront, setIsUploadingFront] = useState<boolean>(false);
  const [isUploadingBack, setIsUploadingBack] = useState<boolean>(false);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState<boolean>(false);
  const [kycFeedbackMsg, setKycFeedbackMsg] = useState<string | null>(null);

  // Sync when user prop updates
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setAvatarUrl(user.avatarUrl || '');
      setHeadline(user.headline || 'Prestataire indépendant certifié');
      setBio(user.bio || '');
      setCity(user.city || 'Casablanca');
      setPhone(user.phone || '');
      setWhatsappEnabled(user.whatsappEnabled ?? true);
      setCin(user.cin || '');
      setCinDocumentFrontUrl(user.cinDocumentFrontUrl || '');
      setCinDocumentBackUrl(user.cinDocumentBackUrl || '');
      setKycStatus(user.kycStatus || (user.cinVerified ? 'VERIFIED' : 'UNVERIFIED'));
      setKycRejectionReason(user.kycRejectionReason || '');
      setIsAvailableForHire(user.isAvailableForHire ?? true);
      setMinTaskReward(user.minTaskReward || 30);
      setSpecializedCategories(user.specializedCategories || ['development', 'design', 'assistance', 'copywriting']);
      setSkills(user.skills || []);
      setLanguages(user.languages || []);
      setBankName(user.bankName || 'CIH Bank');
      setBankRib(user.bankRib || '');
      setBankAccountHolder(user.bankAccountHolder || user.fullName || '');
      setNotifyWhatsapp(user.notifyWhatsapp ?? true);
      setNotifyEmail(user.notifyEmail ?? true);
      setPortfolio(user.portfolio || []);
      setWithdrawAmountDH(Math.round(user.balanceAvailable * 10));
    }
  }, [user]);

  // Avatar Upload State & Handler
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const res = await uploadDynamicProofFile(file);
      if (res.success && res.url) {
        setAvatarUrl(res.url);
        await updateProfile({ avatarUrl: res.url });
        showToast('✅ Photo de profil mise à jour avec succès !');
      } else {
        showToast('❌ Erreur lors du téléversement de la photo');
      }
    } catch (err: any) {
      showToast(err.message || '❌ Erreur lors du téléversement');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Upload KYC Document (Front / Back)
  const handleUploadKycDoc = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (side === 'front') setIsUploadingFront(true);
    else setIsUploadingBack(true);

    try {
      const res = await uploadDynamicProofFile(file);
      if (res.success && res.url) {
        if (side === 'front') {
          setCinDocumentFrontUrl(res.url);
        } else {
          setCinDocumentBackUrl(res.url);
        }
      } else {
        alert(res.error || 'Erreur lors du téléversement du document.');
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors du téléversement.');
    } finally {
      if (side === 'front') setIsUploadingFront(false);
      else setIsUploadingBack(false);
    }
  };

  // Submit KYC Dossier for Admin Review
  const handleSubmitKycDossier = async () => {
    if (!cin.trim()) {
      alert('Veuillez renseigner votre numéro de CIN.');
      return;
    }
    if (!cinDocumentFrontUrl) {
      alert('Veuillez téléverser le recto de votre carte d\'identité nationale.');
      return;
    }

    setIsSubmittingKyc(true);
    try {
      await updateProfile({
        cin,
        cinDocumentFrontUrl,
        cinDocumentBackUrl,
        kycStatus: 'PENDING',
      });
      setKycStatus('PENDING');
      setKycFeedbackMsg('Votre dossier KYC a été soumis avec succès et est en cours d\'examen par notre équipe.');
      setTimeout(() => setKycFeedbackMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la soumission du dossier.');
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  // Save General Profile Info
  const handleSaveProfile = async () => {
    await updateProfile({
      fullName,
      avatarUrl,
      headline,
      bio,
      city,
      phone,
      whatsappEnabled,
      cin,
      isAvailableForHire,
      minTaskReward: Number(minTaskReward),
      specializedCategories,
      skills,
      languages,
      bankName,
      bankRib,
      bankAccountHolder,
      notifyWhatsapp,
      notifyEmail,
      portfolio,
    });
    showToast('✅ Modifications du profil enregistrées avec succès !');
  };

  // Add Skill Tag
  const handleAddSkill = (skillToAdd?: string) => {
    const s = (skillToAdd || newSkillInput).trim();
    if (!s) return;
    if (!skills.includes(s)) {
      const updated = [...skills, s];
      setSkills(updated);
      setNewSkillInput('');
      updateProfile({ skills: updated });
    }
  };

  // Remove Skill Tag
  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    setSkills(updated);
    updateProfile({ skills: updated });
  };

  // Toggle Category Checkbox
  const handleToggleCategory = (catId: string) => {
    let updated: string[];
    if (specializedCategories.includes(catId)) {
      if (specializedCategories.length === 1) return; // Keep at least one
      updated = specializedCategories.filter((c) => c !== catId);
    } else {
      updated = [...specializedCategories, catId];
    }
    setSpecializedCategories(updated);
    updateProfile({ specializedCategories: updated });
  };

  // Add Language
  const handleAddLanguage = () => {
    if (!newLangName.trim()) return;
    const updated = [...languages, { language: newLangName.trim(), level: newLangLevel }];
    setLanguages(updated);
    setNewLangName('');
    updateProfile({ languages: updated });
  };

  // Remove Language
  const handleRemoveLanguage = (idx: number) => {
    const updated = languages.filter((_, i) => i !== idx);
    setLanguages(updated);
    updateProfile({ languages: updated });
  };

  // Add Portfolio Item
  const handleAddPortfolioItem = () => {
    if (!newPortTitle.trim() || !newPortDesc.trim()) {
      showToast('⚠️ Veuillez renseigner le titre et la description du projet');
      return;
    }
    const newItem: UserPortfolioItem = {
      id: `port_${Date.now()}`,
      title: newPortTitle.trim(),
      description: newPortDesc.trim(),
      category: newPortCat,
      imageUrl: newPortImg.trim() || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      linkUrl: newPortLink.trim() || undefined,
      completedAt: 'À l’instant',
    };
    const updated = [newItem, ...portfolio];
    setPortfolio(updated);
    updateProfile({ portfolio: updated });
    setIsAddPortfolioModalOpen(false);
    setNewPortTitle('');
    setNewPortDesc('');
    setNewPortImg('');
    setNewPortLink('');
    showToast('🎉 Réalisation ajoutée à votre portfolio !');
  };

  // Delete Portfolio Item
  const handleDeletePortfolioItem = (id: string) => {
    const updated = portfolio.filter((p) => p.id !== id);
    setPortfolio(updated);
    updateProfile({ portfolio: updated });
    showToast('Projet retiré du portfolio');
  };

  // Request Payout
  const handleConfirmWithdrawal = async () => {
    if (withdrawAmountDH <= 0) {
      showToast('⚠️ Montant invalide');
      return;
    }
    const availableDH = Math.round(user.balanceAvailable * 10);
    if (withdrawAmountDH > availableDH) {
      showToast('⚠️ Solde insuffisant pour ce virement');
      return;
    }
    const amountEur = withdrawAmountDH / 10;
    await updateProfile({
      balanceAvailable: Math.max(0, user.balanceAvailable - amountEur),
      bankName,
      bankRib,
      bankAccountHolder,
    });
    setIsWithdrawModalOpen(false);
    showToast(`💸 Virement de ${withdrawAmountDH} DH ordonné vers ${bankName} (${bankRib.slice(-4)}) ! Délai: 24h ouvrées.`);
  };

  // Calculate Level XP progress
  const tierNumber = user.performerTier === 'level_5' ? 5 : user.performerTier === 'level_4' ? 4 : user.performerTier === 'level_3' ? 3 : user.performerTier === 'level_2' ? 2 : 1;
  const currentXp = user.performerXp || 780;
  const nextTierXp = tierNumber * 350;
  const xpPercent = Math.min(100, Math.round((currentXp / nextTierXp) * 100));

  const balanceDH = Math.round(user.balanceAvailable * 10);
  const escrowDH = Math.round(user.balanceEscrow * 10);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full rounded-3xl bg-white border border-slate-200 p-8 text-center shadow-lg space-y-5">
          <div className="h-16 w-16 rounded-3xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 mx-auto text-2xl font-black">
            <FiUser />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Espace Profil & Coordonnées
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Connectez-vous à votre compte tâches.ma pour gérer vos informations personnelles, votre photo de profil, vos compétences et vos coordonnées bancaires.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="flex-1 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold py-3 text-xs shadow-md transition cursor-pointer"
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="flex-1 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 text-xs transition cursor-pointer"
            >
              Créer un compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 space-y-6">

        {/* TOP PROFILE HERO CARD */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-5 sm:p-8 shadow-xs">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-brand-50 blur-3xl opacity-70 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            {/* Left: Avatar + Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="relative group shrink-0">
                <input
                  type="file"
                  ref={avatarFileInputRef}
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160'}
                  alt={fullName}
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl object-cover border-2 border-brand-700 shadow-md ring-4 ring-brand-50"
                />
                <div className="absolute -bottom-2 -right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md hover:bg-brand-700 transition cursor-pointer disabled:opacity-50"
                    title="Téléverser une photo depuis votre appareil"
                  >
                    {isUploadingAvatar ? <FiRefreshCw className="animate-spin text-xs" /> : <FiCamera className="text-xs" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newUrl = prompt('Ou collez l’URL de votre nouvelle photo de profil :', avatarUrl);
                      if (newUrl && newUrl.trim()) {
                        setAvatarUrl(newUrl.trim());
                        updateProfile({ avatarUrl: newUrl.trim() });
                      }
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-300 text-slate-700 shadow-md hover:bg-slate-50 transition cursor-pointer"
                    title="Saisir une URL d'image"
                  >
                    <FiEdit2 className="text-xs" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {fullName}
                  </h1>

                  {/* Level Tier Badge */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-[11px] font-extrabold text-brand-700 uppercase">
                    <FiAward className="text-xs" />
                    Niveau {tierNumber} • {tierNumber >= 3 ? 'Pro Daman' : 'Freelance'}
                  </span>

                  {/* Moroccan Verification Badge */}
                  {user.passedQualification && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                      <FiCheckCircle className="text-xs text-emerald-600" />
                      Test Réussi
                    </span>
                  )}

                  {user.cinVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-[11px] font-bold text-sky-700">
                      <FiShield className="text-xs text-sky-600" />
                      CIN Vérifié Maroc
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  {headline}
                </p>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-slate-500 pt-0.5">
                  <div className="flex items-center gap-1 text-slate-700">
                    <FiMapPin className="text-brand-600" />
                    <span>{city}, Maroc</span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <FiStar className="fill-amber-400 text-amber-500 text-xs" />
                    <span>{user.performerRating || 4.96}</span>
                    <span className="text-slate-400 font-normal">({user.performerReviewsCount || 48} avis)</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-600">
                    <FiClock className="text-emerald-500 text-xs" />
                    <span>Réponse &lt; 15 min</span>
                  </div>

                  <div className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                    <span>99.4% à temps</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Actions & Availability Switch */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 shrink-0">
              {/* Availability Switch */}
              <button
                type="button"
                onClick={() => {
                  const updated = !isAvailableForHire;
                  setIsAvailableForHire(updated);
                  updateProfile({ isAvailableForHire: updated });
                  showToast(updated ? '🟢 Vous êtes désormais disponible pour de nouvelles missions' : '⚪ Statut passé en pause');
                }}
                className={`flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition border cursor-pointer ${
                  isAvailableForHire
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${isAvailableForHire ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isAvailableForHire ? 'Disponible pour missions' : 'En pause / Indisponible'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
                >
                  <FiEye className="text-slate-500" />
                  <span>Aperçu Public</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newRole = isCustomer ? 'PERFORMER' : 'CUSTOMER';
                    toggleRole(newRole);
                    showToast(newRole === 'CUSTOMER' ? 'Basculé en mode Donneur d’ordre (Client)' : 'Basculé en mode Prestataire Freelance');
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <FiRefreshCw className="text-slate-300" />
                  <span>{isCustomer ? 'Mode Freelance' : 'Mode Client'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* XP & PROGRESS BAR */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <FiZap className="text-amber-500 text-sm" />
              <span>Progression Niveau {tierNumber} :</span>
              <span className="font-extrabold text-brand-700">{currentXp} XP</span>
              <span className="text-slate-400">/ {nextTierXp} XP pour Niveau {Math.min(5, tierNumber + 1)}</span>
            </div>

            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-extrabold text-slate-500 shrink-0">{xpPercent}%</span>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200">
          {[
            { id: 'overview', label: 'Aperçu & Stats', icon: FiTrendingUp },
            { id: 'bio', label: 'Infos & Présentation', icon: FiUser },
            { id: 'skills', label: 'Compétences & Filtres', icon: FiSliders },
            { id: 'portfolio', label: `Portfolio (${portfolio.length})`, icon: FiBriefcase },
            { id: 'reviews', label: `Avis Clients (${user.performerReviewsCount || 48})`, icon: FiStar },
            { id: 'payout', label: 'Retraits Remitly & Binance', icon: FiDollarSign },
            { id: 'tests', label: 'Tests & Certification', icon: FiAward },
            { id: 'settings', label: 'Paramètres & Alertes', icon: FiZap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border-b-2 -mb-px ${
                  isSelected
                    ? 'border-brand-700 text-brand-800 bg-white shadow-2xs font-extrabold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className={isSelected ? 'text-brand-700' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & STATS */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
                  <span>Missions Terminées</span>
                  <FiCheckCircle className="text-emerald-500 text-base" />
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {user.performerCompletedTasks || 52}
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  100% validées avec succès
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
                  <span>Total des Gains</span>
                  <FiDollarSign className="text-brand-600 text-base" />
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {((user.performerCompletedTasks || 52) * 165).toLocaleString()} DH
                </div>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  ~{Math.round(((user.performerCompletedTasks || 52) * 165) / 10)} € virés
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
                  <span>Note d'Excellence</span>
                  <FiStar className="text-amber-500 text-base" />
                </div>
                <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                  <span>{user.performerRating || 4.96}</span>
                  <span className="text-xs font-normal text-slate-400">/ 5.0</span>
                </div>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">
                  Basé sur {user.performerReviewsCount || 48} avis clients
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
                  <span>Solde Disponible</span>
                  <FiLock className="text-emerald-600 text-base" />
                </div>
                <div className="text-2xl font-black text-emerald-600">
                  {balanceDH} DH
                </div>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  {escrowDH > 0 ? `+${escrowDH} DH sous séquestre` : 'Prêt pour virement bancaire'}
                </p>
              </div>
            </div>

            {/* Quick Actions Banners */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                    Missions Ouvertes
                  </div>
                  <h3 className="text-base font-extrabold mt-2">
                    Trouver de nouvelles missions
                  </h3>
                  <p className="text-xs text-brand-100 mt-1">
                    Accédez aux demandes de clients marocains avec paiement séquestre garanti.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/${locale}/tasks`)}
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white text-brand-900 py-2.5 px-4 text-xs font-extrabold hover:bg-brand-50 transition cursor-pointer"
                >
                  <span>Explorer les tâches</span>
                  <FiArrowRight />
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                    Portefeuille
                  </div>
                  <h3 className="text-base font-extrabold mt-2">
                    Demander un virement Remitly / Binance Pay
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Retirez vos gains de missions facilement via Remitly ou Binance Pay.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => switchTab('payout')}
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-slate-950 py-2.5 px-4 text-xs font-extrabold hover:bg-emerald-400 transition cursor-pointer"
                >
                  <span>Retirer mes {balanceDH} DH</span>
                  <FiDollarSign />
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                    Visibilité
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-2">
                    Partager mon profil public
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Envoyez votre lien certifié avec vos réalisations et avis clients à vos prospects.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/${locale}/profile?user=${user.id}`;
                    navigator.clipboard.writeText(shareUrl);
                    showToast('📋 Lien de votre profil copié dans le presse-papier !');
                  }}
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 py-2.5 px-4 text-xs font-extrabold transition cursor-pointer"
                >
                  <FiShare2 />
                  <span>Copier le lien public</span>
                </button>
              </div>
            </div>

            {/* Recent Reviews Preview */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FiStar className="text-amber-500 fill-amber-400" />
                  <span>Derniers retours et avis clients vérifiés</span>
                </h3>
                <button
                  type="button"
                  onClick={() => switchTab('reviews')}
                  className="text-xs font-bold text-brand-700 hover:underline cursor-pointer"
                >
                  Voir tous les avis ({user.performerReviewsCount || 48}) →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reviews.length > 0 ? (
                  reviews.slice(0, 2).map((rev: any) => (
                    <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={rev.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'} alt={rev.author_name} className="h-7 w-7 rounded-full object-cover" />
                          <span className="text-xs font-extrabold text-slate-900">{rev.author_name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-600 text-xs font-extrabold">
                          <FiStar className="fill-amber-400 text-amber-500 text-[11px]" />
                          <span>{Number(rev.rating).toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        « {rev.comment} »
                      </p>
                      <div className="text-[11px] text-slate-400 font-semibold pt-1 border-t border-slate-200">
                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Récemment'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    Aucun avis pour le moment. Vos avis apparaîtront ici après la validation de vos premières missions.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BIO & INFOS */}
        {activeTab === 'bio' && (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Informations Personnelles & Présentation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ces informations sont visibles par les clients souhaitant vous confier des missions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom Complet ou Nom d'Artiste
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-brand-700 focus:outline-none"
                  placeholder="Ex: Mehdi Aero"
                />
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Titre Professionnel / Spécialité
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-brand-700 focus:outline-none"
                  placeholder="Ex: Expert Shopify & Développeur Web Fullstack"
                />
              </div>

              {/* City in Morocco */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ville / Région au Maroc
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-brand-700 focus:outline-none"
                >
                  {MOROCCAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone & WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Numéro de Téléphone Maroc (+212)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-brand-700 focus:outline-none"
                    placeholder="+212 6 XX XX XX XX"
                  />
                  <label className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={whatsappEnabled}
                      onChange={(e) => setWhatsappEnabled(e.target.checked)}
                      className="rounded border-slate-300 text-brand-700 focus:ring-brand-600"
                    />
                    <span>WhatsApp</span>
                  </label>
                </div>
              </div>

              {/* Account Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse Email du Compte
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    readOnly
                    value={user.email || ''}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-semibold text-slate-600 cursor-not-allowed select-all"
                  />
                  <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-2 text-[10px] font-bold text-emerald-700 shrink-0">
                    <FiCheckCircle className="text-xs" />
                    Vérifié
                  </span>
                </div>
              </div>

              {/* Avatar URL / File Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Photo de Profil (URL ou Téléversement)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-brand-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 shrink-0 cursor-pointer shadow-2xs"
                  >
                    {isUploadingAvatar ? 'Chargement...' : 'Fichier'}
                  </button>
                </div>
              </div>

              {/* Moroccan CIN & KYC Verification Block */}
              <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-xl">
                      <FiShield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Vérification d&apos;Identité KYC (Garantie Daman Maroc)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        La vérification de votre CIN confère le badge officiel et rassure les donneurs d&apos;ordre.
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {kycStatus === 'VERIFIED' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                        <FiCheckCircle className="w-4 h-4" />
                        <span>Identité Vérifiée 🛡️</span>
                      </span>
                    ) : kycStatus === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
                        <FiClock className="w-4 h-4 animate-spin" />
                        <span>Examen en cours</span>
                      </span>
                    ) : kycStatus === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-xs font-bold">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>Dossier Refusé</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold">
                        <FiShield className="w-4 h-4" />
                        <span>Non Vérifié</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Feedback message banner */}
                {kycFeedbackMsg && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 shrink-0" />
                    <span>{kycFeedbackMsg}</span>
                  </div>
                )}

                {/* Rejection Notice if rejected */}
                {kycStatus === 'REJECTED' && kycRejectionReason && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl text-xs font-medium flex items-start gap-2">
                    <FiAlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <div>
                      <span className="font-bold">Motif du rejet par le modérateur : </span>
                      {kycRejectionReason}. Veuillez téléverser des documents plus nets.
                    </div>
                  </div>
                )}

                {/* CIN Number Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Numéro de Carte d&apos;Identité Nationale (CIN)
                  </label>
                  <input
                    type="text"
                    value={cin}
                    disabled={kycStatus === 'VERIFIED'}
                    onChange={(e) => setCin(e.target.value.toUpperCase())}
                    className="w-full max-w-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:border-brand-700 focus:outline-none uppercase font-mono disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                    placeholder="Ex: BK123456 ou AB98765"
                  />
                </div>

                {/* Document Uploads Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Front ID */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      1. Photo CIN Recto (Face avant avec photo) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-3 bg-white dark:bg-slate-900/80 hover:border-brand-500 transition-all text-center">
                      {cinDocumentFrontUrl ? (
                        <div className="relative group">
                          <img
                            src={cinDocumentFrontUrl}
                            alt="CIN Recto"
                            className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                          />
                          {kycStatus !== 'VERIFIED' && (
                            <button
                              type="button"
                              onClick={() => setCinDocumentFrontUrl('')}
                              className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow transition-all"
                              title="Supprimer"
                            >
                              <FiX className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="mt-1.5 flex items-center justify-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                            <FiCheckCircle className="w-3.5 h-3.5" />
                            <span>Document Recto chargé</span>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center py-4 cursor-pointer">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,application/pdf"
                            disabled={isUploadingFront || kycStatus === 'VERIFIED'}
                            onChange={(e) => handleUploadKycDoc(e, 'front')}
                            className="hidden"
                          />
                          <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-xl flex items-center justify-center mb-2">
                            {isUploadingFront ? (
                              <FiRefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                              <FiCamera className="w-5 h-5" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {isUploadingFront ? 'Téléversement en cours...' : 'Sélectionner Photo Recto'}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG ou PDF (Max 15 Mo)</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Back ID */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      2. Photo CIN Verso (Face arrière avec adresse)
                    </label>
                    <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-3 bg-white dark:bg-slate-900/80 hover:border-brand-500 transition-all text-center">
                      {cinDocumentBackUrl ? (
                        <div className="relative group">
                          <img
                            src={cinDocumentBackUrl}
                            alt="CIN Verso"
                            className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                          />
                          {kycStatus !== 'VERIFIED' && (
                            <button
                              type="button"
                              onClick={() => setCinDocumentBackUrl('')}
                              className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow transition-all"
                              title="Supprimer"
                            >
                              <FiX className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="mt-1.5 flex items-center justify-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                            <FiCheckCircle className="w-3.5 h-3.5" />
                            <span>Document Verso chargé</span>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center py-4 cursor-pointer">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,application/pdf"
                            disabled={isUploadingBack || kycStatus === 'VERIFIED'}
                            onChange={(e) => handleUploadKycDoc(e, 'back')}
                            className="hidden"
                          />
                          <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-xl flex items-center justify-center mb-2">
                            {isUploadingBack ? (
                              <FiRefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                              <FiUploadCloud className="w-5 h-5" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {isUploadingBack ? 'Téléversement en cours...' : 'Sélectionner Photo Verso'}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG ou PDF (Max 15 Mo)</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit KYC Dossier Button */}
                {kycStatus !== 'VERIFIED' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSubmitKycDossier}
                      disabled={isSubmittingKyc || isUploadingFront || isUploadingBack || !cin.trim() || !cinDocumentFrontUrl}
                      className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isSubmittingKyc ? (
                        <>
                          <FiRefreshCw className="w-4 h-4 animate-spin" />
                          <span>Transmission du dossier...</span>
                        </>
                      ) : (
                        <>
                          <FiShield className="w-4 h-4" />
                          <span>Soumettre mon dossier KYC pour vérification</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Photo de Profil (URL de l'image)
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-brand-700 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Bio / Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Présentation Détaillée ("À propos de moi")
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs font-normal text-slate-900 focus:border-brand-700 focus:outline-none"
                placeholder="Présentez vos points forts, votre méthode de travail et vos garanties de ponctualité..."
              />
            </div>

            {/* Languages List */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Langues Pratiquées & Maîtrisées
              </label>

              <div className="flex flex-wrap gap-2 mb-3">
                {languages.map((l, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800"
                  >
                    <FiGlobe className="text-brand-600" />
                    <span>{l.language}</span>
                    <span className="text-[10px] font-normal text-slate-500">({l.level === 'native' ? 'Maternelle' : l.level === 'fluent' ? 'Courant' : 'Intermédiaire'})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(idx)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Language Row */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  placeholder="Ajouter une langue (ex: Espagnol, Berbère)"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-brand-700 focus:outline-none"
                />
                <select
                  value={newLangLevel}
                  onChange={(e) => setNewLangLevel(e.target.value as any)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-brand-700 focus:outline-none"
                >
                  <option value="native">Langue Maternelle</option>
                  <option value="fluent">Courant / Bilingue</option>
                  <option value="intermediate">Intermédiaire</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold transition cursor-pointer"
                >
                  + Ajouter
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white px-6 py-2.5 text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer"
              >
                <FiSave className="text-sm" />
                <span>Enregistrer les modifications</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SKILLS & CATEGORIES */}
        {activeTab === 'skills' && (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Spécialités, Compétences & Filtres de Missions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sélectionnez les domaines pour lesquels vous souhaitez être notifié et recevoir des propositions.
              </p>
            </div>

            {/* Preferred Categories Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-3">
                Mes Catégories Principales
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DEFAULT_CATEGORIES.map((cat) => {
                  const isChecked = specializedCategories.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'border-brand-700 bg-brand-50/50 ring-2 ring-brand-700/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-2xl shrink-0 mt-0.5">{cat.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900">{cat.label}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-brand-700 focus:ring-brand-600"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{cat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skills Tag Cloud & Input */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Mots-clés & Outils Maîtrisés (Skills)
              </label>

              {/* Active Skills */}
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 border border-brand-200 px-3 py-1.5 text-xs font-extrabold text-brand-900"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-brand-400 hover:text-rose-600 cursor-pointer"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Skill */}
              <div className="flex items-center gap-2 max-w-md mb-4">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Ex: Figma, Dropcontact, Stripe..."
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-brand-700 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold transition cursor-pointer"
                >
                  + Ajouter
                </button>
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Suggestions populaires :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_SKILLS_SUGGESTIONS.filter((s) => !skills.includes(s)).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSkill(s)}
                      className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-800 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition cursor-pointer"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Minimum Task Reward Filter */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Rémunération minimale souhaitée par mission
                </label>
                <p className="text-[11px] text-slate-500">
                  Ne recevoir d’alertes que pour les tâches offrant au moins ce montant.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  step={10}
                  value={minTaskReward}
                  onChange={(e) => setMinTaskReward(Number(e.target.value))}
                  className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-900 text-right focus:border-brand-700 focus:outline-none"
                />
                <span className="text-xs font-extrabold text-slate-700">DH</span>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white px-6 py-2.5 text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer"
              >
                <FiSave className="text-sm" />
                <span>Enregistrer mes compétences</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: PORTFOLIO & REALISATIONS */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Portfolio & Réalisations Vérifiées
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Présentez vos meilleurs travaux pour maximiser vos chances de sélection par les donneurs d'ordre.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddPortfolioModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white px-4 py-2.5 text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer"
              >
                <FiPlus className="text-sm" />
                <span>Ajouter une réalisation</span>
              </button>
            </div>

            {/* Portfolio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {item.imageUrl && (
                      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute top-2.5 left-2.5 rounded-full bg-slate-900/80 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-extrabold text-white uppercase">
                          {item.category}
                        </span>
                      </div>
                    )}
                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {item.completedAt || 'Vérifié Tâches.ma'}
                    </span>

                    <div className="flex items-center gap-2">
                      {item.linkUrl && (
                        <a
                          href={item.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 transition"
                          title="Voir le lien en ligne"
                        >
                          <FiExternalLink className="text-xs" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePortfolioItem(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Supprimer"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {portfolio.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-8">
                <FiBriefcase className="mx-auto text-3xl text-slate-400 mb-2" />
                <h3 className="text-sm font-extrabold text-slate-900">Aucune réalisation pour le moment</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Ajoutez des captures d'écran et des liens vers vos projets récents pour rassurer les clients.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddPortfolioModalOpen(true)}
                  className="mt-4 rounded-xl bg-brand-700 text-white px-4 py-2 text-xs font-bold"
                >
                  + Ajouter un premier projet
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CLIENT REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Reviews Summary Header */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="text-center p-4 rounded-2xl bg-amber-50 border border-amber-200 shrink-0">
                    <div className="text-4xl font-black text-amber-600">
                      {user.performerRating || 4.96}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className="fill-amber-400 text-amber-400 text-xs" />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 mt-1 block">
                      {user.performerReviewsCount || 48} avis
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1 max-w-md">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <span>5 étoiles</span>
                      <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-amber-400 w-[96%]" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">46</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <span>4 étoiles</span>
                      <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-amber-400 w-[4%]" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">2</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <span>3 étoiles</span>
                      <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-slate-200 w-0" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">0</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5">
                    <FiShield className="text-emerald-700" />
                    <span>Avis 100% Vérifiés Daman Séquestre</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Chaque évaluation provient obligatoirement d'une tâche réelle payée et validée par le client.
                  </p>
                </div>
              </div>
            </div>

            {/* List of Reviews */}
            <div className="space-y-3">
              {reviews.length > 0 ? (
                reviews.map((rev: any) => (
                  <div key={rev.id} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-2xs space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
                          alt={rev.author_name}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-extrabold text-xs sm:text-sm text-slate-900">
                            {rev.author_name}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-400">
                            Client vérifié
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs">
                          <FiStar className="fill-amber-400 text-amber-400 text-xs" />
                          <span>{Number(rev.rating).toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Récemment'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      « {rev.comment} »
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <div className="text-2xl">⭐</div>
                  <div className="text-sm font-extrabold text-slate-900">Aucun avis pour le moment</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Réalisez des tâches pour des clients sur Tâches.ma pour collecter des avis vérifiés et bâtir votre réputation.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: REMITLY & BINANCE PAYOUT DETAILS */}
        {activeTab === 'payout' && (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Coordonnées de Retrait (Remitly & Binance Pay)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Renseignez vos coordonnées de réception pour recevoir vos gains rapidement.
              </p>
            </div>

            {/* Live Balance Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-brand-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <span className="text-[10px] font-extrabold text-brand-300 uppercase tracking-wider">
                  Solde Prêt à Être Viré
                </span>
                <div className="text-3xl font-black text-emerald-400 mt-0.5">
                  {balanceDH} DH <span className="text-xs font-normal text-slate-300">(~{user.balanceAvailable.toFixed(2)} €)</span>
                </div>
                {escrowDH > 0 && (
                  <div className="text-xs text-amber-300 font-semibold mt-1 flex items-center gap-1">
                    <FiLock />
                    <span>{escrowDH} DH supplémentaires en attente sous séquestre</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(true)}
                disabled={balanceDH <= 0}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 px-6 py-3 text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer shrink-0"
              >
                💸 Demander un virement immédiat
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Remitly Recipient Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom & Prénom du Bénéficiaire (Remitly)
                </label>
                <input
                  type="text"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-brand-700 focus:outline-none"
                  placeholder="Ex: Mehdi Aero"
                />
              </div>

              {/* Remitly Phone or Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Téléphone ou Email associé à Remitly
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-brand-700 focus:outline-none"
                  placeholder="Ex: +212 600 000000 ou email@example.com"
                />
              </div>

              {/* Binance Pay ID */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ID Binance Pay ou Email Binance (Optionnel pour Crypto)
                </label>
                <input
                  type="text"
                  value={bankRib}
                  onChange={(e) => setBankRib(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-brand-700 focus:outline-none tracking-wider"
                  placeholder="Ex: 892401844 ou user@binance.com"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Pour les retraits instantanés en USDT sans frais.
                </p>
              </div>
            </div>

            {/* Payout Instructions Callout */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <FiCheckCircle className="text-emerald-600" />
                <span>Règles de virement Tâches.ma (Remitly & Binance)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 pl-1">
                <li>Retraits exécutés via Remitly ou Binance Pay.</li>
                <li>Montant minimum de retrait : <strong>50 DH</strong>.</li>
                <li>0% de commission de retrait.</li>
              </ul>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white px-6 py-2.5 text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer"
              >
                <FiSave className="text-sm" />
                <span>Enregistrer mes coordonnées</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: TESTS & QUALIFICATIONS */}
        {activeTab === 'tests' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Tests de Qualification & Certifications Tâches.ma
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Prouvez vos compétences pour débloquer les missions de niveau supérieur et afficher les badges certifiés.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mandatory General Test */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xl font-black">
                      🛡️
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Test Général Séquestre & Daman
                      </h3>
                      <span className="text-[11px] text-slate-500">Règles de ponctualité, arbitrage et séquestre</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-extrabold">
                    <FiCheck /> Réussi 100%
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Test obligatoire pour tous les freelances sur tâches.ma validant la compréhension du fonctionnement du séquestre et du respect des délais impartis.
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Validé le 15 Janvier 2026</span>
                  <button
                    type="button"
                    onClick={() => router.push(`/${locale}?test=true`)}
                    className="text-brand-700 font-bold hover:underline cursor-pointer"
                  >
                    Repasser le test →
                  </button>
                </div>
              </div>

              {/* E-commerce & Shopify Test */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 text-xl font-black">
                      🛒
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Certification Shopify & E-commerce
                      </h3>
                      <span className="text-[11px] text-slate-500">Intégration thèmes, passerelles et tunnels de vente</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 text-brand-800 px-2.5 py-0.5 text-[10px] font-extrabold">
                    <FiAward /> Score 96%
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Validation des compétences en configuration de boutique en ligne pour le marché marocain (paiement à la livraison, passerelles CMI et optimisation mobile).
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Validé le 20 Février 2026</span>
                  <span className="text-emerald-700 font-extrabold">Badge Actif</span>
                </div>
              </div>

              {/* Copywriting & Translation Test */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-xl font-black">
                      ✍️
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Test Traduction & Orthographe
                      </h3>
                      <span className="text-[11px] text-slate-500">Arabe standard, Darija & Français</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-extrabold">
                    <FiAward /> Score 98%
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Évaluation rigoureuse de la maîtrise de l'orthographe, de la syntaxe juridique et de la rédaction commerciale bilingue.
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Validé le 10 Mars 2026</span>
                  <span className="text-emerald-700 font-extrabold">Badge Actif</span>
                </div>
              </div>

              {/* Data Entry & Excel Test */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xl font-black">
                      📊
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Test Saisie Rapide & Excel Avancé
                      </h3>
                      <span className="text-[11px] text-slate-500">Vitesse de frappe, formules VLOOKUP</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-[10px] font-extrabold">
                    Disponible
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Passez ce test chronométré de 10 minutes pour certifier votre rapidité de saisie de factures et données comptables.
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Durée : 10 minutes</span>
                  <button
                    type="button"
                    onClick={() => showToast('Test de saisie bientôt ouvert !')}
                    className="text-brand-700 font-bold hover:underline cursor-pointer"
                  >
                    Démarrer le test →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS & NOTIFICATIONS */}
        {activeTab === 'settings' && (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Paramètres du Compte & Alertes de Missions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configurez la manière dont vous souhaitez être prévenu lorsqu'une mission correspondant à votre profil est publiée.
              </p>
            </div>

            <div className="space-y-4">
              {/* WhatsApp Alerts */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-black text-lg">
                    <FiMessageSquare />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">
                      Alertes WhatsApp Instantanées
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Recevez un message WhatsApp dès qu'une tâche dans vos catégories dépasse {minTaskReward} DH.
                    </div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={notifyWhatsapp}
                  onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-brand-700 focus:ring-brand-600"
                />
              </div>

              {/* Email Digest */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 font-black text-lg">
                    <FiZap />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">
                      Récapitulatif Quotidien par Email
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Recevez chaque matin la liste des missions les plus lucratives publiées au Maroc.
                    </div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-brand-700 focus:ring-brand-600"
                />
              </div>

              {/* Share Public Profile */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="text-xs font-extrabold text-slate-900">
                  Lien Public de Votre Profil Freelance
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? `${window.location.origin}/${locale}/profile?user=${user.id}` : `https://taches.ma/${locale}/profile?user=${user.id}`}
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono text-slate-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/${locale}/profile?user=${user.id}`;
                      navigator.clipboard.writeText(shareUrl);
                      showToast('📋 Lien copié dans le presse-papier !');
                    }}
                    className="rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-bold hover:bg-slate-800 transition cursor-pointer shrink-0"
                  >
                    <FiCopy className="inline mr-1" />
                    Copier
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white px-6 py-2.5 text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer"
              >
                <FiSave className="text-sm" />
                <span>Enregistrer mes préférences</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: ADD PORTFOLIO ITEM */}
      {isAddPortfolioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Ajouter une Réalisation au Portfolio
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPortfolioModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-lg"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Titre de la Réalisation *
              </label>
              <input
                type="text"
                value={newPortTitle}
                onChange={(e) => setNewPortTitle(e.target.value)}
                placeholder="Ex: Création Boutique Shopify pour Marque de Mode"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-brand-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catégorie *
              </label>
              <select
                value={newPortCat}
                onChange={(e) => setNewPortCat(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-brand-700 focus:outline-none"
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description du Travail Effectué *
              </label>
              <textarea
                rows={3}
                value={newPortDesc}
                onChange={(e) => setNewPortDesc(e.target.value)}
                placeholder="Décrivez les résultats obtenus, les technologies utilisées et le bénéfice pour le client..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-brand-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                URL de la Capture d'Écran / Image
              </label>
              <input
                type="text"
                value={newPortImg}
                onChange={(e) => setNewPortImg(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-brand-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lien Direct vers le Projet en Ligne (Optionnel)
              </label>
              <input
                type="text"
                value={newPortLink}
                onChange={(e) => setNewPortLink(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-brand-700 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddPortfolioModalOpen(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddPortfolioItem}
                className="rounded-xl bg-brand-700 hover:bg-brand-800 text-white px-5 py-2.5 text-xs font-extrabold shadow-sm transition"
              >
                + Publier la réalisation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PUBLIC PREVIEW */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold text-brand-700 uppercase tracking-wide">
                👁️ Aperçu Public (Vue Client)
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-lg"
              >
                ✕
              </button>
            </div>

            {/* Public Header */}
            <div className="flex items-center gap-4">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160'}
                alt={fullName}
                className="h-16 w-16 rounded-2xl object-cover border-2 border-brand-700 shadow-md"
              />
              <div>
                <h3 className="text-lg font-black text-slate-900">{fullName}</h3>
                <p className="text-xs font-semibold text-slate-600">{headline}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>📍 {city}, Maroc</span>
                  <span className="text-amber-600 font-bold">★ {user.performerRating || 4.96} ({user.performerReviewsCount || 48} avis)</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {bio && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {bio}
              </div>
            )}

            {/* Skills */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">Compétences Vérifiées</h4>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span key={s} className="rounded-lg bg-brand-50 border border-brand-200 text-brand-800 px-2.5 py-1 text-xs font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Portfolio Preview */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 mb-2">Réalisations ({portfolio.length})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {portfolio.slice(0, 2).map((item) => (
                  <div key={item.id} className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="font-extrabold text-xs text-slate-900">{item.title}</div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="rounded-xl bg-slate-900 text-white px-5 py-2.5 text-xs font-bold"
              >
                Fermer l'aperçu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INSTANT WITHDRAWAL */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Demande de Virement Bancaire
              </h3>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="text-slate-500">Compte bénéficiaire :</div>
              <div className="font-extrabold text-slate-900">{bankName}</div>
              <div className="font-mono text-slate-700 text-[11px]">{bankRib}</div>
              <div className="text-slate-600 text-[11px]">Titulaire : {bankAccountHolder}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Montant à Virer (en Dirhams Marocains)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={50}
                  max={balanceDH}
                  value={withdrawAmountDH}
                  onChange={(e) => setWithdrawAmountDH(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base font-black text-slate-900 focus:border-brand-700 focus:outline-none"
                />
                <span className="text-sm font-black text-slate-700">DH</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Solde maximum disponible : {balanceDH} DH
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdrawal}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-sm transition"
              >
                Confirmer le virement
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
