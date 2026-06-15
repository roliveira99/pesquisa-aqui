"use client";

import { useState } from "react";
import { ActionButton, DataTable, TabPanel } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import type { Permission } from "@/types/auth";
import { useAuth } from "@/components/auth/AuthProvider";
import { hasPermission } from "@/lib/permissions";

const estoque = [
  { codigo: "P-001", nome: "Filtro de óleo", qtd: 24, min: 10, valor: 35 },
  { codigo: "P-002", nome: "Pastilha de freio", qtd: 8, min: 15, valor: 89 },
  { codigo: "P-003", nome: "Correia dentada", qtd: 5, min: 8, valor: 120 },
  { codigo: "P-004", nome: "Óleo 5W30 (L)", qtd: 40, min: 20, valor: 45 },
];

export default function EstoquePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("consulta");
  const isGerencia = user?.role === "gerencia";

  const tabs = [
    {
      id: "consulta",
      label: "Consulta",
      content: (
        <DataTable
          headers={["Código", "Peça", "Quantidade", "Mínimo", "Valor unit.", "Status"]}
          rows={estoque.map((p) => [
            p.codigo,
            p.nome,
            p.qtd,
            p.min,
            `R$ ${p.valor}`,
            p.qtd < p.min ? (
              <span className="text-red-400">Estoque baixo</span>
            ) : (
              <span className="text-emerald-400">OK</span>
            ),
          ])}
        />
      ),
    },
    ...(isGerencia || user?.role === "dono"
      ? [
          {
            id: "entrada",
            label: "Entrada de peças",
            content: (
              <div className="rounded-xl border border-border bg-surface p-6">
                <p className="mb-4 text-sm text-muted">Registrar entrada de peças no estoque</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input placeholder="Código da peça" className="rounded-lg border border-border bg-background px-4 py-2 text-sm" />
                  <input placeholder="Quantidade" type="number" className="rounded-lg border border-border bg-background px-4 py-2 text-sm" />
                </div>
                <ActionButton label="Registrar entrada" variant="primary" />
              </div>
            ),
          },
          {
            id: "saida",
            label: "Saída de peças",
            content: (
              <div className="rounded-xl border border-border bg-surface p-6">
                <p className="mb-4 text-sm text-muted">Registrar saída de peças (OS ou venda)</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input placeholder="Código da peça" className="rounded-lg border border-border bg-background px-4 py-2 text-sm" />
                  <input placeholder="OS vinculada" className="rounded-lg border border-border bg-background px-4 py-2 text-sm" />
                </div>
                <ActionButton label="Registrar saída" variant="primary" />
              </div>
            ),
          },
        ]
      : []),
  ];

  const permissions: Permission[] = user?.role === "dono"
    ? ["owner.estoque"]
    : ["gerencia.estoque", "gerencia.entrada_pecas", "gerencia.saida_pecas"];

  return (
    <PermissionGuard permissions={permissions}>
      <PageHeader
        title="Estoque"
        description={isGerencia ? "Consulta, entrada e saída de peças" : "Controle completo de estoque e peças"}
        actions={user && hasPermission(user.role, "owner.cadastro_pecas") ? (
          <ActionButton label="+ Cadastrar peça" variant="primary" />
        ) : undefined}
      />
      <TabPanel tabs={tabs} activeTab={tab} onTabChange={setTab} />
    </PermissionGuard>
  );
}
