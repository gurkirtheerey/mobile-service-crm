import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { ClientForm } from '../client-form';
import { getZones } from '@/lib/actions/zones';

export default async function NewClientPage() {
  const zones = await getZones();

  return (
    <>
      <PageHeader title="Add Client" />
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

      <div className="mx-auto max-w-2xl">
        <ClientForm zones={zones} mode="create" />
      </div>
    </>
  );
}
