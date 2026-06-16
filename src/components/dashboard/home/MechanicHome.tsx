"use client";

import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { FeatureList, PageHeader } from "@/components/dashboard/DashboardUI";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/components/auth/AuthProvider";
import { roleRestrictions } from "@/lib/permissions";

const mecanicoFeatures = [
  "Criar orçamento",
  "Registrar serviços e peças utilizadas",
  "Consultar histórico dos próprios serviços",
  "Consultar comissões e produtividade",
  "Solicitar alteração de orçamento",
  "Registrar fotos do veículo",
  "Atualizar status do serviço",
];

const myServices = [
  { id: "OS-002", vehicle: "Toyota Corolla 2019", service: "Alinhamento", status: "Em andamento" },
  { id: "OS-006", vehicle: "Honda CG 160", service: "Revisão completa", status: "Pendente" },
  { id: "OS-007", vehicle: "VW Polo 2021", service: "Troca de pastilhas", status: "Concluído" },
];

export function MechanicHome() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title="Meu painel" description={`${user?.name} — Mecânico`} />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Serviços hoje" value={3} icon="wrench" />
        <StatCard label="Orçamentos (mês)" value={12} icon="clipboard" trend="Este mês" />
        <StatCard label="Comissões (mês)" value="R$ 1.840" icon="wallet" />
        <StatCard label="Produtividade" value="94%" icon="chart" trend="+3%" />
      </div>

      <div className="card mb-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Serviços ativos</h2>
          <Link href="/dashboard/mecanico/servicos" className="dash-link text-sm font-medium">
            Ver todos
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {myServices.map((s) => (
            <li key={s.id} className="flex items-center justify-between px-5 py-4 text-sm">
              <div>
                <p className="font-medium text-foreground">{s.id} — {s.vehicle}</p>
                <p className="text-muted">{s.service}</p>
              </div>
              <span className="dash-badge">{s.status}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/mecanico/orcamentos" className="card card-hover p-5">
          <div className="dash-icon-box mb-3">
            <Icon name="clipboard" className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-foreground">Novo orçamento</h3>
          <p className="mt-1 text-sm text-muted">Criar proposta para cliente</p>
        </Link>
        <Link href="/dashboard/mecanico/produtividade" className="card card-hover p-5">
          <div className="dash-icon-box mb-3">
            <Icon name="chart" className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-foreground">Produtividade</h3>
          <p className="mt-1 text-sm text-muted">Acompanhar desempenho</p>
        </Link>
      </div>

      <FeatureList allowed={mecanicoFeatures} restricted={roleRestrictions.mecanico} />
    </div>
  );
}
