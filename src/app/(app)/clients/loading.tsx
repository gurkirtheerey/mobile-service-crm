import { ClientsSkeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';

export default function ClientsLoading() {
  return (
    <>
      <PageHeader title="Clients" />
      <ClientsSkeleton />
    </>
  );
}
