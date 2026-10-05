export const runtime = 'edge';

import type { Metadata } from 'next';
import { MarketplaceApp } from '@/components/MarketplaceApp';
import { Locale } from '@/lib/i18n/types';

interface LocalePageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const locale = params.locale || 'fr';
  const baseUrl = 'https://taches.ma';

  let title = 'tâches.ma — Bourse de micro-tâches & services freelance au Maroc';
  let description =
    'Déléguez vos tâches au Maroc en 1 minute à des milliers de prestataires vérifiés. Graphisme, traduction, e-commerce, saisie Excel. Paiement 100% garanti sous séquestre Daman.';
  let ogLocale = 'fr_MA';

  if (locale === 'ar') {
    title = 'tâches.ma — أول منصة للمهام المصغرة والخدمات المستقلة في المغرب';
    description =
      'فوض مهامك في المغرب في دقيقة واحدة لآلاف المستقلين المعتمدين. تصميم، ترجمة، شوبيفاي، إكسيل. دفع آمن 100% مع ضمان Séquestre Daman.';
    ogLocale = 'ar_MA';
  } else if (locale === 'en') {
    title = 'tâches.ma — Micro-tasks & Freelance Marketplace in Morocco';
    description =
      'Delegate your tasks in Morocco in 1 minute to thousands of verified freelancers. Design, translation, e-commerce, Excel entry. 100% secure escrow payment with Daman Guarantee.';
    ogLocale = 'en_US';
  }

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'x-default': `${baseUrl}/fr`,
        'fr-MA': `${baseUrl}/fr`,
        'ar-MA': `${baseUrl}/ar`,
        'en-US': `${baseUrl}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}`,
      siteName: 'tâches.ma',
      locale: ogLocale,
      type: 'website',
    },
  };
}

export default function LocalePage({ params }: LocalePageProps) {
  const locale = (params.locale as Locale) || 'fr';
  return <MarketplaceApp forcedLocale={locale} />;
}
