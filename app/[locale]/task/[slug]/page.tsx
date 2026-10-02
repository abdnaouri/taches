export const runtime = 'edge';

import { TaskWorkspacePage } from '@/components/TaskWorkspacePage';
import { Locale } from '@/lib/i18n/types';

export default function TaskSlugPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const locale = (params.locale as Locale) || 'fr';
  const slug = params.slug;

  return <TaskWorkspacePage slug={slug} forcedLocale={locale} />;
}

