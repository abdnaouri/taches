'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Locale } from '@/lib/i18n/types';
import { FiGlobe, FiChevronDown, FiCheck } from 'react-icons/fi';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'header' | 'footer' | 'compact';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { locale, setLocale, locales, currentLocaleInfo, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={t('language')}
        className={`flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-400 cursor-pointer ${
          isOpen ? 'ring-2 ring-brand-600/30 border-brand-600' : ''
        }`}
      >
        <span className="text-sm leading-none" role="img" aria-label={currentLocaleInfo.name}>
          {currentLocaleInfo.flag}
        </span>
        <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-800">
          {currentLocaleInfo.code}
        </span>
        <FiChevronDown
          className={`text-[11px] text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-slate-800' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100 ${
            currentLocaleInfo.dir === 'rtl' ? 'left-0' : 'right-0'
          }`}
          role="menu"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
            <span>{t('language')}</span>
            <FiGlobe className="text-xs text-slate-400" />
          </div>
          {locales.map((item) => {
            const isSelected = item.code === locale;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelect(item.code)}
                role="menuitem"
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{item.flag}</span>
                  <span>{item.nativeName}</span>
                </div>
                {isSelected ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-brand-700">
                    <FiCheck className="text-[10px] font-black" />
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {item.code}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
