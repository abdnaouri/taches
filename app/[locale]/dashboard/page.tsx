export const runtime = 'edge';

import type { Metadata } from 'next';
import { MarketplaceApp } from '@/components/MarketplaceApp';
import { Locale } from '@/lib/i18n/types';

interface DashboardPageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: DashboardPageProps): Promise<Metadata> {
  const locale = params.locale || 'fr';
  const baseUrl = 'https://taches.ma';

  let title = 'Tableau de bord & Suivi des missions';
  let description =
    'Gérez vos missions, suivez vos gains et sécurisez vos transactions avec le séquestre Daman sur tâches.ma.';

  if (locale === 'ar') {
    title = 'لوحة التحكم';
    description = 'تابع مهامك، رصيدك، والضمان المالي Séquestre Daman على منصة tâches.ma.';
  } else if (locale === 'en') {
    title = 'Dashboard & Mission Tracking';
    description = 'Manage your tasks, track earnings, and secure transactions with Daman escrow on tâches.ma.';
  }

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/dashboard`,
      languages: {
        'x-default': `${baseUrl}/fr/dashboard`,
        'fr-MA': `${baseUrl}/fr/dashboard`,
        'ar-MA': `${baseUrl}/ar/dashboard`,
        'en-US': `${baseUrl}/en/dashboard`,
      },
    },
  };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const locale = (params.locale as Locale) || 'fr';
  return <MarketplaceApp forcedLocale={locale} viewMode="dashboard" />;
}
