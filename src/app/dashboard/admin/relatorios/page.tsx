"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { DataTable } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { subscriptions, pendingWorkshops } from "@/data/admin";
import { workshops } from "@/data/workshops";

export default function AdminRelatoriosPage() {
  const byState = workshops.reduce<Record<string, number>>((acc, w) => {
    acc[w.state] = (acc[w.state] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <PermissionGuard permissions={["admin.relatorios_globais"]}>
      <PageHeader
        title="Relatórios globais"
        description="Métricas consolidadas de toda a plataforma"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de oficinas" value={workshops.length} icon="building" />
        <StatCard label="Novos cadastros (mês)" value={pendingWorkshops.length} icon="clipboard" />
        <StatCard label="Receita recorrente" value="R$ 1.495" icon="wallet" trend="MRR" />
        <StatCard label="Taxa de aprovação" value="75%" icon="chart" />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-semibold">Oficinas por estado</h2>
          <ul className="space-y-2">
            {Object.entries(byState).map(([state, count]) => (
              <li key={state} className="flex justify-between text-sm">
                <span>{state}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-semibold">Por tipo de oficina</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Carros</span><span>{workshops.filter(w => w.type === "carros").length}</span></li>
            <li className="flex justify-between"><span>Motos</span><span>{workshops.filter(w => w.type === "motos").length}</span></li>
            <li className="flex justify-between"><span>Mista</span><span>{workshops.filter(w => w.type === "mista").length}</span></li>
            <li className="flex justify-between"><span>Estética automotiva</span><span>{workshops.filter(w => w.type === "estetica").length}</span></li>
          </ul>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Assinaturas por plano</h2>
      <DataTable
        headers={["Oficina", "Plano", "Valor", "Status"]}
        rows={subscriptions.map((s) => [
          s.workshopName,
          s.plan.charAt(0).toUpperCase() + s.plan.slice(1),
          `R$ ${s.value}`,
          s.status.charAt(0).toUpperCase() + s.status.slice(1),
        ])}
      />
    </PermissionGuard>
  );
}
