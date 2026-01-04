'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import type { DbZone } from '@/types/database';
import type { ClientWithZone } from '@/lib/actions/clients';

interface ClientsTableProps {
  clients: ClientWithZone[];
  zones: DbZone[];
}

export function ClientsTable({ clients, zones }: ClientsTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      !search ||
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email?.toLowerCase().includes(search.toLowerCase()) ||
      client.phone?.includes(search);

    const matchesZone = !zoneFilter || client.assigned_zone_id === zoneFilter;

    return matchesSearch && matchesZone;
  });

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (client: ClientWithZone) => (
        <div>
          <p className="font-medium">{client.name}</p>
          <p className="text-xs text-foreground-muted">
            {client.id.slice(0, 8)}...
          </p>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (client: ClientWithZone) => (
        <div>
          <p>{client.phone || 'No phone'}</p>
          <p className="text-xs text-foreground-muted">
            {client.email || 'No email'}
          </p>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Service Address',
      render: (client: ClientWithZone) => (
        <div>
          <p>{client.street}</p>
          <p className="text-xs text-foreground-muted">
            {client.city}, {client.state} {client.zip}
          </p>
        </div>
      ),
    },
    {
      key: 'zone',
      header: 'Zone',
      render: (client: ClientWithZone) => {
        const zone = client.zone;
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

  return (
    <>
      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
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
        data={filteredClients}
        keyExtractor={(client) => client.id}
        onRowClick={(client) => router.push(`/clients/${client.id}`)}
        emptyMessage="No clients found. Add your first client to get started."
      />

      {/* Summary */}
      <div className="mt-4 text-sm text-foreground-muted">
        Showing {filteredClients.length} of {clients.length} clients
      </div>
    </>
  );
}
