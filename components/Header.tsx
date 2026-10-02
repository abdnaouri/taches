'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserProfile, UserRole } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { PerformerSubscriptionModal } from '@/components/PerformerSubscriptionModal';
import { useAuth } from '@/lib/auth/AuthContext';
import { useAnalytics } from '@/lib/analytics';
import {
  FiBriefcase,
  FiCheckCircle,
  FiLock,
  FiPlus,
  FiClock,
  FiShield,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiChevronLeft,
  FiDollarSign,
  FiHelpCircle,
  FiMessageSquare,
  FiAward,
  FiCheck,
  FiUser,
  FiLogOut,
  FiBell
} from 'react-icons/fi';

interface HeaderProps {
  user?: UserProfile | null;
  onRoleToggle?: (role: UserRole) => void;
  onOpenCreateTask?: () => void;
  onOpenWallet?: () => void;
  onOpenQualification?: () => void;
  onViewMyWork?: () => void;
  activeTab?: 'explore' | 'my-tasks' | 'examples' | 'live';
  setActiveTab?: (tab: 'explore' | 'my-tasks' | 'examples' | 'live') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onRoleToggle,
  onOpenCreateTask: customOpenCreateTask,
  onOpenWallet: customOpenWallet,
  onOpenQualification: customOpenQualification,
  onViewMyWork: customViewMyWork,
  activeTab = 'explore',
  setActiveTab: customSetActiveTab,
}) => {
  const { isAuthenticated, profile, openAuthModal, signOut, toggleRole } = useAuth();
  const { track } = useAnalytics();
  const currentUser = isAuthenticated && profile ? profile : (isAuthenticated ? user : null);
  const isUserLoggedIn = isAuthenticated && Boolean(currentUser);

  const { t, locale, setLocale, locales, isRTL } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const isTasksPage = Boolean(pathname?.includes('/tasks'));
  const isCustomer = currentUser ? currentUser.activeRole === 'CUSTOMER' : true;
  const balanceDH = currentUser ? Math.round(currentUser.balanceAvailable * 10) : 0;

  const onOpenCreateTask = customOpenCreateTask || (() => router.push(`/${locale}/tasks/new`));
  const onOpenWallet = customOpenWallet || (() => router.push(`/${locale}/wallet`));
  const onOpenQualification = customOpenQualification || (() => router.push(`/${locale}?action=qualify`));
  const onViewMyWork = customViewMyWork || (() => router.push(`/${locale}/tasks?tab=my-tasks`));
  const setActiveTab = customSetActiveTab || ((tab) => router.push(`/${locale}/tasks?tab=${tab}`));
  const escrowDH = currentUser ? Math.round(currentUser.balanceEscrow * 10) : 0;

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Séquestre Daman activé pour votre mission.', time: 'Il y a 5 min', unread: true, href: `/${locale}/tasks?tab=open` },
    { id: 2, text: 'Nouvelle proposition reçue pour votre besoin.', time: 'Il y a 25 min', unread: true, href: `/${locale}/tasks?tab=open` },
    { id: 3, text: 'Solde portefeuille disponible mis à jour.', time: 'Il y a 2h', unread: false, href: `/${locale}/wallet` },
  ]);

  const unreadNotifCount = notifications.filter(n => n.unread).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scrolling when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/${locale}#${sectionId}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3 lg:px-8">

          {/* LEFT: BRAND LOGO + DESKTOP NAVIGATION */}
          <div className="flex items-center gap-3 sm:gap-6">
            <a
              href={`/${locale}`}
              onClick={(e) => {
                e.preventDefault();
                router.push(`/${locale}`);
              }}
              className="flex items-center gap-2.5 group shrink-0"
            >
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-brand-700 text-white shadow-xs group-hover:bg-brand-800 transition-colors">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tighter">T</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
                    tâches<span className="text-brand-600 font-extrabold">.ma</span>
                  </span>
                  <span className="hidden sm:inline-block rounded-full bg-brand-50 text-brand-700 border border-brand-200 px-1.5 py-0.2 text-[9px] font-extrabold uppercase">
                    Maroc
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wide hidden sm:block">
                  Micro-services & Séquestre
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-4 text-xs font-bold text-slate-600 pl-4 border-l border-slate-200">
              <a
                href={`/${locale}/tasks`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/${locale}/tasks`);
                }}
                className="hover:text-brand-700 transition"
              >
                {t('navExplore')}
              </a>
              <a
                href={`/${locale}/concepts`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/${locale}/concepts`);
                }}
                className="hover:text-brand-700 transition flex items-center gap-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg"
              >
                <span>💡 Modèle & Architecture</span>
              </a>
            </nav>
          </div>

          {/* RIGHT: WALLET + CTA + LANGUAGE + PROFILE + MOBILE HAMBURGER */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {!isUserLoggedIn ? (
              <>
                {/* Log In Button */}
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  Connexion
                </button>

                {/* Language Selector (Desktop) */}
                <div className="hidden sm:block">
                  <LanguageSelector />
                </div>
              </>
            ) : (
              <>
                {/* Wallet Widget */}
                <button
                  onClick={onOpenWallet}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs transition cursor-pointer shadow-2xs shrink-0"
                  title={t('walletOpenTooltip')}
                >
                  <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'} leading-none`}>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold hidden sm:block">
                      {t('balanceLabel')}
                    </span>
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      {balanceDH} DH
                    </span>
                  </div>
                  {escrowDH > 0 && (
                    <div className={`hidden sm:flex items-center gap-1 ${isRTL ? 'pr-2 border-r' : 'pl-2 border-l'} border-slate-200 text-slate-500`}>
                      <FiLock className="text-amber-600 text-[11px]" />
                      <span className="text-[11px] font-bold text-amber-700" title={t('escrowLockedTooltip')}>
                        {escrowDH} DH
                      </span>
                    </div>
                  )}
                </button>

                {/* Main Action Post Task Button */}
                {isCustomer ? (
                  <button
                    onClick={onOpenCreateTask}
                    className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-brand-700 hover:bg-brand-800 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <FiPlus className="text-sm font-black" />
                    <span className="hidden sm:inline">{t('btnPostTask')}</span>
                    <span className="sm:hidden text-xs">Publier</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSubModalOpen(true)}
                      className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-3 py-1.5 sm:py-2 text-xs font-extrabold text-slate-950 shadow-2xs transition cursor-pointer"
                    >
                      <FiAward className="text-sm" />
                      <span>Pass Prestataire</span>
                    </button>
                    <button
                      onClick={() => {
                        if (isTasksPage) {
                          setActiveTab('my-tasks');
                        } else {
                          router.push(`/${locale}/tasks?tab=my-tasks`);
                        }
                      }}
                      className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer whitespace-nowrap"
                    >
                      <FiClock className="text-xs text-emerald-400" />
                      <span className="hidden sm:inline">1 {t('btnInProgress')}</span>
                    </button>
                  </div>
                )}

                {/* Notification Bell Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                    title="Notifications"
                  >
                    <FiBell className="text-base" />
                    {unreadNotifCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white ring-2 ring-white">
                        {unreadNotifCount}
                      </span>
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div
                      className={`absolute z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-100 ${
                        isRTL ? 'left-0' : 'right-0'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                        <span className="text-xs font-black text-slate-900">Notifications</span>
                        <button
                          type="button"
                          onClick={() => {
                            setNotifications(notifications.map(n => ({ ...n, unread: false })));
                          }}
                          className="text-[10px] text-brand-700 font-bold hover:underline cursor-pointer"
                        >
                          Tout marquer lu
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              setNotifications(notifications.map(n => n.id === notif.id ? { ...n, unread: false } : n));
                              setIsNotificationsOpen(false);
                              router.push(notif.href);
                            }}
                            className={`p-2.5 rounded-xl text-xs transition cursor-pointer ${
                              notif.unread
                                ? 'bg-brand-50/60 border border-brand-100 text-slate-900 font-medium'
                                : 'bg-white hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="leading-snug text-[11px]">{notif.text}</span>
                              {notif.unread && (
                                <span className="h-1.5 w-1.5 rounded-full bg-brand-700 shrink-0 mt-1" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">{notif.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Language Selector (Desktop) */}
                <div className="hidden sm:block">
                  <LanguageSelector />
                </div>

                {/* Desktop User Avatar with Dropdown */}
                <div className="relative hidden lg:block" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="relative flex items-center cursor-pointer rounded-full p-0.5 hover:ring-2 hover:ring-brand-700/30 transition"
                  >
                    <img
                      src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                      alt={currentUser?.fullName || 'User'}
                      className="h-8 w-8 rounded-full border border-slate-300 object-cover"
                    />
                    <span className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white`} />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className={`absolute z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100 ${isRTL ? 'left-0' : 'right-0'
                        }`}
                    >
                      <div className="px-3 py-2.5 border-b border-slate-100">
                        <div className="font-bold text-xs text-slate-900 truncate">{currentUser?.fullName}</div>
                        <div className="text-[11px] text-slate-500 truncate">{currentUser?.email}</div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                            {isCustomer ? t('roleCustomer') : t('rolePerformer')}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newRole = isCustomer ? 'PERFORMER' : 'CUSTOMER';
                              if (onRoleToggle) onRoleToggle(newRole);
                              toggleRole(newRole);
                            }}
                            className="text-[10px] text-brand-700 hover:underline font-semibold cursor-pointer"
                          >
                            {isCustomer ? 'Passer Prestataire' : 'Passer Client'}
                          </button>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            router.push(`/${locale}/profile`);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-brand-800 bg-brand-50/50 hover:bg-brand-50 transition cursor-pointer"
                        >
                          <FiUser className="text-brand-700 text-sm" />
                          <span>Mon Profil Freelance & Stats</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenWallet();
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <FiDollarSign className="text-slate-400" />
                          <span>{t('menuWallet')}</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenQualification();
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <FiAward className="text-slate-400" />
                          <span>{t('menuQualification')}</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            router.push(`/${locale}/admin/payouts`);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <FiShield className="text-brand-700 text-sm" />
                          <span>Console Admin Payouts</span>
                        </button>

                        <a
                          href="https://wa.me/212600000000"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-50 transition"
                        >
                          <FiMessageSquare />
                          <span>{t('menuSupportWhatsApp')}</span>
                        </a>

                        <div className="pt-1 mt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              signOut();
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <FiLogOut className="text-rose-500 text-sm" />
                            <span>Se déconnecter</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* MOBILE HAMBURGER BUTTON (< 1024px) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? t('menuClose') : t('menuOpen')}
              className="lg:hidden flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 transition-colors shadow-2xs cursor-pointer active:scale-95"
            >
              {isMobileMenuOpen ? (
                <FiX className="text-xl text-slate-900" />
              ) : (
                <FiMenu className="text-xl text-slate-900" />
              )}
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE DRAWER MENU OVERLAY (< 1024px) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-out Drawer Panel */}
          <div
            className={`relative flex flex-col w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl z-10 overflow-y-auto animate-in duration-250 ${isRTL
              ? 'mr-auto slide-in-from-left'
              : 'ml-auto slide-in-from-right'
              }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white font-extrabold text-sm">
                  T
                </div>
                <span className="font-extrabold text-lg text-slate-900">
                  tâches<span className="text-brand-600">.ma</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                aria-label={t('menuClose')}
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Guest Welcome Card */}
            {!isUserLoggedIn ? (
              <div className="p-4 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-black text-lg shrink-0">
                    <FiUser />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">Bienvenue sur tâches.ma</div>
                    <div className="text-xs text-slate-500">Connectez-vous pour commencer</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('login');
                    }}
                    className="flex items-center justify-center rounded-xl bg-brand-700 hover:bg-brand-800 text-white py-2.5 px-3 text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <span>Connexion</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('signup');
                    }}
                    className="flex items-center justify-center rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 py-2.5 px-3 text-xs font-bold transition cursor-pointer"
                  >
                    <span>S'inscrire</span>
                  </button>
                </div>

                {/* Big Post Task Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenCreateTask();
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 py-3 text-xs font-extrabold text-white shadow-md active:scale-98 transition cursor-pointer"
                >
                  <FiPlus className="text-base font-black" />
                  <span>{t('btnPostTask')}</span>
                </button>
              </div>
            ) : (
              <>
                {/* Profile & Balance Card */}
                <div className="p-4 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                      alt={currentUser?.fullName || 'User'}
                      className="h-11 w-11 rounded-full border-2 border-brand-700 object-cover"
                    />
                    <div className="overflow-hidden">
                      <div className="font-extrabold text-sm text-slate-900 truncate">{currentUser?.fullName}</div>
                      <div className="text-xs text-slate-500 truncate">{currentUser?.email}</div>
                      <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.2 text-[10px] font-bold text-brand-800">
                        {isCustomer ? t('roleCustomer') : t('rolePerformer')}
                      </div>
                    </div>
                  </div>

                  {/* Balance Box with direct action */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t('balanceLabel')}
                      </span>
                      <div className="font-extrabold text-lg text-slate-900">
                        {balanceDH} DH
                      </div>
                      {escrowDH > 0 && (
                        <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 mt-0.5">
                          <FiLock className="text-amber-600" />
                          <span>{escrowDH} DH {t('escrowLockedTooltip')}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenWallet();
                      }}
                      className="rounded-lg bg-slate-100 hover:bg-brand-50 border border-slate-200 px-3 py-1.5 text-xs font-bold text-brand-700 cursor-pointer transition"
                    >
                      {t('tabDeposit')}
                    </button>
                  </div>
                </div>

                {/* Mode Switcher in Mobile Drawer */}
                <div className="p-4 border-b border-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Mode d'utilisation
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onRoleToggle) onRoleToggle('CUSTOMER');
                        toggleRole('CUSTOMER');
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${isCustomer
                        ? 'border-brand-700 bg-brand-50 text-brand-900 ring-2 ring-brand-700/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      <FiBriefcase className={`text-lg mb-1 ${isCustomer ? 'text-brand-700' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold">{t('roleCustomer')}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Pour commander</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onRoleToggle) onRoleToggle('PERFORMER');
                        toggleRole('PERFORMER');
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${!isCustomer
                        ? 'border-brand-700 bg-brand-50 text-brand-900 ring-2 ring-brand-700/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      <FiCheckCircle className={`text-lg mb-1 ${!isCustomer ? 'text-brand-700' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold">{t('rolePerformer')}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Pour travailler</span>
                    </button>
                  </div>

                  {/* Big Post Task Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenCreateTask();
                    }}
                    className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 py-3 text-xs font-extrabold text-white shadow-md active:scale-98 transition cursor-pointer"
                  >
                    <FiPlus className="text-base font-black" />
                    <span>{t('btnPostTask')}</span>
                  </button>
                </div>
              </>
            )}

            {/* Navigation List */}
            <div className="p-4 space-y-1 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Navigation
              </p>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push(`/${locale}/profile`);
                }}
                className="flex w-full items-center justify-between rounded-xl p-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FiUser className="text-base text-brand-700" />
                  <span className="font-extrabold text-brand-900">Mon Profil Freelance & Stats</span>
                </div>
                {isRTL ? <FiChevronLeft className="text-slate-400" /> : <FiChevronRight className="text-slate-400" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (isTasksPage) {
                    setActiveTab('explore');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    router.push(`/${locale}/tasks`);
                  }
                }}
                className={`flex w-full items-center justify-between rounded-xl p-3 text-xs font-bold transition cursor-pointer ${isTasksPage && activeTab === 'explore'
                  ? 'bg-brand-50 text-brand-800 font-extrabold'
                  : 'text-slate-700 hover:bg-slate-100'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FiClock className="text-base text-brand-700" />
                  <span>{t('navExplore')}</span>
                </div>
                {isRTL ? <FiChevronLeft className="text-slate-400" /> : <FiChevronRight className="text-slate-400" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (isTasksPage) {
                    setActiveTab('my-tasks');
                  } else {
                    router.push(`/${locale}/tasks?tab=my-tasks`);
                  }
                }}
                className={`flex w-full items-center justify-between rounded-xl p-3 text-xs font-bold transition cursor-pointer ${isTasksPage && activeTab === 'my-tasks'
                  ? 'bg-brand-50 text-brand-800 font-extrabold'
                  : 'text-slate-700 hover:bg-slate-100'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FiBriefcase className="text-base text-brand-700" />
                  <span>{isCustomer ? t('navMyOrders') : t('navMyMissions')}</span>
                </div>
                <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-bold text-white">
                  {isCustomer ? '2' : '1'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push(`/${locale}/concepts`);
                }}
                className="flex w-full items-center justify-between rounded-xl p-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">💡</span>
                  <span className="text-brand-800 font-extrabold">Modèle & Architecture</span>
                </div>
                {isRTL ? <FiChevronLeft className="text-slate-400" /> : <FiChevronRight className="text-slate-400" />}
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="flex w-full items-center justify-between rounded-xl p-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FiCheck className="text-base text-brand-700" />
                  <span>{t('menuHowItWorks')}</span>
                </div>
                {isRTL ? <FiChevronLeft className="text-slate-400" /> : <FiChevronRight className="text-slate-400" />}
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('marketplace-feed')}
                className="flex w-full items-center justify-between rounded-xl p-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FiShield className="text-base text-brand-700" />
                  <span>{t('menuDamanSecurity')}</span>
                </div>
                {isRTL ? <FiChevronLeft className="text-slate-400" /> : <FiChevronRight className="text-slate-400" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenQualification();
                }}
                className="flex w-full items-center justify-between rounded-xl p-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FiAward className="text-base text-brand-700" />
                  <span>{t('menuQualification')}</span>
                </div>
                {isRTL ? <FiChevronLeft className="text-slate-400" /> : <FiChevronRight className="text-slate-400" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push(`/${locale}/admin/payouts`);
                }}
                className="flex w-full items-center justify-between rounded-xl p-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FiShield className="text-base text-brand-700" />
                  <span>Console Admin Payouts</span>
                </div>
                {isRTL ? <FiChevronLeft className="text-slate-400" /> : <FiChevronRight className="text-slate-400" />}
              </button>

              {/* WhatsApp Support Callout */}
              <a
                href="https://wa.me/212600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl p-3 bg-brand-50 border border-brand-200 text-brand-900 text-xs font-bold transition hover:bg-brand-100"
              >
                <div className="flex items-center gap-3">
                  <FiMessageSquare className="text-base text-brand-700" />
                  <span>{t('menuSupportWhatsApp')}</span>
                </div>
                <span className="text-[10px] bg-brand-200 text-brand-950 px-2 py-0.5 rounded-full font-bold">
                  Direct
                </span>
              </a>
            </div>

            {/* Language Selector in Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                {t('language')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {locales.map((item) => {
                  const isSelected = item.code === locale;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        setLocale(item.code);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-between rounded-xl p-2.5 text-xs font-bold transition cursor-pointer ${isSelected
                        ? 'bg-brand-700 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{item.flag}</span>
                        <span>{item.nativeName}</span>
                      </div>
                      {isSelected && <FiCheckCircle className="text-xs" />}
                    </button>
                  );
                })}
              </div>

              {/* Log out button in mobile drawer */}
              {isUserLoggedIn && (
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
                  >
                    <FiLogOut className="text-sm" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-200 text-center text-[11px] text-slate-400">
                tâches.ma • 100% Séquestre Daman Maroc
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Performer Subscription Pass Modal */}
      <PerformerSubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        onOpenDeposit={onOpenWallet}
      />
    </>
  );
};
