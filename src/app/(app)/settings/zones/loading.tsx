import { ZonesSkeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';

export default function ZonesLoading() {
  return (
    <>
      <PageHeader title="Zones" />
      <ZonesSkeleton />
    </>
  );
}
