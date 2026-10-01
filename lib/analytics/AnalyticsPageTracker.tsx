'use client';

/**
 * ============================================================
 * tâches.ma — Route-level Page View Tracker
 * ============================================================
 *
 * Fires GA4 page_view on every Next.js App Router navigation.
 * Place inside any layout that wraps authenticated routes.
 *
 * This is a Client Component — it uses usePathname() + useSearchParams()
 * to detect route changes and fires page_view automatically.
 */

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { trackPageView } from './dataLayer';
import { useAuth } from '@/lib/auth/AuthContext';

/**
 * Maps URL path patterns to GA4 content_group values.
 * Used for audience segmentation in GA4 reports.
 */
function getContentGroup(path: string): string {
  if (path === '/' || path.match(/^\/[a-z]{2}\/?$/)) return 'homepage';
  if (path.includes('/tasks/new') || path.includes('/task/new')) return 'create_task';
  if (path.includes('/task/')) return 'task_detail';
  if (path.includes('/tasks')) return 'task_list';
  if (path.includes('/wallet')) return 'wallet';
  if (path.includes('/profile')) return 'profile';
  if (path.includes('/admin')) return 'admin';
  if (path.includes('/checkout')) return 'checkout';
  if (path.includes('/concepts')) return 'concepts';
  if (path.includes('/daman')) return 'daman_landing';
  if (path.includes('/freelance-maroc')) return 'seo_landing';
  if (path.includes('/services')) return 'service_detail';
  if (path.includes('/privacy')) return 'legal';
  if (path.includes('/terms')) return 'legal';
  return 'other';
}

/**
 * Derives a human-readable page title from path + content group.
 */
function derivePageTitle(path: string, contentGroup: string): string {
  const titles: Record<string, string> = {
    homepage: 'tâches.ma — Marketplace Freelance Maroc',
    create_task: 'Publier une Tâche — tâches.ma',
    task_detail: 'Détail de la Tâche — tâches.ma',
    task_list: 'Parcourir les Tâches — tâches.ma',
    wallet: 'Mon Portefeuille — tâches.ma',
    profile: 'Mon Profil — tâches.ma',
    admin: 'Administration — tâches.ma',
    checkout: 'Paiement — tâches.ma',
    concepts: 'Comment ça Marche — tâches.ma',
    daman_landing: 'Garantie Daman — tâches.ma',
    seo_landing: 'Freelance Maroc — tâches.ma',
    service_detail: 'Service Freelance — tâches.ma',
    legal: 'Mentions Légales — tâches.ma',
    other: 'tâches.ma',
  };

  // Use browser title if available
  if (typeof document !== 'undefined' && document.title) {
    return document.title;
  }

  return titles[contentGroup] || 'tâches.ma';
}

/**
 * Extracts locale from path (/fr/..., /ar/..., etc.)
 */
function extractLocale(path: string): string {
  const match = path.match(/^\/([a-z]{2})\//);
  return match ? match[1] : 'fr';
}

// ─── Component ────────────────────────────────────────────────────────────

export function AnalyticsPageTracker(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const { profile } = useAuth();
  const lastTrackedPath = useRef<string>('');

  useEffect(() => {
    const fullPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    // Avoid duplicate page_view on same path
    if (fullPath === lastTrackedPath.current) return;
    lastTrackedPath.current = fullPath;

    const contentGroup = getContentGroup(pathname || '');
    const title = derivePageTitle(pathname || '', contentGroup);
    const detectedLocale = extractLocale(pathname || '') || locale;

    // Small delay to let Next.js update document.title first
    const timer = setTimeout(() => {
      trackPageView({
        title: typeof document !== 'undefined' ? document.title || title : title,
        path: pathname || '/',
        locale: detectedLocale,
        contentGroup,
        userId: profile?.id,
        userRole: profile?.activeRole,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, searchParams, locale, profile?.id, profile?.activeRole]);

  return null;
}
