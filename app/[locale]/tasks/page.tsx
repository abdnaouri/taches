export const runtime = 'edge';

import type { Metadata } from 'next';
import { MarketplaceApp } from '@/components/MarketplaceApp';
import { Locale } from '@/lib/i18n/types';

interface TasksPageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: TasksPageProps): Promise<Metadata> {
  const locale = params.locale || 'fr';
  const baseUrl = 'https://taches.ma';

  let title = 'Missions & Tâches Freelance au Maroc — Offres en cours';
  let description =
    'Explorez des centaines d’offres de micro-tâches et services freelance au Maroc. Postulez en direct et recevez vos paiements garantis sous séquestre Daman.';
  let ogTitle = 'Missions Freelance & Micro-Tâches au Maroc | tâches.ma';
  let ogDescription = 'Trouvez des missions freelance et micro-tâches rémunérées partout au Maroc.';
  let ogLocale = 'fr_MA';

  if (locale === 'ar') {
    title = 'سوق المهام والخدمات المستقلة في المغرب';
    description =
      'استكشف مئات المهام اليومية والخدمات المستقلة المتاحة في المغرب. اكسب دخلاً من مهاراتك مع ضمان الدفع Séquestre Daman.';
    ogTitle = 'سوق المهام والخدمات في المغرب | tâches.ma';
    ogDescription = 'مهام وفرص عمل حر في الدار البيضاء، الرباط، مراكش وجميع أنحاء المغرب.';
    ogLocale = 'ar_MA';
  } else if (locale === 'en') {
    title = 'Freelance Missions & Tasks in Morocco — Open Gigs';
    description =
      'Explore hundreds of micro-tasks and freelance opportunities across Morocco. Apply directly and get guaranteed escrow payments via Daman.';
    ogTitle = 'Freelance Missions & Micro-Tasks in Morocco | tâches.ma';
    ogDescription = 'Find paid freelance missions and micro-tasks across Casablanca, Rabat, Marrakech, and all Morocco.';
    ogLocale = 'en_US';
  }

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/tasks`,
      languages: {
        'x-default': `${baseUrl}/fr/tasks`,
        'fr-MA': `${baseUrl}/fr/tasks`,
        'ar-MA': `${baseUrl}/ar/tasks`,
        'en-US': `${baseUrl}/en/tasks`,
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: `${baseUrl}/${locale}/tasks`,
      siteName: 'tâches.ma',
      locale: ogLocale,
      type: 'website',
    },
  };
}

export default function TasksPage({ params }: TasksPageProps) {
  const locale = (params.locale as Locale) || 'fr';
  return <MarketplaceApp forcedLocale={locale} viewMode="tasks" />;
}
