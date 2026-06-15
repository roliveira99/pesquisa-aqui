"use client";

import { ActionButton, DataTable } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { StatCard } from "@/components/dashboard/StatCard";
import { subscriptions } from "@/data/admin";

export default function AdminAssinaturasPage() {
  const active = subscriptions.filter((s) => s.status === "ativa");
  const overdue = subscriptions.filter((s) => s.status === "atrasada");
  const mrr = active.reduce((sum, s) => sum + s.value, 0);

  const statusColors: Record<string, string> = {
    ativa: "text-emerald-400",
    atrasada: "text-red-400",
    cancelada: "text-muted",
    suspensa: "text-orange-400",
  };

  return (
    <PermissionGuard permissions={["admin.controle_assinaturas"]}>
      <PageHeader
        title="Controle financeiro — Assinaturas"
        description="Gerencie planos contratados, pagamentos e inadimplência"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="MRR (receita mensal)" value={`R$ ${mrr}`} icon="wallet" />
        <StatCard label="Assinaturas ativas" value={active.length} icon="credit-card" />
        <StatCard label="Inadimplentes" value={overdue.length} icon="chart" trendPositive={false} />
      </div>

      <DataTable
        headers={["Oficina", "Plano", "Valor/mês", "Próximo vencimento", "Status", "Ações"]}
        rows={subscriptions.map((s) => [
          s.workshopName,
          s.plan.charAt(0).toUpperCase() + s.plan.slice(1),
          `R$ ${s.value}`,
          new Date(s.nextDue).toLocaleDateString("pt-BR"),
          <span key={s.id} className={statusColors[s.status]}>
            {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
          </span>,
          <div key={`act-${s.id}`} className="flex gap-2">
            {s.status === "atrasada" && <ActionButton label="Cobrar" variant="primary" />}
            {s.status !== "suspensa" && <ActionButton label="Suspender" variant="danger" />}
            {s.status === "suspensa" && <ActionButton label="Reativar" variant="success" />}
          </div>,
        ])}
      />
    </PermissionGuard>
  );
}
