"use client";

import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { FeatureList, PageHeader } from "@/components/dashboard/DashboardUI";
import { pendingWorkshops, subscriptions, supportTickets } from "@/data/admin";
import { workshops } from "@/data/workshops";
import { roleRestrictions } from "@/lib/permissions";

const masterFeatures = [
  "Aprovar ou reprovar oficinas",
  "Criar contas e acessos",
  "Visualizar todas as oficinas",
  "Relatórios globais",
  "Dashboard geral",
  "Controle financeiro das assinaturas",
  "Bloquear ou suspender oficinas",
  "Definir planos e recursos",
  "Suporte administrativo",
];

export function AdminHome() {
  const pending = pendingWorkshops.filter((w) => w.status === "pendente").length;
  const active = subscriptions.filter((s) => s.status === "ativa").length;
  const overdue = subscriptions.filter((s) => s.status === "atrasada").length;
  const openTickets = supportTickets.filter((t) => t.status !== "resolvido").length;

  return (
    <div>
      <PageHeader
        title="Dashboard geral"
        description="Visão global da plataforma MP Oficinas"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Oficinas cadastradas" value={workshops.length} icon="building" />
        <StatCard label="Aguardando aprovação" value={pending} icon="clipboard" trend="Requer ação" trendPositive={false} />
        <StatCard label="Assinaturas ativas" value={active} icon="credit-card" />
        <StatCard label="Inadimplentes" value={overdue} icon="wallet" trend={`${openTickets} tickets`} trendPositive={false} />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Oficinas pendentes</h2>
            <Link href="/dashboard/admin/oficinas" className="text-sm font-medium text-accent hover:text-accent-hover">
              Gerenciar
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {pendingWorkshops.filter((w) => w.status === "pendente").map((w) => (
              <li key={w.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{w.name}</p>
                  <p className="text-muted">{w.city}/{w.state}</p>
                </div>
                <span className="rounded-md bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
                  Pendente
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Assinaturas em atraso</h2>
            <Link href="/dashboard/admin/assinaturas" className="text-sm font-medium text-accent hover:text-accent-hover">
              Ver financeiro
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {subscriptions.filter((s) => s.status === "atrasada" || s.status === "suspensa").map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{s.workshopName}</p>
                  <p className="text-muted">R$ {s.value}/mês — {s.plan}</p>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                  s.status === "atrasada" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning"
                }`}>
                  {s.status === "atrasada" ? "Atrasada" : "Suspensa"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <FeatureList allowed={masterFeatures} restricted={roleRestrictions.master} />
    </div>
  );
}
