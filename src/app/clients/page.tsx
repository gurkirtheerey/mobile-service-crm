import { AppShell } from '@/components/app-shell';
import { getClients } from '@/lib/actions/clients';
import { getZones } from '@/lib/actions/zones';
import Link from 'next/link';
import { ClientsTable } from './clients-table';

export default async function ClientsPage() {
  const [clients, zones] = await Promise.all([
    getClients(),
    getZones(),
  ]);

  const addClientButton = (
    <Link
      href="/clients/new"
      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
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
      Add Client
    </Link>
  );

  return (
    <AppShell title="Clients" actions={addClientButton}>
      <ClientsTable clients={clients} zones={zones} />
    </AppShell>
  );
}
