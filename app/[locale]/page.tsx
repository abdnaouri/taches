export const runtime = 'edge';

import { MarketplaceApp } from '@/components/MarketplaceApp';
import { Locale } from '@/lib/i18n/types';

export default function LocalePage({ params }: { params: { locale: string } }) {
  const locale = (params.locale as Locale) || 'fr';
  return <MarketplaceApp forcedLocale={locale} />;
}
