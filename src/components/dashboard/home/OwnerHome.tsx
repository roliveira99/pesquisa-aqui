"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DashboardMetricPanel } from "@/components/dashboard/DashboardMetricPanel";
import { FeatureList, PageHeader } from "@/components/dashboard/DashboardUI";
import { useAuth } from "@/components/auth/AuthProvider";
import { orderStatusColors, orderStatusLabels } from "@/lib/labels";
import { roleRestrictions } from "@/lib/permissions";
import type { WorkshopServiceOrder } from "@/types/client";

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
  const [orders, setOrders] = useState<WorkshopServiceOrder[]>([]);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/crm");
    if (res.ok) {
      const data = (await res.json()) as { orders: WorkshopServiceOrder[] };
      setOrders(data.orders.slice(0, 6));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const inProgress = orders.filter((o) => o.status === "em_andamento").length;
  const today = new Date().toISOString().split("T")[0];
  const ordersToday = orders.filter((o) => o.date === today).length;

  return (
    <div>
      <PageHeader
        title="Dashboard da oficina"
        description={`Bem-vindo, ${user?.name} — ${user?.workshopName}`}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <StatCard label="Ordens hoje" value={ordersToday} icon="clipboard" />
        <StatCard label="Em andamento" value={inProgress} icon="wrench" />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <DashboardMetricPanel
          title="Clientes atendidos"
          subtitle="Veículos/clientes com serviço concluído no período"
          icon="users"
          mode="count"
          valueKey="clientsServed"
          previousKey="previousClientsServed"
          breakdownKey="value"
        />
        <DashboardMetricPanel
          title="Receita"
          subtitle="Soma dos serviços concluídos no período"
          icon="wallet"
          mode="currency"
          valueKey="revenue"
          previousKey="previousRevenue"
          breakdownKey="amount"
        />
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
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-muted">
                    Nenhuma ordem registrada ainda.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{order.id}</td>
                    <td className="px-5 py-3 text-foreground">{order.clientName || "—"}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FeatureList allowed={ownerFeatures} restricted={roleRestrictions.dono} />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: "clipboard" | "wrench";
}) {
  return (
    <div className="dash-stat">
      <p className="text-xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
