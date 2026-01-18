import { AppShell } from '@/components/app-shell';
import { getAppointments } from '@/lib/actions/appointments';
import { getZones } from '@/lib/actions/zones';
import Link from 'next/link';
import { AppointmentsCalendar } from './appointments-calendar';

export default async function AppointmentsPage() {
  // Fetch appointments for the next 30 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  const [appointments, zones] = await Promise.all([
    getAppointments({ startDate, endDate }),
    getZones(),
  ]);

  const addAppointmentButton = (
    <Link
      href="/appointments/new"
      className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
      New Appointment
    </Link>
  );

  return (
    <AppShell title="Appointments" actions={addAppointmentButton}>
      <AppointmentsCalendar appointments={appointments} zones={zones} />
    </AppShell>
  );
}
