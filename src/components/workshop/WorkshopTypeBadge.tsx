import type { WorkshopType } from "@/types/workshop";
import { workshopTypeColors, workshopTypeLabels } from "@/lib/labels";

interface WorkshopTypeBadgeProps {
  type: WorkshopType;
  variant?: "default" | "system";
}

export function WorkshopTypeBadge({ type, variant = "default" }: WorkshopTypeBadgeProps) {
  const className =
    variant === "system"
      ? "dash-badge"
      : `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${workshopTypeColors[type]}`;

  return <span className={className}>{workshopTypeLabels[type]}</span>;
}
