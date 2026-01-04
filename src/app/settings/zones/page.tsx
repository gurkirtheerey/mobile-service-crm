import { AppShell } from '@/components/app-shell';
import { zones, clients, appointments } from '@/lib/mock-data';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ZonesPage() {
  const addZoneButton = (
    <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
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
      Add Zone
    </button>
  );

  return (
    <AppShell title="Zones" actions={addZoneButton}>
      {/* Info Banner */}
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Zone-Based Scheduling
            </p>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              Zones help you cluster appointments geographically to reduce drive
              time. Each zone has assigned service days and capacity limits.
            </p>
          </div>
        </div>
      </div>

      {/* Zones Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {zones.map((zone) => {
          const zoneClients = clients.filter(
            (c) => c.assignedZone === zone.id
          ).length;
          const zoneAppointments = appointments.filter(
            (a) => a.zone === zone.id
          ).length;

          return (
            <div
              key={zone.id}
              className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg"
                    style={{ backgroundColor: zone.color + '20' }}
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: zone.color }}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {zone.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {zone.serviceArea.radiusMiles} mile radius
                    </p>
                  </div>
                </div>
                <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300">
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
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                    />
                  </svg>
                </button>
              </div>

              {/* Assigned Days */}
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Service Days
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {dayNames.map((day, index) => {
                    const isActive = zone.assignedDays.includes(index);
                    return (
                      <span
                        key={day}
                        className={`rounded-md px-2 py-1 text-xs font-medium ${
                          isActive
                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Capacity */}
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Daily Capacity
                </p>
                <p className="mt-1 text-sm text-slate-900 dark:text-white">
                  {zone.capacity.maxAppointmentsPerDay} appointments &middot;{' '}
                  {zone.capacity.averageServiceDurationMinutes} min avg
                </p>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                <div>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {zoneClients}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Clients
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {zoneAppointments}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Appointments
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zone Coverage Summary */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Weekly Coverage
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Day
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Active Zones
                </th>
                <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Capacity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {dayNames.map((day, index) => {
                const activeZones = zones.filter((z) =>
                  z.assignedDays.includes(index)
                );
                const totalCapacity = activeZones.reduce(
                  (sum, z) => sum + z.capacity.maxAppointmentsPerDay,
                  0
                );

                return (
                  <tr key={day}>
                    <td className="py-3 font-medium text-slate-900 dark:text-white">
                      {day}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        {activeZones.length > 0 ? (
                          activeZones.map((zone) => (
                            <span
                              key={zone.id}
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                              style={{
                                backgroundColor: zone.color + '20',
                                color: zone.color,
                              }}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: zone.color }}
                              />
                              {zone.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400 dark:text-slate-500">
                            No zones scheduled
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-right text-slate-900 dark:text-white">
                      {totalCapacity > 0 ? `${totalCapacity} slots` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
