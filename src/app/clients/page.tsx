'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { DataTable } from '@/components/ui/data-table';
import { clients, zones } from '@/lib/mock-data';
import type { Client } from '@/types';

export default function ClientsPage() {
  const router = useRouter();

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (client: Client) => (
        <div>
          <p className="font-medium">{client.contactInfo.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {client.id}
          </p>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (client: Client) => (
        <div>
          <p>{client.contactInfo.phone}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {client.contactInfo.email}
          </p>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Service Address',
      render: (client: Client) => (
        <div>
          <p>{client.serviceAddress.street}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {client.serviceAddress.city}, {client.serviceAddress.state}{' '}
            {client.serviceAddress.zip}
          </p>
        </div>
      ),
    },
    {
      key: 'zone',
      header: 'Zone',
      render: (client: Client) => {
        const zone = zones.find((z) => z.id === client.assignedZone);
        return (
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: zone?.color || '#6B7280' }}
            />
            <span>{zone?.name || 'Unassigned'}</span>
          </div>
        );
      },
    },
  ];

  const addClientButton = (
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
      Add Client
    </button>
  );

  return (
    <AppShell title="Clients" actions={addClientButton}>
      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500 sm:w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800">
            <option value="">All Zones</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <DataTable
        columns={columns}
        data={clients}
        keyExtractor={(client) => client.id}
        onRowClick={(client) => router.push(`/clients/${client.id}`)}
        emptyMessage="No clients found. Add your first client to get started."
      />

      {/* Summary */}
      <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Showing {clients.length} clients
      </div>
    </AppShell>
  );
}
