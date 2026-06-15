"use client";

import { useState } from "react";
import { ActionButton, DataTable } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { WorkshopTypeBadge } from "@/components/workshop/WorkshopTypeBadge";
import { pendingWorkshops } from "@/data/admin";
import { workshops } from "@/data/workshops";

export default function AdminOficinasPage() {
  const [items, setItems] = useState(pendingWorkshops);

  function updateStatus(id: string, status: "aprovada" | "reprovada" | "suspensa") {
    setItems((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status } : w))
    );
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pendente: "bg-yellow-500/15 text-yellow-400",
      aprovada: "bg-emerald-500/15 text-emerald-400",
      reprovada: "bg-red-500/15 text-red-400",
      suspensa: "bg-orange-500/15 text-orange-400",
    };
    const labels: Record<string, string> = {
      pendente: "Pendente",
      aprovada: "Aprovada",
      reprovada: "Reprovada",
      suspensa: "Suspensa",
    };
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <PermissionGuard permissions={["admin.visualizar_oficinas", "admin.aprovar_oficinas", "admin.bloquear_oficinas"]}>
      <PageHeader
        title="Gestão de oficinas"
        description="Aprovar, reprovar, bloquear e visualizar todas as oficinas da plataforma"
      />

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Solicitações de cadastro</h2>
        <DataTable
          headers={["Oficina", "Tipo", "Responsável", "Cidade", "Status", "Ações"]}
          rows={items.map((w) => [
            w.name,
            <WorkshopTypeBadge key={w.id} type={w.type} />,
            w.owner,
            `${w.city}/${w.state}`,
            statusBadge(w.status),
            w.status === "pendente" ? (
              <div key={`actions-${w.id}`} className="flex gap-2">
                <ActionButton label="Aprovar" variant="success" onClick={() => updateStatus(w.id, "aprovada")} />
                <ActionButton label="Reprovar" variant="danger" onClick={() => updateStatus(w.id, "reprovada")} />
              </div>
            ) : w.status === "aprovada" ? (
              <ActionButton key={`suspend-${w.id}`} label="Suspender" variant="danger" onClick={() => updateStatus(w.id, "suspensa")} />
            ) : w.status === "suspensa" ? (
              <ActionButton key={`reactivate-${w.id}`} label="Reativar" variant="success" onClick={() => updateStatus(w.id, "aprovada")} />
            ) : "—",
          ])}
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Oficinas ativas na plataforma</h2>
        <DataTable
          headers={["Oficina", "Tipo", "Cidade", "Avaliação", "Contato"]}
          rows={workshops.map((w) => [
            w.name,
            <WorkshopTypeBadge key={w.id} type={w.type} />,
            `${w.city}/${w.state}`,
            `★ ${w.rating} (${w.reviewCount})`,
            w.phone,
          ])}
        />
      </div>
    </PermissionGuard>
  );
}
