"use client";

import Link from "next/link";
import { DashboardMetricPanel } from "@/components/dashboard/DashboardMetricPanel";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/components/auth/AuthProvider";

const quickLinks = [
  { href: "/dashboard/orcamentos", label: "Orçamentos", desc: "Aprovar e alterar", icon: "file" as const },
  { href: "/dashboard/agenda", label: "Agenda", desc: "Agendamentos do dia", icon: "calendar" as const },
  { href: "/dashboard/estoque", label: "Estoque", desc: "Entrada e saída", icon: "box" as const },
];

export function ManagerHome() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title="Dashboard operacional"
        description={`${user?.name} — ${user?.workshopName}`}
      />

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <DashboardMetricPanel
          title="Clientes atendidos"
          subtitle="Atendimentos concluídos no período"
          icon="users"
          mode="count"
          valueKey="clientsServed"
          previousKey="previousClientsServed"
          breakdownKey="value"
        />
        <DashboardMetricPanel
          title="Receita"
          subtitle="Faturamento de serviços concluídos"
          icon="wallet"
          mode="currency"
          valueKey="revenue"
          previousKey="previousRevenue"
          breakdownKey="amount"
        />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {quickLinks.map((item) => (
          <Link key={item.href} href={item.href} className="card card-hover p-5">
            <div className="dash-icon-box mb-3">
              <Icon name={item.icon} className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground">{item.label}</h3>
            <p className="mt-1 text-sm text-muted">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
