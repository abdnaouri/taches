import React from 'react';
import { AdminPayoutsDashboard } from '@/components/AdminPayoutsDashboard';
import { Locale } from '@/lib/i18n/types';

export default function AdminPayoutsPage({
  params,
}: {
  params: { locale: string };
}) {
  return <AdminPayoutsDashboard />;
}
