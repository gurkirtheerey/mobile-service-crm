interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, subtitle, icon, trend }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-foreground-muted">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-foreground-muted">
              {subtitle}
            </p>
          )}
          {trend && (
            <p
              className={`mt-2 text-sm font-medium ${
                trend.isPositive
                  ? 'text-success'
                  : 'text-error'
              }`}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}% from last week
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-muted p-3">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
