import type { UserRole } from "@/types/auth";
import { roleLabels } from "@/lib/permissions";

interface RoleBadgeProps {
  role: UserRole;
  dark?: boolean;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return <span className="dash-badge">{roleLabels[role]}</span>;
}
