"use client";

import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { StatCard } from "@/components/dashboard/StatCard";

export default function MecanicoProdutividadePage() {
  return (
    <PermissionGuard permissions={["mecanico.consultar_produtividade"]}>
      <PageHeader
        title="Minha produtividade"
        description="Indicadores de desempenho individual"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Produtividade geral" value="94%" icon="chart" trend="+3% vs mês anterior" />
        <StatCard label="Serviços concluídos" value={18} icon="wrench" />
        <StatCard label="Tempo médio/OS" value="1h 52min" icon="calendar" />
        <StatCard label="Avaliação clientes" value="4.9" icon="star" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-semibold">Serviços por semana</h2>
          <ul className="space-y-3">
            {[
              { semana: "Sem 1", qtd: 5 },
              { semana: "Sem 2", qtd: 4 },
              { semana: "Sem 3", qtd: 5 },
              { semana: "Sem 4", qtd: 4 },
            ].map((w) => (
              <li key={w.semana} className="flex items-center gap-3">
                <span className="w-16 text-sm text-muted">{w.semana}</span>
                <div className="h-2 flex-1 rounded-full bg-background">
                  <div
                    className="h-2 rounded-full bg-border-strong"
                    style={{ width: `${(w.qtd / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{w.qtd}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-semibold">Tipos de serviço</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Manutenção preventiva</span><span>8</span></li>
            <li className="flex justify-between"><span>Freios e suspensão</span><span>5</span></li>
            <li className="flex justify-between"><span>Diagnóstico</span><span>3</span></li>
            <li className="flex justify-between"><span>Outros</span><span>2</span></li>
          </ul>
        </div>
      </div>
    </PermissionGuard>
  );
}
