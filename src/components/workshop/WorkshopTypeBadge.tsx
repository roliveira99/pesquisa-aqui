import type { WorkshopType } from "@/types/workshop";
import { workshopTypeColors, workshopTypeLabels } from "@/lib/labels";

interface WorkshopTypeBadgeProps {
  type: WorkshopType;
}

export function WorkshopTypeBadge({ type }: WorkshopTypeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${workshopTypeColors[type]}`}
    >
      {workshopTypeLabels[type]}
    </span>
  );
}
