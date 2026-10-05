export const runtime = 'edge';

import { redirect } from 'next/navigation';

export default function RootDashboardPage() {
  redirect('/fr/dashboard');
}
