"use client";

import { useState } from "react";
import { ActionButton, TabPanel } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { StatCard } from "@/components/dashboard/StatCard";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Permission } from "@/types/auth";

export default function RelatoriosPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState(
    user?.role === "dono" ? "financeiro" : "operacional"
  );

  const ownerTabs = [
    {
      id: "financeiro",
      label: "Financeiro",
      content: (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Receita total" value="R$ 18.420" icon="wallet" />
          <StatCard label="Despesas" value="R$ 9.850" icon="credit-card" />
          <StatCard label="Lucro líquido" value="R$ 8.570" icon="chart" trend="+15%" />
        </div>
      ),
    },
    {
      id: "operacional",
      label: "Operacional",
      content: (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="OS concluídas" value={42} icon="clipboard" />
          <StatCard label="Tempo médio" value="2h 15min" icon="calendar" />
          <StatCard label="Taxa de retorno" value="68%" icon="chart" />
        </div>
      ),
    },
    {
      id: "produtividade",
      label: "Produtividade",
      content: (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Serviços/mecânico" value={16} icon="wrench" />
          <StatCard label="Eficiência média" value="91%" icon="chart" />
          <StatCard label="Top performer" value="Pedro O." icon="star" />
        </div>
      ),
    },
  ];

  const gerenciaTabs = [
    {
      id: "operacional",
      label: "Operacional",
      content: (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="OS do mês" value={58} icon="clipboard" />
          <StatCard label="Agendamentos" value={24} icon="calendar" />
          <StatCard label="Peças utilizadas" value={156} icon="box" />
        </div>
      ),
    },
  ];

  const tabs = user?.role === "dono" ? ownerTabs : gerenciaTabs;

  const permissions: Permission[] =
    user?.role === "dono"
      ? ["owner.relatorios_financeiros", "owner.relatorios_operacionais", "owner.relatorios_produtividade"]
      : ["gerencia.relatorios_operacionais"];

  return (
    <PermissionGuard permissions={permissions}>
      <PageHeader
        title="Relatórios"
        description="Análises e métricas da oficina"
        actions={<ActionButton label="Exportar PDF" variant="primary" />}
      />
      <TabPanel tabs={tabs} activeTab={tab} onTabChange={setTab} />
    </PermissionGuard>
  );
}
