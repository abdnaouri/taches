export const runtime = 'edge';

import type { Metadata } from 'next';
import { MarketplaceApp } from '@/components/MarketplaceApp';
import { Locale } from '@/lib/i18n/types';

interface ConceptsPageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: ConceptsPageProps): Promise<Metadata> {
  const locale = params.locale || 'fr';
  const isAr = locale === 'ar';
  const baseUrl = 'https://taches.ma';

  return {
    title: isAr
      ? 'أفكار ونماذج المهام المنجزة في المغرب | tâches.ma'
      : 'Exemples & Modèles de Missions Réalisées au Maroc | tâches.ma',
    description: isAr
      ? 'نماذج وأمثلة حقيقية لمهام منجزة في المغرب (شوبيفاي، تصميم، ترجمة، إكسيل) مع أسعار بالدرهم وإمكانية إنشاء مهمة مطابقة بنقرة واحدة.'
      : 'Découvrez des exemples réels de micro-tâches et missions freelance au Maroc avec tarifs constatés en Dirhams (MAD) et modèles prêts à dupliquer.',
    alternates: {
      canonical: `${baseUrl}/${locale}/concepts`,
      languages: {
        'x-default': `${baseUrl}/fr/concepts`,
        'fr-MA': `${baseUrl}/fr/concepts`,
        'ar-MA': `${baseUrl}/ar/concepts`,
      },
    },
    openGraph: {
      title: isAr ? 'نماذج وأمثلة المهام المنجزة بالمغرب | tâches.ma' : 'Exemples & Modèles de Missions au Maroc | tâches.ma',
      description: isAr
        ? 'استلهم من مشاريع منجزة وأنشئ مهمتك بضغطة زر مع ضمان Daman.'
        : 'Inspirez-vous de projets réels et dupliquez votre mission en 1 clic.',
      url: `${baseUrl}/${locale}/concepts`,
      siteName: 'tâches.ma',
      locale: isAr ? 'ar_MA' : 'fr_MA',
      type: 'website',
    },
  };
}

export default function ConceptsPage({ params }: ConceptsPageProps) {
  const locale = (params.locale as Locale) || 'fr';
  return <MarketplaceApp forcedLocale={locale} viewMode="concepts" />;
}
