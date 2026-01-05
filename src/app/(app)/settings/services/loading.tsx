import { ServicesSkeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';

export default function ServicesLoading() {
  return (
    <>
      <PageHeader title="Services" />
      <ServicesSkeleton />
    </>
  );
}
