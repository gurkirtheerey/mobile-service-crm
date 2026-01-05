import { PageHeader } from '@/components/page-header';
import { StatsCard } from '@/components/ui/stats-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { getDashboardStats, getTodaySchedule } from '@/lib/actions/dashboard';
import { getZones } from '@/lib/actions/zones';
import Link from 'next/link';

export default async function DashboardPage() {
  const [stats, todayAppointments, zones] = await Promise.all([
    getDashboardStats(),
    getTodaySchedule(),
    getZones(),
  ]);

  const completedToday = todayAppointments.filter(
    (a) => a.status === 'completed'
  ).length;

  return (
    <>
      <PageHeader title="Dashboard" />
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Clients"
          value={stats.totalClients}
          icon={
            <svg
              className="h-5 w-5 text-slate-600 dark:text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          }
        />
        <StatsCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          subtitle={`${completedToday} completed`}
          icon={
            <svg
              className="h-5 w-5 text-slate-600 dark:text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
          }
        />
        <StatsCard
          title="Week Revenue"
          value={`$${stats.weekRevenue.toLocaleString()}`}
          icon={
            <svg
              className="h-5 w-5 text-slate-600 dark:text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={
            <svg
              className="h-5 w-5 text-slate-600 dark:text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Today&apos;s Schedule
              </h2>
              <Link
                href="/appointments"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => {
                  const client = appointment.client as { id: string; name: string } | null;
                  const service = appointment.service as { id: string; name: string } | null;
                  const zone = appointment.zone as { id: string; name: string; color: string } | null;

                  return (
                    <div
                      key={appointment.id}
                      className="flex items-center gap-4 px-6 py-4"
                    >
                      <div
                        className="h-10 w-1 rounded-full"
                        style={{
                          backgroundColor: zone?.color || '#6B7280',
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {client?.name || 'Unknown Client'}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {service?.name || 'Service'} &middot;{' '}
                          {new Date(appointment.scheduled_start).toLocaleTimeString(
                            [],
                            { hour: '2-digit', minute: '2-digit' }
                          )}
                        </p>
                      </div>
                      <StatusBadge status={appointment.status} />
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        ${Number(appointment.total_price).toFixed(0)}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No appointments scheduled for today
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Zones */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                href="/clients/new"
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
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
                    d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                  />
                </svg>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Add New Client
                </span>
              </Link>
              <Link
                href="/appointments/new"
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
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
              </Link>
            </div>
          </div>

          {/* Zones Overview */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Zones
              </h2>
              <Link
                href="/settings/zones"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Manage
              </Link>
            </div>
            <div className="space-y-3">
              {zones.length > 0 ? (
                zones.slice(0, 4).map((zone) => (
                  <div key={zone.id} className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: zone.color }}
                    />
                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                      {zone.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {zone.assigned_days
                        .map((d) =>
                          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]
                        )
                        .join(', ')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No zones configured
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
