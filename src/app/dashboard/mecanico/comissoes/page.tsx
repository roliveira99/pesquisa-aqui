"use client";

import { DataTable } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { StatCard } from "@/components/dashboard/StatCard";

export default function MecanicoComissoesPage() {
  return (
    <PermissionGuard permissions={["mecanico.consultar_comissoes"]}>
      <PageHeader
        title="Minhas comissões"
        description="Acompanhe suas comissões — apenas os seus dados"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Comissão (mês)" value="R$ 1.840" icon="wallet" trend="+8%" />
        <StatCard label="Serviços realizados" value={18} icon="wrench" />
        <StatCard label="Taxa de comissão" value="8%" icon="chart" />
      </div>

      <DataTable
        headers={["OS", "Serviço", "Valor OS", "Comissão", "Data", "Status"]}
        rows={[
          ["OS-001", "Troca de óleo", "R$ 280", "R$ 22,40", "15/06/2026", "Paga"],
          ["OS-002", "Alinhamento", "R$ 150", "R$ 12,00", "15/06/2026", "Pendente"],
          ["OS-007", "Pastilhas de freio", "R$ 420", "R$ 33,60", "14/06/2026", "Paga"],
          ["OS-008", "Troca de correia", "R$ 350", "R$ 28,00", "12/06/2026", "Paga"],
        ]}
      />

      <p className="mt-6 text-sm text-muted">
        ❌ Você não visualiza salários de outros funcionários nem dados financeiros da empresa.
      </p>
    </PermissionGuard>
  );
}
