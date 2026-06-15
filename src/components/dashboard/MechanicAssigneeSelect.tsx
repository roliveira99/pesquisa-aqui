"use client";

import type { MechanicAssignee, MechanicKind } from "@/types/client";

interface MechanicAssigneeSelectProps {
  assignees: MechanicAssignee[];
  value: string;
  kind: MechanicKind;
  onChange: (mechanicId: string, kind: MechanicKind) => void;
  required?: boolean;
  className?: string;
}

export function MechanicAssigneeSelect({
  assignees,
  value,
  kind,
  onChange,
  required,
  className = "input-field",
}: MechanicAssigneeSelectProps) {
  const composite = value ? `${kind}:${value}` : "";

  return (
    <select
      required={required}
      value={composite}
      onChange={(e) => {
        const raw = e.target.value;
        if (!raw) return;
        const [k, id] = raw.split(":");
        onChange(id, k as MechanicKind);
      }}
      className={className}
    >
      <option value="">Quem executa o serviço?</option>
      {assignees.some((a) => a.kind === "platform") && (
        <optgroup label="Com login na plataforma">
          {assignees
            .filter((a) => a.kind === "platform")
            .map((a) => (
              <option key={`${a.kind}:${a.id}`} value={`${a.kind}:${a.id}`}>
                {a.name}
                {a.specialty ? ` — ${a.specialty}` : ""}
              </option>
            ))}
        </optgroup>
      )}
      {assignees.some((a) => a.kind === "fictional") && (
        <optgroup label="Perfil fictício (sem e-mail / sem acesso)">
          {assignees
            .filter((a) => a.kind === "fictional")
            .map((a) => (
              <option key={`${a.kind}:${a.id}`} value={`${a.kind}:${a.id}`}>
                {a.name}
                {a.specialty ? ` — ${a.specialty}` : ""}
              </option>
            ))}
        </optgroup>
      )}
    </select>
  );
}

export function MechanicKindBadge({ kind }: { kind?: MechanicKind }) {
  if (kind === "fictional") {
    return (
      <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-300">
        Sem acesso
      </span>
    );
  }
  if (kind === "platform") {
    return (
      <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-xs font-medium text-sky-700 dark:text-sky-300">
        Com login
      </span>
    );
  }
  return null;
}
