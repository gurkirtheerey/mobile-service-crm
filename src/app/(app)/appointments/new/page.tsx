import { PageHeader } from '@/components/page-header';
import { getClients } from '@/lib/actions/clients';
import { getServices } from '@/lib/actions/services';
import { getZones } from '@/lib/actions/zones';
import { AppointmentForm } from './appointment-form';
import Link from 'next/link';

export default async function NewAppointmentPage() {
  const [clients, services, zones] = await Promise.all([
    getClients(),
    getServices({ activeOnly: true }),
    getZones(),
  ]);

  const backButton = (
    <Link
      href="/appointments"
      className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </svg>
      Back
    </Link>
  );

  // Check if we have clients and services
  const hasClients = clients.length > 0;
  const hasServices = services.length > 0;

  return (
    <>
      <PageHeader title="New Appointment" actions={backButton} />
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          {!hasClients || !hasServices ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
                Setup Required
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Before creating appointments, you need to add:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {!hasClients && (
                  <li className="flex items-center justify-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <Link href="/clients" className="text-blue-600 hover:underline dark:text-blue-400">
                      Add clients
                    </Link>
                  </li>
                )}
                {!hasServices && (
                  <li className="flex items-center justify-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <Link href="/settings/services" className="text-blue-600 hover:underline dark:text-blue-400">
                      Add services
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <AppointmentForm clients={clients} services={services} zones={zones} />
          )}
        </div>
      </div>
    </>
  );
}
