import { AppShell } from '@/components/app-shell';
import { ZoneForm } from './zone-form';
import Link from 'next/link';

export default function NewZonePage() {
  const backButton = (
    <Link
      href="/settings/zones"
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

  return (
    <AppShell title="New Zone" actions={backButton}>
      <div className="mx-auto max-w-2xl">
        <ZoneForm />
      </div>
    </AppShell>
  );
}
