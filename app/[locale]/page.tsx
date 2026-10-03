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
  const isAr = locale === 'ar';
  const baseUrl = 'https://taches.ma';

  return {
    title: isAr
      ? 'tâches.ma — أول منصة للمهام المصغرة والخدمات المستقلة في المغرب'
      : 'tâches.ma — Bourse de micro-tâches & services freelance au Maroc',
    description: isAr
      ? 'فوض مهامك في المغرب في دقيقة واحدة لآلاف المستقلين المعتمدين. تصميم، ترجمة، شوبيفاي، إكسيل. دفع آمن 100% مع ضمان Séquestre Daman.'
      : 'Déléguez vos tâches au Maroc en 1 minute à des milliers de prestataires vérifiés. Graphisme, traduction, e-commerce, saisie Excel. Paiement 100% garanti sous séquestre Daman.',
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'x-default': `${baseUrl}/fr`,
        'fr-MA': `${baseUrl}/fr`,
        'ar-MA': `${baseUrl}/ar`,
      },
    },
    openGraph: {
      title: isAr
        ? 'tâches.ma — أول منصة للمهام المصغرة والعمل الحر في المغرب'
        : 'tâches.ma — Bourse de micro-tâches & services freelance au Maroc',
      description: isAr
        ? 'فوض مهامك في المغرب في دقيقة واحدة مع دفع آمن وضمان Séquestre Daman.'
        : 'Déléguez vos tâches au Maroc en 1 minute à des prestataires vérifiés. Paiement 100% garanti sous séquestre Daman.',
      url: `${baseUrl}/${locale}`,
      siteName: 'tâches.ma',
      locale: isAr ? 'ar_MA' : 'fr_MA',
      type: 'website',
    },
  };
}

export default function LocalePage({ params }: LocalePageProps) {
  const locale = (params.locale as Locale) || 'fr';
  return <MarketplaceApp forcedLocale={locale} />;
}
