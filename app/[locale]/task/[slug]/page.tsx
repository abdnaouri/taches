export const runtime = 'edge';

import type { Metadata } from 'next';
import { TaskWorkspacePage } from '@/components/TaskWorkspacePage';
import { Locale } from '@/lib/i18n/types';

interface TaskSlugPageProps {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params }: TaskSlugPageProps): Promise<Metadata> {
  const locale = params.locale || 'fr';
  const slug = params.slug || '';
  const baseUrl = 'https://taches.ma';

  // Extract clean title from slug by removing trailing ID
  const parts = decodeURIComponent(slug).split('-');
  let rawTitle = slug;
  if (parts.length > 1) {
    parts.pop();
    rawTitle = parts.join(' ');
  }
  const cleanTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

  let title = `${cleanTitle} — Mission Freelance Maroc`;
  let description =
    'Consultez cette mission freelance sur tâches.ma au Maroc. Postulez en direct, réalisez la mission et recevez votre paiement garanti sous séquestre Daman.';
  let ogLocale = 'fr_MA';

  if (locale === 'ar') {
    title = `${cleanTitle} — مهمة عمل حر في المغرب`;
    description =
      'اطلع على تفاصيل هذه المهمة في المغرب على منصة tâches.ma. قدّم عرضك واكسب دخلك مع ضمان الدفع Séquestre Daman.';
    ogLocale = 'ar_MA';
  } else if (locale === 'en') {
    title = `${cleanTitle} — Freelance Mission in Morocco`;
    description =
      'View this freelance mission in Morocco on tâches.ma. Apply directly, deliver work, and get paid securely with Daman escrow guarantee.';
    ogLocale = 'en_US';
  }

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/task/${slug}`,
      languages: {
        'x-default': `${baseUrl}/fr/task/${slug}`,
        'fr-MA': `${baseUrl}/fr/task/${slug}`,
        'ar-MA': `${baseUrl}/ar/task/${slug}`,
        'en-US': `${baseUrl}/en/task/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/task/${slug}`,
      siteName: 'tâches.ma',
      locale: ogLocale,
      type: 'website',
    },
  };
}

export default function TaskSlugPage({ params }: TaskSlugPageProps) {
  const locale = (params.locale as Locale) || 'fr';
  const slug = params.slug;

  return <TaskWorkspacePage slug={slug} forcedLocale={locale} />;
}

