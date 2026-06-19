"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButton, PageHeader, TabPanel } from "@/components/dashboard/DashboardUI";
import { DashboardMetricPanel } from "@/components/dashboard/DashboardMetricPanel";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { StatCard } from "@/components/dashboard/StatCard";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Permission } from "@/types/auth";

interface ReportData {
  generatedAt: string;
  workshopName: string;
  summary: Record<string, number>;
}

export default function RelatoriosPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState(user?.role === "dono" ? "financeiro" : "operacional");
  const [report, setReport] = useState<ReportData | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/reports/detailed");
    if (res.ok) setReport(await res.json());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function exportReport() {
    if (!report) return;
    const lines = [
      `RELATÓRIO DETALHADO — ${report.workshopName}`,
      `Gerado em: ${new Date(report.generatedAt).toLocaleString("pt-BR")}`,
      "",
      "=== RESUMO FINANCEIRO ===",
      `Faturamento (notas): R$ ${report.summary.revenueFromNotes?.toFixed(2)}`,
      `A receber (aberto): R$ ${report.summary.receivablesOpen?.toFixed(2)}`,
      `A pagar (aberto): R$ ${report.summary.payablesOpen?.toFixed(2)}`,
      `Recebido: R$ ${report.summary.receivablesPaid?.toFixed(2)}`,
      `Pago: R$ ${report.summary.payablesPaid?.toFixed(2)}`,
      `Comissões pagas: R$ ${report.summary.commissionsPaid?.toFixed(2)}`,
      `Comissões pendentes: R$ ${report.summary.commissionsPending?.toFixed(2)}`,
      `Saldo: R$ ${report.summary.balance?.toFixed(2)}`,
      "",
      "=== OPERACIONAL ===",
      `Notas de serviço: ${report.summary.serviceNotesCount}`,
      `Orçamentos pendentes: ${report.summary.budgetsPending}`,
      `Orçamentos aprovados: ${report.summary.budgetsApproved}`,
      `Veículos cadastrados: ${report.summary.vehiclesRegistered}`,
      `Clientes (avaliação): ${report.summary.clientsRegistered}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${report.workshopName.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const s = report?.summary;

  const ownerTabs = [
    {
      id: "financeiro",
      label: "Financeiro",
      content: (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Faturamento" value={`R$ ${(s?.revenueFromNotes ?? 0).toLocaleString("pt-BR")}`} icon="wallet" />
          <StatCard label="Saldo" value={`R$ ${(s?.balance ?? 0).toLocaleString("pt-BR")}`} icon="chart" />
          <StatCard label="Comissões pendentes" value={`R$ ${(s?.commissionsPending ?? 0).toLocaleString("pt-BR")}`} icon="credit-card" />
        </div>
      ),
    },
    {
      id: "operacional",
      label: "Operacional",
      content: (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Notas emitidas" value={s?.serviceNotesCount ?? 0} icon="clipboard" />
          <StatCard label="Orçamentos pendentes" value={s?.budgetsPending ?? 0} icon="file" />
          <StatCard label="Veículos" value={s?.vehiclesRegistered ?? 0} icon="car" />
        </div>
      ),
    },
    {
      id: "produtividade",
      label: "Produtividade",
      content: (
        <DashboardMetricPanel
          title="Receita operacional"
          subtitle="Notas de serviço no período"
          icon="wallet"
          mode="currency"
          valueKey="revenue"
          previousKey="previousRevenue"
          breakdownKey="amount"
        />
      ),
    },
  ];

  const gerenciaTabs = [ownerTabs[1]];

  const permissions: Permission[] =
    user?.role === "dono"
      ? ["owner.relatorios_financeiros", "owner.relatorios_operacionais", "owner.relatorios_produtividade"]
      : ["gerencia.relatorios_operacionais"];

  return (
    <PermissionGuard permissions={permissions}>
      <PageHeader
        title="Relatórios"
        description="Dados reais da oficina — exporte o relatório detalhado em texto"
        actions={<ActionButton label="Exportar detalhado" variant="primary" onClick={exportReport} />}
      />
      <TabPanel tabs={user?.role === "dono" ? ownerTabs : gerenciaTabs} activeTab={tab} onTabChange={setTab} />
    </PermissionGuard>
  );
}
