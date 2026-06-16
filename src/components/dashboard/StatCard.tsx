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
}: StatCardProps) {
  return (
    <div className="dash-stat">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="dash-icon-box">
          <Icon name={icon} className="h-4 w-4" />
        </div>
        {trend && <span className="dash-badge">{trend}</span>}
      </div>
      <p className="text-xl font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
