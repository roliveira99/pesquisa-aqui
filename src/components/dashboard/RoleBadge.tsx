import type { UserRole } from "@/types/auth";
import { roleLabels } from "@/lib/permissions";

const roleColors: Record<UserRole, string> = {
  master:
    "bg-violet-100 text-violet-800 border-violet-200 [data-theme=dark]:bg-violet-950/40 [data-theme=dark]:text-violet-300 [data-theme=dark]:border-violet-800",
  dono:
    "bg-blue-100 text-blue-800 border-blue-200 [data-theme=dark]:bg-blue-950/40 [data-theme=dark]:text-blue-300 [data-theme=dark]:border-blue-800",
  gerencia:
    "bg-sky-100 text-sky-800 border-sky-200 [data-theme=dark]:bg-sky-950/40 [data-theme=dark]:text-sky-300 [data-theme=dark]:border-sky-800",
  mecanico:
    "bg-slate-100 text-slate-700 border-slate-200 [data-theme=dark]:bg-zinc-800/60 [data-theme=dark]:text-zinc-300 [data-theme=dark]:border-zinc-700",
};

interface RoleBadgeProps {
  role: UserRole;
  dark?: boolean;
}

export function RoleBadge({ role, dark = false }: RoleBadgeProps) {
  if (dark) {
    return (
      <span className="inline-flex items-center rounded-md border border-sidebar-border bg-sidebar-hover px-2 py-0.5 text-[11px] font-medium text-blue-300">
        {roleLabels[role]}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${roleColors[role]}`}
    >
      {roleLabels[role]}
    </span>
  );
}
