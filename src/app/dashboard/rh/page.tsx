"use client";

import { useState } from "react";
import { ActionButton, DataTable, TabPanel } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";

export default function RhPage() {
  const [tab, setTab] = useState("salarios");

  const tabs = [
    {
      id: "salarios",
      label: "Salários",
      content: (
        <DataTable
          headers={["Funcionário", "Cargo", "Salário", "Status", "Ações"]}
          rows={[
            ["Maria Santos", "Gerente", "R$ 4.500", "Pago", "—"],
            ["Pedro Oliveira", "Mecânico", "R$ 3.200", "Pendente", <ActionButton key="1" label="Processar" variant="primary" />],
            ["Lucas Ferreira", "Mecânico", "R$ 2.800", "Pendente", <ActionButton key="2" label="Processar" variant="primary" />],
          ]}
        />
      ),
    },
    {
      id: "comissoes",
      label: "Comissões",
      content: (
        <DataTable
          headers={["Funcionário", "Serviços", "Comissão", "Período", "Ações"]}
          rows={[
            ["Pedro Oliveira", "18", "R$ 1.840", "Jun/2026", <ActionButton key="1" label="Detalhar" />],
            ["Lucas Ferreira", "14", "R$ 1.420", "Jun/2026", <ActionButton key="2" label="Detalhar" />],
          ]}
        />
      ),
    },
    {
      id: "ponto",
      label: "Controle de ponto",
      content: (
        <DataTable
          headers={["Funcionário", "Entrada", "Saída", "Horas", "Status"]}
          rows={[
            ["Pedro Oliveira", "08:02", "17:45", "9h43", "Normal"],
            ["Lucas Ferreira", "08:15", "—", "—", "Em expediente"],
            ["Maria Santos", "07:55", "18:00", "10h05", "Normal"],
          ]}
        />
      ),
    },
  ];

  return (
    <PermissionGuard permissions={["owner.salarios", "owner.comissoes", "owner.ponto"]}>
      <PageHeader title="Recursos Humanos" description="Salários, comissões e controle de ponto" />
      <TabPanel tabs={tabs} activeTab={tab} onTabChange={setTab} />
    </PermissionGuard>
  );
}
