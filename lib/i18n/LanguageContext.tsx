'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Locale, LocaleInfo, SUPPORTED_LOCALES, DEFAULT_LOCALE } from './types';
import { fr, Translations } from './locales/fr';
import { ar } from './locales/ar';
import { en } from './locales/en';
import { es } from './locales/es';
import { ru } from './locales/ru';

const dictionaries: Record<Locale, Translations> = {
  fr,
  ar,
  en,
  es,
  ru,
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  locales: LocaleInfo[];
  currentLocaleInfo: LocaleInfo;
  getCategoryLabel: (categoryId: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'taches_locale';

function LanguageProviderInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determine initial locale from URL pathname if present
  const getLocaleFromPath = (path?: string | null): Locale => {
    if (!path) return DEFAULT_LOCALE;
    const firstSegment = path.split('/')[1] as Locale;
    if (['fr', 'ar', 'en', 'es', 'ru'].includes(firstSegment)) {
      return firstSegment;
    }
    return DEFAULT_LOCALE;
  };

  const [locale, setLocaleState] = useState<Locale>(() => {
    return getLocaleFromPath(pathname);
  });

  // Sync state when URL pathname changes
  useEffect(() => {
    if (pathname) {
      const pathLocale = getLocaleFromPath(pathname);
      if (pathLocale && pathLocale !== locale) {
        setLocaleState(pathLocale);
        try {
          localStorage.setItem(STORAGE_KEY, pathLocale);
        } catch {}
      }
    }
  }, [pathname]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.cookie = `${STORAGE_KEY}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}

    if (pathname) {
      const segments = pathname.split('/');
      if (SUPPORTED_LOCALES.some(l => l.code === segments[1])) {
        segments[1] = newLocale;
      } else {
        segments.splice(1, 0, newLocale);
      }
      const newPath = segments.join('/') || `/${newLocale}`;
      const query = searchParams?.toString() ? `?${searchParams.toString()}` : '';
      router.push(`${newPath}${query}`, { scroll: false });
    }
  };

  const isRTL = locale === 'ar';
  const dir: 'ltr' | 'rtl' = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = dir;
      if (isRTL) {
        document.documentElement.classList.add('rtl-mode');
      } else {
        document.documentElement.classList.remove('rtl-mode');
      }
    }
  }, [locale, dir, isRTL]);

  const currentLocaleInfo = useMemo(() => {
    return SUPPORTED_LOCALES.find(l => l.code === locale) || SUPPORTED_LOCALES[0];
  }, [locale]);

  const t = (key: keyof Translations, params?: Record<string, string | number>): string => {
    const dict = dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
    let text = dict[key] ?? dictionaries[DEFAULT_LOCALE][key] ?? (key as string);

    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      });
    }

    return text;
  };

  const getCategoryLabel = (categoryId: string): string => {
    switch (categoryId) {
      case 'development':
        return t('catDevelopment');
      case 'design':
        return t('catDesign');
      case 'assistance':
        return t('catAssistance');
      case 'copywriting':
        return t('catCopywriting');
      case 'marketing':
        return t('catMarketing');
      case 'micro':
        return t('catMicro');
      case 'all':
      default:
        return t('catAll');
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
        dir,
        isRTL,
        locales: SUPPORTED_LOCALES,
        currentLocaleInfo,
        getCategoryLabel,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={null}>
      <LanguageProviderInner>{children}</LanguageProviderInner>
    </Suspense>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
