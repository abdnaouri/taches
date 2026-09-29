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
  createdAt?: string;
}

export const MoroccanLiveActivityTicker: React.FC = () => {
  const { locale, isRTL } = useLanguage();
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    fetch('/api/activity')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.items && data.items.length > 0) {
          setEvents(data.items);
        }
      })
      .catch(err => console.warn('Activity fetch error:', err));
  }, []);

  useEffect(() => {
    if (events.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % events.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [events.length]);

  const event = events[currentIdx] || {
    id: 'default',
    type: 'paid',
    city: 'Casablanca',
    taskTitle: 'Plateforme en direct 24/7',
    priceDH: 250,
    userName: 'Freelance certifié',
  };

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

        {/* Dynamic Center Event */}
        <div className="flex-1 truncate flex items-center gap-2 transition-all duration-300">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase shrink-0 ${
              event.type === 'completed'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : event.type === 'paid'
                ? 'bg-brand-950 text-brand-300 border border-brand-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}
          >
            {event.type === 'completed' && <FiCheckCircle className="text-emerald-400" />}
            {event.type === 'paid' && <FiShield className="text-brand-300" />}
            {event.type === 'match' && <FiClock className="text-amber-300" />}
            <span>
              {event.type === 'completed'
                ? locale === 'ar' ? 'تم التسليم' : 'Mission livrée'
                : event.type === 'paid'
                ? locale === 'ar' ? 'دفع مؤمن' : 'Paiement garanti'
                : locale === 'ar' ? 'قيد التنفيذ' : 'En cours'}
            </span>
          </span>

          <span className="text-slate-300 truncate font-semibold">
            {event.taskTitle}
          </span>

          <span className="font-extrabold text-white bg-slate-800 px-2 py-0.5 rounded text-[11px] shrink-0 border border-slate-700">
            {event.priceDH} DH
          </span>

          <span className="text-slate-400 text-[11px] hidden md:inline shrink-0 flex items-center gap-1">
            <FiMapPin className="text-[10px]" />
            {event.city}
          </span>

          <span className="text-slate-400 text-[11px] hidden lg:inline shrink-0">
            • {event.userName}
          </span>
        </div>

        {/* Right Guarantee Pill */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 text-slate-300 text-[11px] font-bold">
          <FiShield className="text-emerald-400" />
          <span>{locale === 'ar' ? 'ضمان الأداء 100%' : 'Garantie Daman 100%'}</span>
        </div>

      </div>
    </div>
  );
};
