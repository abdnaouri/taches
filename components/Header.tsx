'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, UserRole } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { QualificationModal } from '@/components/QualificationModal';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  FiBriefcase,
  FiCheckCircle,
  FiDollarSign,
  FiMessageSquare,
  FiAward,
  FiUser,
  FiLogOut,
  FiGrid,
  FiShield,
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
}) => {
  const { isAuthenticated, profile, openAuthModal, signOut, toggleRole, updateProfile } = useAuth();
  const currentUser = isAuthenticated && profile ? profile : (isAuthenticated ? user : null);
  const isUserLoggedIn = isAuthenticated && Boolean(currentUser);

  const { t, locale, isRTL } = useLanguage();
  const router = useRouter();
  const isCustomer = currentUser ? currentUser.activeRole === 'CUSTOMER' : true;
  const isVerifiedPerformer = Boolean(
    currentUser?.passedQualification ||
    currentUser?.cinVerified ||
    currentUser?.kycStatus === 'VERIFIED'
  );

  const onOpenWallet = customOpenWallet || (() => router.push(`/${locale}/wallet`));

  // Dropdown & Modal states
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3 lg:px-8">

          {/* LEFT SIDE: LOGO + ALL TASKS */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Logo */}
            <a
              href={`/${locale}`}
              onClick={(e) => {
                e.preventDefault();
                router.push(`/${locale}`);
              }}
              className="flex items-center gap-2 group shrink-0 cursor-pointer"
            >
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-brand-700 text-white shadow-xs group-hover:bg-brand-800 transition-colors">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tighter">T</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
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

            {/* All Tasks Link */}
            <a
              href={`/${locale}/tasks`}
              onClick={(e) => {
                e.preventDefault();
                router.push(`/${locale}/tasks`);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-brand-700 transition cursor-pointer whitespace-nowrap shadow-2xs"
            >
              <FiBriefcase className="text-sm text-brand-600 shrink-0" />
              <span>{locale === 'ar' ? 'جميع المهام' : locale === 'en' ? 'All Tasks' : 'Toutes les tâches'}</span>
            </a>
          </div>

          {/* RIGHT SIDE: ROLE & AUTH DEPENDENT */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!isUserLoggedIn ? (
              /* NOT LOGGED: Language selector + Login */
              <>
                <LanguageSelector />
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="rounded-xl bg-brand-700 hover:bg-brand-800 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer whitespace-nowrap"
                >
                  Connexion
                </button>
              </>
            ) : isCustomer ? (
              /* LOGGED CLIENT: Dashboard + Language selector + Profile photo */
              <>
                <button
                  type="button"
                  onClick={() => router.push(`/${locale}/dashboard`)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer whitespace-nowrap"
                >
                  <FiGrid className="text-brand-700 text-sm shrink-0" />
                  <span>Dashboard</span>
                </button>

                <LanguageSelector />

                {/* Profile photo with Dropdown Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="relative flex items-center cursor-pointer rounded-full p-0.5 hover:ring-2 hover:ring-brand-700/30 transition shrink-0"
                    title={currentUser?.fullName || 'Profil'}
                  >
                    <img
                      src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                      alt={currentUser?.fullName || 'User'}
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-slate-300 object-cover"
                    />
                    <span className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white`} />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className={`absolute z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100 ${
                        isRTL ? 'left-0' : 'right-0'
                      }`}
                    >
                      <div className="px-3 py-2.5 border-b border-slate-100">
                        <div className="font-bold text-xs text-slate-900 truncate">{currentUser?.fullName}</div>
                        <div className="text-[11px] text-slate-500 truncate">{currentUser?.email}</div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                            {t('roleCustomer')}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (onRoleToggle) onRoleToggle('PERFORMER');
                              toggleRole('PERFORMER');
                            }}
                            className="text-[10px] text-brand-700 hover:underline font-semibold cursor-pointer"
                          >
                            Passer Prestataire
                          </button>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            router.push(`/${locale}/profile`);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-brand-800 bg-brand-50/50 hover:bg-brand-50 transition cursor-pointer"
                        >
                          <FiUser className="text-brand-700 text-sm shrink-0" />
                          <span>Mon Profil & Coordonnées</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenWallet();
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <FiDollarSign className="text-slate-400 shrink-0" />
                          <span>{t('menuWallet')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            router.push(`/${locale}/admin/payouts`);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <FiShield className="text-brand-700 text-sm shrink-0" />
                          <span>Console Admin Payouts</span>
                        </button>

                        <a
                          href="mailto:contact@taches.ma?subject=Demande%20d%27assistance%20Taches.ma"
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-50 transition"
                        >
                          <FiMessageSquare className="shrink-0" />
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
                            <FiLogOut className="text-rose-500 text-sm shrink-0" />
                            <span>Se déconnecter</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* LOGGED FREELANCER: Dashboard + ( request verification badge ) + Language selector + Profile photo */
              <>
                <button
                  type="button"
                  onClick={() => router.push(`/${locale}/dashboard`)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer whitespace-nowrap"
                >
                  <FiGrid className="text-brand-700 text-sm shrink-0" />
                  <span>Dashboard</span>
                </button>

                {/* Request verification badge button */}
                <button
                  type="button"
                  onClick={() => setIsVerificationModalOpen(true)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    isVerifiedPerformer
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-2xs'
                  }`}
                  title={isVerifiedPerformer ? 'Badge vérifié actif' : 'Demander le badge vérifié'}
                >
                  {isVerifiedPerformer ? (
                    <>
                      <FiCheckCircle className="text-emerald-600 text-sm shrink-0" />
                      <span className="hidden sm:inline">Badge Vérifié</span>
                      <span className="sm:hidden">Vérifié</span>
                    </>
                  ) : (
                    <>
                      <FiAward className="text-sm shrink-0" />
                      <span className="hidden sm:inline">Demander le badge vérifié</span>
                      <span className="sm:hidden">Badge</span>
                    </>
                  )}
                </button>

                <LanguageSelector />

                {/* Profile photo with Dropdown Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="relative flex items-center cursor-pointer rounded-full p-0.5 hover:ring-2 hover:ring-brand-700/30 transition shrink-0"
                    title={currentUser?.fullName || 'Profil'}
                  >
                    <img
                      src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                      alt={currentUser?.fullName || 'User'}
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-slate-300 object-cover"
                    />
                    <span className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white`} />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className={`absolute z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100 ${
                        isRTL ? 'left-0' : 'right-0'
                      }`}
                    >
                      <div className="px-3 py-2.5 border-b border-slate-100">
                        <div className="font-bold text-xs text-slate-900 truncate">{currentUser?.fullName}</div>
                        <div className="text-[11px] text-slate-500 truncate">{currentUser?.email}</div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                            {t('rolePerformer')}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (onRoleToggle) onRoleToggle('CUSTOMER');
                              toggleRole('CUSTOMER');
                            }}
                            className="text-[10px] text-brand-700 hover:underline font-semibold cursor-pointer"
                          >
                            Passer Client
                          </button>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            router.push(`/${locale}/profile`);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-brand-800 bg-brand-50/50 hover:bg-brand-50 transition cursor-pointer"
                        >
                          <FiUser className="text-brand-700 text-sm shrink-0" />
                          <span>Mon Profil Freelance & Stats</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenWallet();
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <FiDollarSign className="text-slate-400 shrink-0" />
                          <span>{t('menuWallet')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsVerificationModalOpen(true);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <FiAward className="text-slate-400 shrink-0" />
                          <span>{t('menuQualification')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            router.push(`/${locale}/admin/payouts`);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <FiShield className="text-brand-700 text-sm shrink-0" />
                          <span>Console Admin Payouts</span>
                        </button>

                        <a
                          href="mailto:contact@taches.ma?subject=Demande%20d%27assistance%20Taches.ma"
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-50 transition"
                        >
                          <FiMessageSquare className="shrink-0" />
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
                            <FiLogOut className="text-rose-500 text-sm shrink-0" />
                            <span>Se déconnecter</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Qualification / Verification Modal */}
      <QualificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onPassed={() => {
          setIsVerificationModalOpen(false);
          if (profile) {
            updateProfile({ passedQualification: true });
          }
        }}
      />
    </>
  );
};
