import { AppointmentsSkeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';

export default function AppointmentsLoading() {
  return (
    <>
      <PageHeader title="Appointments" />
      <AppointmentsSkeleton />
    </>
  );
}
