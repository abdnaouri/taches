'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  FiHome,
  FiSearch,
  FiPlusCircle,
  FiMessageSquare,
  FiCreditCard,
  FiUser,
} from 'react-icons/fi';

interface MobileBottomNavProps {
  onOpenCreateTask?: () => void;
  onOpenChat?: () => void;
  unreadMessagesCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenCreateTask,
  onOpenChat,
  unreadMessagesCount = 0,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, isRTL } = useLanguage();
  const { isAuthenticated, profile, openAuthModal } = useAuth();

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const isTasks = pathname?.includes('/tasks') && !pathname?.includes('/tasks/new');
  const isWallet = pathname?.includes('/wallet');
  const isProfile = pathname?.includes('/profile');
  const isNewTask = pathname?.includes('/tasks/new') || pathname?.includes('/task/new');

  const handleCreate = () => {
    if (onOpenCreateTask) {
      onOpenCreateTask();
    } else {
      router.push(`/${locale}/tasks/new`);
    }
  };

  const handleWalletOrProfile = () => {
    if (!isAuthenticated) {
      openAuthModal('login', 'Connectez-vous pour accéder à votre portefeuille');
      return;
    }
    router.push(`/${locale}/wallet`);
  };

  const handleChat = () => {
    if (onOpenChat) {
      onOpenChat();
    } else {
      router.push(`/${locale}/tasks?tab=open`);
    }
  };

  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden transition-transform duration-200"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto pb-safe">
        
        {/* 1. ACCUEIL */}
        <button
          onClick={() => router.push(`/${locale}`)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isHome ? 'text-brand-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FiHome className={`text-xl ${isHome ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {locale === 'ar' ? 'الرئيسية' : 'Accueil'}
          </span>
        </button>

        {/* 2. EXPLORER TÂCHES */}
        <button
          onClick={() => router.push(`/${locale}/tasks`)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isTasks ? 'text-brand-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FiSearch className={`text-xl ${isTasks ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {locale === 'ar' ? 'المهام' : 'Explorer'}
          </span>
        </button>

        {/* 3. BOUTON CENTRAL : + PUBLIER UNE TÂCHE */}
        <button
          onClick={handleCreate}
          className="flex flex-col items-center justify-center flex-1 -mt-4 group cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-brand-700 to-brand-600 text-white shadow-lg shadow-brand-700/30 group-active:scale-95 transition-transform">
            <FiPlusCircle className="text-2xl" />
          </div>
          <span className="text-[10px] font-extrabold text-brand-700 mt-1">
            {locale === 'ar' ? 'نشر مهمة' : 'Publier'}
          </span>
        </button>

        {/* 4. MESSAGES / CHAT */}
        <button
          onClick={handleChat}
          className="relative flex flex-col items-center justify-center flex-1 py-1 transition-colors text-slate-500 hover:text-slate-800"
        >
          <div className="relative">
            <FiMessageSquare className="text-xl stroke-2" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {locale === 'ar' ? 'الرسائل' : 'Chat'}
          </span>
        </button>

        {/* 5. PORTEFEUILLE */}
        <button
          onClick={handleWalletOrProfile}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isWallet || isProfile ? 'text-brand-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FiCreditCard className={`text-xl ${isWallet || isProfile ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {locale === 'ar' ? 'المحفظة' : 'Solde'}
          </span>
        </button>

      </div>
    </nav>
  );
};
