import type { AppointmentStatus } from '@/types';

interface StatusBadgeProps {
  status: AppointmentStatus;
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled: {
    label: 'Scheduled',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  },
  no_show: {
    label: 'No Show',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
