import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  getClientById,
  getAppointmentsByClientId,
  zones,
} from '@/lib/mock-data';

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const client = getClientById(id);

  if (!client) {
    notFound();
  }

  const appointments = getAppointmentsByClientId(id);
  const zone = zones.find((z) => z.id === client.assignedZone);

  const editButton = (
    <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
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
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
        />
      </svg>
      Edit
    </button>
  );

  return (
    <AppShell title={client.contactInfo.name} actions={editButton}>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/clients"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
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
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Back to Clients
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Contact Information
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">
                  Name
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-white">
                  {client.contactInfo.name}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">
                  Phone
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-white">
                  {client.contactInfo.phone}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">
                  Email
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-white">
                  {client.contactInfo.email}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">
                  Preferred Contact
                </dt>
                <dd className="mt-1 capitalize text-slate-900 dark:text-white">
                  {client.contactInfo.preferredContactMethod}
                </dd>
              </div>
            </dl>
          </div>

          {/* Service Address */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Service Address
            </h2>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-900 dark:text-white">
                  {client.serviceAddress.street}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  {client.serviceAddress.city}, {client.serviceAddress.state}{' '}
                  {client.serviceAddress.zip}
                </p>
              </div>
              {zone && (
                <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: zone.color }}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {zone.name}
                  </span>
                </div>
              )}
            </div>
            {client.notes && (
              <div className="mt-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Notes:</span> {client.notes}
                </p>
              </div>
            )}
          </div>

          {/* Appointment History */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Appointment History
              </h2>
            </div>
            {appointments.length > 0 ? (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {apt.service?.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(apt.scheduledStart).toLocaleDateString()} at{' '}
                        {new Date(apt.scheduledStart).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={apt.status} />
                      <span className="font-medium text-slate-900 dark:text-white">
                        ${apt.totalPrice}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No appointments yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Summary
            </h2>
            <dl className="space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500 dark:text-slate-400">
                  Total Appointments
                </dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  {appointments.length}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500 dark:text-slate-400">
                  Total Revenue
                </dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  $
                  {appointments
                    .filter((a) => a.status === 'completed')
                    .reduce((sum, a) => sum + a.totalPrice, 0)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500 dark:text-slate-400">
                  Client Since
                </dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  {new Date(client.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Actions
            </h2>
            <div className="space-y-2">
              <button className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                <svg
                  className="h-5 w-5 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Schedule Appointment
                </span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                <svg
                  className="h-5 w-5 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Send Message
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
