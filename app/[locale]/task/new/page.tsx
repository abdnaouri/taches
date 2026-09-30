export const runtime = 'edge';

import { CreateTaskStandalonePage } from '@/components/CreateTaskStandalonePage';

export default function NewTaskPage({
  params,
}: {
  params: { locale: string };
}) {
  return <CreateTaskStandalonePage />;
}
