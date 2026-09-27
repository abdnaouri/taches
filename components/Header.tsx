'use client';

import React from 'react';
import { UserProfile, UserRole } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { 
  FiBriefcase, 
  FiZap, 
  FiLock, 
  FiPlus, 
  FiClock,
  FiDatabase
} from 'react-icons/fi';

interface HeaderProps {
  user: UserProfile;
  onRoleToggle: (role: UserRole) => void;
  onOpenCreateTask: () => void;
  onOpenWallet: () => void;
  onOpenQualification: () => void;
  onViewMyWork: () => void;
  activeTab: 'explore' | 'my-tasks';
  setActiveTab: (tab: 'explore' | 'my-tasks') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onRoleToggle,
  onOpenCreateTask,
  onOpenWallet,
  onOpenQualification,
  onViewMyWork,
  activeTab,
  setActiveTab
}) => {
  const { t, isRTL } = useLanguage();
  const isCustomer = user.activeRole === 'CUSTOMER';

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: Brand + Feed Switcher + Supabase Badge */}
        <div className="flex items-center gap-3 sm:gap-6">
          <a href="#" className="font-display text-2xl font-bold tracking-tight text-ink flex items-center">
            tâches<span className="text-lime-500 font-extrabold text-3xl leading-none">.</span>
          </a>

          {/* Supabase Dynamic Connection Pill */}
          <div 
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 shadow-2xs"
            title="Supabase API & Storage Dynamique (vzrmunzfkftydvgmylvu)"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <FiDatabase className="text-[10px]" />
            <span>Supabase</span>
          </div>

          {/* Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 rounded-full bg-ink/5 p-1 border border-ink/5">
            <button
              onClick={() => setActiveTab('explore')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'explore'
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-ink/70 hover:text-ink'
              }`}
            >
              {t('navExplore')}
            </button>
            <button
              onClick={() => setActiveTab('my-tasks')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'my-tasks'
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-ink/70 hover:text-ink'
              }`}
            >
              <span>{isCustomer ? t('navMyOrders') : t('navMyMissions')}</span>
              <span className="rounded-full bg-lime px-1.5 py-0.2 text-[10px] font-bold text-ink">
                {isCustomer ? '2' : '1'}
              </span>
            </button>
          </nav>
        </div>

        {/* Center: 1-Click Role Switcher (UNU.im Inspired) */}
        <div className="flex items-center bg-white/80 p-1 rounded-full border border-ink/10 shadow-xs">
          <button
            onClick={() => onRoleToggle('CUSTOMER')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              isCustomer
                ? 'bg-ink text-lime shadow-sm'
                : 'text-ink/60 hover:text-ink'
            }`}
            title={t('roleCustomerTooltip')}
          >
            <FiBriefcase className="text-xs" />
            <span className="hidden sm:inline">{t('roleCustomer')}</span>
          </button>

          <button
            onClick={() => onRoleToggle('PERFORMER')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              !isCustomer
                ? 'bg-lime text-ink shadow-sm'
                : 'text-ink/60 hover:text-ink'
            }`}
            title={t('rolePerformerTooltip')}
          >
            <FiZap className="text-xs" />
            <span className="hidden sm:inline">{t('rolePerformer')}</span>
          </button>
        </div>

        {/* Right: Language Selector + Wallet + Level Pill + CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector Component */}
          <LanguageSelector />

          {/* Performer Level Pill (UNU Gamification) */}
          {!isCustomer && (
            <button
              onClick={onOpenQualification}
              className="hidden lg:flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-xs font-medium text-ink transition hover:border-ink/25"
              title={t('levelPillTitle')}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime text-ink font-bold text-[10px]">
                3
              </span>
              <div className={`${isRTL ? 'text-right' : 'text-left'} leading-none`}>
                <div className="font-semibold text-[11px]">{t('levelPro')}</div>
                <div className="text-[9px] text-ink/60">{t('feeDiscount')}</div>
              </div>
            </button>
          )}

          {/* Interactive Escrow Wallet Widget */}
          <button
            onClick={onOpenWallet}
            className="flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3.5 py-1.5 text-xs transition hover:border-ink/30 hover:shadow-xs"
            title={t('walletOpenTooltip')}
          >
            <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'} leading-none`}>
              <span className="text-[10px] text-ink/50 uppercase tracking-wider font-semibold">{t('balanceLabel')}</span>
              <span className="font-bold text-ink text-sm">€{user.balanceAvailable.toFixed(2)}</span>
            </div>
            {user.balanceEscrow > 0 && (
              <div className={`flex items-center gap-1 ${isRTL ? 'pr-2 border-r' : 'pl-2 border-l'} border-ink/10 text-ink/70`}>
                <FiLock className="text-amber-500 text-[11px]" />
                <span className="text-[11px] font-medium" title={t('escrowLockedTooltip')}>€{user.balanceEscrow.toFixed(2)}</span>
              </div>
            )}
          </button>

          {/* Main Action Button */}
          {isCustomer ? (
            <button
              onClick={onOpenCreateTask}
              className="group flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-ink/90 active:scale-95"
            >
              <FiPlus className="text-sm text-lime" />
              <span>{t('btnPostTask')}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('my-tasks')}
              className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-lime shadow-xs transition hover:bg-ink/90"
            >
              <FiClock className="text-sm" />
              <span className="hidden sm:inline">1 {t('btnInProgress')}</span>
            </button>
          )}

          {/* User Avatar */}
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="h-8 w-8 rounded-full border border-ink/20 object-cover ring-2 ring-lime/40"
            />
            <span className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-cream`} />
          </div>
        </div>
      </div>
    </header>
  );
};
