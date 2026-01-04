import type { AppointmentStatus } from '@/types';

interface StatusBadgeProps {
  status: AppointmentStatus;
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled: {
    label: 'Scheduled',
    className: 'bg-info-bg text-info',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-primary/20 text-primary-hover',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-warning-bg text-warning',
  },
  completed: {
    label: 'Completed',
    className: 'bg-success-bg text-success',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-muted text-muted-foreground',
  },
  no_show: {
    label: 'No Show',
    className: 'bg-error-bg text-error',
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
