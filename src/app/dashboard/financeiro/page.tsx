"use client";

import { useState } from "react";
import { ActionButton, DataTable, TabPanel } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { StatCard } from "@/components/dashboard/StatCard";

export default function FinanceiroPage() {
  const [tab, setTab] = useState("fluxo");

  const tabs = [
    {
      id: "fluxo",
      label: "Fluxo de caixa",
      content: (
        <div>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Entradas (mês)" value="R$ 18.420" icon="chart" trend="+12%" />
            <StatCard label="Saídas (mês)" value="R$ 9.850" icon="wallet" />
            <StatCard label="Saldo" value="R$ 8.570" icon="credit-card" />
          </div>
          <DataTable
            headers={["Data", "Descrição", "Tipo", "Valor"]}
            rows={[
              ["15/06/2026", "OS-001 — Carlos Mendes", "Entrada", "R$ 280"],
              ["15/06/2026", "Fornecedor AutoPeças", "Saída", "R$ 1.200"],
              ["14/06/2026", "OS-005 — João Pedro", "Entrada", "R$ 350"],
              ["14/06/2026", "Salários (parcial)", "Saída", "R$ 4.500"],
            ]}
          />
        </div>
      ),
    },
    {
      id: "pagar",
      label: "Contas a pagar",
      content: (
        <DataTable
          headers={["Vencimento", "Fornecedor", "Valor", "Status", "Ações"]}
          rows={[
            ["20/06/2026", "AutoPeças Ltda", "R$ 2.400", "Pendente", <ActionButton key="1" label="Pagar" variant="primary" />],
            ["25/06/2026", "Energia Elétrica", "R$ 890", "Pendente", <ActionButton key="2" label="Pagar" variant="primary" />],
            ["01/07/2026", "Aluguel", "R$ 3.500", "Agendado", <ActionButton key="3" label="Editar" />],
          ]}
        />
      ),
    },
    {
      id: "receber",
      label: "Contas a receber",
      content: (
        <DataTable
          headers={["Vencimento", "Cliente", "OS", "Valor", "Status", "Ações"]}
          rows={[
            ["16/06/2026", "Roberto Lima", "OS-003", "R$ 420", "Pendente", <ActionButton key="1" label="Receber" variant="success" />],
            ["18/06/2026", "Fernanda Costa", "OS-004", "R$ 180", "Pendente", <ActionButton key="2" label="Receber" variant="success" />],
            ["15/06/2026", "Carlos Mendes", "OS-001", "R$ 280", "Recebido", "—"],
          ]}
        />
      ),
    },
  ];

  return (
    <PermissionGuard permissions={["owner.fluxo_caixa", "owner.contas_pagar", "owner.contas_receber"]}>
      <PageHeader
        title="Financeiro"
        description="Fluxo de caixa, contas a pagar e a receber"
        actions={
          <>
            <ActionButton label="Exportar PDF" variant="primary" />
            <ActionButton label="Enviar WhatsApp" />
          </>
        }
      />
      <TabPanel tabs={tabs} activeTab={tab} onTabChange={setTab} />
    </PermissionGuard>
  );
}
