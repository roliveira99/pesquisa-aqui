"use client";

import { useState } from "react";
import { ActionButton, DataTable } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { supportTickets } from "@/data/admin";

export default function AdminSuportePage() {
  const [tickets, setTickets] = useState(supportTickets);

  function resolve(id: string) {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "resolvido" as const } : t))
    );
  }

  const priorityColors = {
    baixa: "text-muted",
    media: "text-yellow-400",
    alta: "text-red-400",
  };

  const statusColors = {
    aberto: "bg-yellow-500/15 text-yellow-400",
    em_andamento: "bg-blue-500/15 text-blue-400",
    resolvido: "bg-emerald-500/15 text-emerald-400",
  };

  return (
    <PermissionGuard permissions={["admin.suporte"]}>
      <PageHeader
        title="Suporte administrativo"
        description="Atendimento a solicitações das oficinas cadastradas"
      />

      <DataTable
        headers={["Ticket", "Oficina", "Assunto", "Prioridade", "Status", "Data", "Ações"]}
        rows={tickets.map((t) => [
          t.id,
          t.workshop,
          t.subject,
          <span key={`p-${t.id}`} className={priorityColors[t.priority]}>
            {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
          </span>,
          <span key={`s-${t.id}`} className={`rounded-full px-2 py-0.5 text-xs ${statusColors[t.status]}`}>
            {t.status === "em_andamento" ? "Em andamento" : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
          </span>,
          new Date(t.createdAt).toLocaleDateString("pt-BR"),
          t.status !== "resolvido" ? (
            <div key={`act-${t.id}`} className="flex gap-2">
              <ActionButton label="Atender" variant="primary" />
              <ActionButton label="Resolver" variant="success" onClick={() => resolve(t.id)} />
            </div>
          ) : "Resolvido",
        ])}
      />
    </PermissionGuard>
  );
}
