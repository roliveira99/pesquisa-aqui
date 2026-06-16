"use client";

import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { FeatureList, PageHeader } from "@/components/dashboard/DashboardUI";
import { useAuth } from "@/components/auth/AuthProvider";
import { demoOrders } from "@/data/workshops";
import { orderStatusColors, orderStatusLabels } from "@/lib/labels";
import { roleRestrictions } from "@/lib/permissions";

const ownerFeatures = [
  "Dashboard completo da oficina",
  "Fluxo de caixa",
  "Contas a pagar e receber",
  "Estoque e cadastro de peças",
  "Cadastro de serviços, clientes e veículos",
  "Cadastro de funcionários",
  "Controle de salários, comissões e ponto",
  "Aprovação de orçamentos e alterações",
  "Emissão de PDF e envio WhatsApp",
  "Relatórios financeiros, operacionais e de produtividade",
];

export function OwnerHome() {
  const { user } = useAuth();
  const ordersToday = demoOrders.filter((o) => o.date === "2026-06-15").length;
  const inProgress = demoOrders.filter((o) => o.status === "em_andamento").length;
  const monthlyRevenue = demoOrders.reduce((sum, o) => sum + o.value, 0);

  return (
    <div>
      <PageHeader
        title="Dashboard da oficina"
        description={`Bem-vindo, ${user?.name} — ${user?.workshopName}`}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ordens hoje" value={ordersToday} icon="clipboard" trend="+2 vs ontem" />
        <StatCard label="Em andamento" value={inProgress} icon="wrench" />
        <StatCard label="Receita (mês)" value={`R$ ${monthlyRevenue.toLocaleString("pt-BR")}`} icon="wallet" />
        <StatCard label="Clientes ativos" value={48} icon="users" trend="+5 este mês" />
      </div>

      <div className="card mb-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Ordens recentes</h2>
          <Link href="/dashboard/orcamentos" className="dash-link text-sm font-medium">
            Ver orçamentos
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="dash-table-head border-b border-border text-left">
                <th className="px-5 py-3 font-semibold">OS</th>
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Veículo</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {demoOrders.slice(0, 4).map((order) => (
                <tr key={order.id}>
                  <td className="px-5 py-3 font-mono text-xs text-muted">{order.id}</td>
                  <td className="px-5 py-3 text-foreground">{order.clientName}</td>
                  <td className="px-5 py-3 text-muted">{order.vehicle}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${orderStatusColors[order.status]}`}>
                      {orderStatusLabels[order.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-foreground">
                    R$ {order.value.toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FeatureList allowed={ownerFeatures} restricted={roleRestrictions.dono} />
    </div>
  );
}
