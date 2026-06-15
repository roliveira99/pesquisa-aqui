import type { IconName } from "@/components/ui/Icon";
import { Icon } from "@/components/ui/Icon";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: IconName;
  trend?: string;
  trendPositive?: boolean;
}

export function StatCard({
  label,
  value,
  icon = "chart",
  trend,
  trendPositive = true,
}: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon name={icon} className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${
              trendPositive
                ? "bg-success-soft text-success"
                : "bg-warning-soft text-warning"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}
