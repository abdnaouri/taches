'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { FiCheckCircle, FiClock, FiMapPin, FiStar, FiShield } from 'react-icons/fi';

interface LiveEvent {
  id: string;
  type: 'completed' | 'match' | 'paid';
  city: string;
  taskTitle: string;
  priceDH: number;
  userName: string;
  timeAgo: string;
}

const LIVE_EVENTS: LiveEvent[] = [
  {
    id: '1',
    type: 'paid',
    city: 'Casablanca (Maârif)',
    taskTitle: 'Logo & Carte de visite restaurant',
    priceDH: 150,
    userName: 'Yassine M.',
    timeAgo: 'Il y a 2 min',
  },
  {
    id: '2',
    type: 'completed',
    city: 'Rabat (Agdal)',
    taskTitle: 'Saisie de 80 factures sous Excel',
    priceDH: 90,
    userName: 'Salma K.',
    timeAgo: 'Il y a 5 min',
  },
  {
    id: '3',
    type: 'match',
    city: 'Tanger',
    taskTitle: 'Configuration boutique YouCan Shop',
    priceDH: 250,
    userName: 'Amine B.',
    timeAgo: 'Il y a 7 min',
  },
  {
    id: '4',
    type: 'paid',
    city: 'Marrakech (Guéliz)',
    taskTitle: 'Montage 3 vidéos TikTok & Reels',
    priceDH: 140,
    userName: 'Karim T.',
    timeAgo: 'Il y a 11 min',
  },
  {
    id: '5',
    type: 'completed',
    city: 'Fès',
    taskTitle: 'Traduction contrat de bail Arabe ↔ Français',
    priceDH: 110,
    userName: 'Fatima Z.',
    timeAgo: 'Il y a 16 min',
  },
  {
    id: '6',
    type: 'paid',
    city: 'Agadir',
    taskTitle: 'Appel en Darija de 10 grossistes',
    priceDH: 100,
    userName: 'Rachid E.',
    timeAgo: 'Il y a 22 min',
  },
];

export const MoroccanLiveActivityTicker: React.FC = () => {
  const { locale, isRTL } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % LIVE_EVENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const event = LIVE_EVENTS[currentIdx];

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 py-2.5 px-4 text-xs">
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-3 overflow-hidden">
        
        {/* Left Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-extrabold text-white text-[11px] uppercase tracking-wider hidden sm:inline">
            🇲🇦 {locale === 'ar' ? 'نشاط مباشر بالدرهم' : 'En direct au Maroc'} :
          </span>
        </div>

        {/* Sliding Event Content */}
        <div className="flex-1 flex items-center gap-2 overflow-hidden justify-center sm:justify-start">
          <div key={event.id} className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <FiCheckCircle className="text-xs" />
              <span>{event.userName}</span>
            </span>
            <span className="text-slate-400 hidden md:inline">({event.city})</span>
            <span className="text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
              a validé « {event.taskTitle} »
            </span>
            <span className="font-black text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2 py-0.2 rounded text-[11px] shrink-0">
              +{event.priceDH} DH
            </span>
          </div>
        </div>

        {/* Right Timestamp / Protection Guarantee */}
        <div className="shrink-0 flex items-center gap-2 text-[11px] text-slate-400">
          <span className="hidden lg:inline flex items-center gap-1 text-emerald-400 font-semibold">
            <FiShield /> 100% Séquestre Daman
          </span>
          <span className="text-slate-500 hidden lg:inline">•</span>
          <span className="text-slate-400 font-mono">{event.timeAgo}</span>
        </div>

      </div>
    </div>
  );
};
