import { DashboardSkeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';

export default function DashboardLoading() {
  return (
    <>
      <PageHeader title="Dashboard" />
      <DashboardSkeleton />
    </>
  );
}
