export const runtime = 'edge';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, Locale } from '@/lib/i18n/types';

export default function RootPage() {
  const cookieStore = cookies();
  const savedLocale = cookieStore.get('taches_locale')?.value as Locale | undefined;
  const target = (savedLocale && SUPPORTED_LOCALES.some(l => l.code === savedLocale)) ? savedLocale : DEFAULT_LOCALE;
  redirect(`/${target}`);
}
