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
        className={`flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-ink shadow-2xs backdrop-blur-sm transition-all hover:border-ink/30 hover:bg-white active:scale-97 ${
          isOpen ? 'ring-2 ring-lime/60 border-ink/20' : ''
        }`}
      >
        <span className="text-sm leading-none" role="img" aria-label={currentLocaleInfo.name}>
          {currentLocaleInfo.flag}
        </span>
        <span className="text-[11px] font-bold tracking-wider uppercase text-ink">
          {currentLocaleInfo.code}
        </span>
        <FiChevronDown
          className={`text-[10px] text-ink/50 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-ink' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 w-44 rounded-2xl border border-ink/10 bg-white/95 p-1.5 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${
            currentLocaleInfo.dir === 'rtl' ? 'left-0' : 'right-0'
          }`}
          role="menu"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink/40 border-b border-ink/5 mb-1 flex items-center justify-between">
            <span>{t('language')}</span>
            <FiGlobe className="text-xs text-ink/40" />
          </div>
          {locales.map((item) => {
            const isSelected = item.code === locale;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelect(item.code)}
                role="menuitem"
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-ink text-white font-bold shadow-xs'
                    : 'text-ink/80 hover:bg-ink/5 hover:text-ink'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{item.flag}</span>
                  <span className="text-xs">{item.nativeName}</span>
                </div>
                {isSelected ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-lime text-ink">
                    <FiCheck className="text-[10px]" />
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-semibold text-ink/40">
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
