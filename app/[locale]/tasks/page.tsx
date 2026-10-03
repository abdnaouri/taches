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
  const isAr = locale === 'ar';
  const baseUrl = 'https://taches.ma';

  return {
    title: isAr
      ? 'سوق المهام والخدمات المستقلة في المغرب | tâches.ma'
      : 'Missions & Tâches Freelance au Maroc — Offres en cours | tâches.ma',
    description: isAr
      ? 'استكشف مئات المهام اليومية والخدمات المستقلة المتاحة في المغرب. اكسب دخلاً من مهاراتك مع ضمان الدفع Séquestre Daman.'
      : 'Explorez des centaines d’offres de micro-tâches et services freelance au Maroc. Postulez en direct et recevez vos paiements garantis sous séquestre Daman.',
    alternates: {
      canonical: `${baseUrl}/${locale}/tasks`,
      languages: {
        'x-default': `${baseUrl}/fr/tasks`,
        'fr-MA': `${baseUrl}/fr/tasks`,
        'ar-MA': `${baseUrl}/ar/tasks`,
      },
    },
    openGraph: {
      title: isAr ? 'سوق المهام والخدمات في المغرب | tâches.ma' : 'Missions Freelance & Micro-Tâches au Maroc | tâches.ma',
      description: isAr
        ? 'مهام وفرص عمل حر في الدار البيضاء، الرباط، مراكش وجميع أنحاء المغرب.'
        : 'Trouvez des missions freelance et micro-tâches rémunérées partout au Maroc.',
      url: `${baseUrl}/${locale}/tasks`,
      siteName: 'tâches.ma',
      locale: isAr ? 'ar_MA' : 'fr_MA',
      type: 'website',
    },
  };
}

export default function TasksPage({ params }: TasksPageProps) {
  const locale = (params.locale as Locale) || 'fr';
  return <MarketplaceApp forcedLocale={locale} viewMode="tasks" />;
}
