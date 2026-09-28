import { MarketplaceApp } from '@/components/MarketplaceApp';
import { Locale } from '@/lib/i18n/types';

export default function TaskSlugPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const locale = (params.locale as Locale) || 'fr';
  const slug = params.slug;

  return <MarketplaceApp forcedLocale={locale} initialSlug={slug} viewMode="tasks" />;
}

