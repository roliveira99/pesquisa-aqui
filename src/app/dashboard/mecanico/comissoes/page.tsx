"use client";

import { useCallback, useEffect, useState } from "react";
import { DataTable, PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { StatCard } from "@/components/dashboard/StatCard";
import type { ServiceNoteRecord } from "@/types/service-note";

type Period = "day" | "week" | "month";

export default function MecanicoComissoesPage() {
  const [notes, setNotes] = useState<ServiceNoteRecord[]>([]);
  const [period, setPeriod] = useState<Period>("month");

  const load = useCallback(async () => {
    const res = await fetch(`/api/service-notes?mechanicOnly=1&period=${period}`);
    if (res.ok) {
      const data = (await res.json()) as { notes: ServiceNoteRecord[] };
      setNotes(data.notes);
    }
  }, [period]);

  useEffect(() => {
    void load();
  }, [load]);

  const commissionTotal = notes.reduce((s, n) => s + (n.commissionAmount ?? 0), 0);
  const commissionPaid = notes.filter((n) => n.commissionPaid).reduce((s, n) => s + (n.commissionAmount ?? 0), 0);
  const rate = notes[0]?.commissionRate ?? 0;

  return (
    <PermissionGuard permissions={["mecanico.consultar_comissoes"]}>
      <PageHeader
        title="Minhas comissões"
        description="Serviços realizados e valor da sua comissão — sem valores totais da oficina"
      />

      <div className="mb-4 flex gap-2">
        {(["day", "week", "month"] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            className={period === p ? "dash-metric-tab dash-metric-tab--active" : "dash-metric-tab"}
            onClick={() => setPeriod(p)}
          >
            {p === "day" ? "Hoje" : p === "week" ? "Semana" : "Mês"}
          </button>
        ))}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Comissão no período" value={`R$ ${commissionTotal.toFixed(2)}`} icon="wallet" />
        <StatCard label="Serviços no período" value={notes.length} icon="wrench" />
        <StatCard label="Já recebido" value={`R$ ${commissionPaid.toFixed(2)}`} icon="chart" />
      </div>

      <DataTable
        headers={["Nota", "Serviços realizados", "Sua comissão", "Data", "Status"]}
        rows={notes.map((n) => [
          n.id,
          n.lineItems.map((l) => l.name).join(", "),
          n.commissionAmount != null ? `R$ ${n.commissionAmount.toFixed(2)}` : "—",
          new Date(n.issuedAt).toLocaleDateString("pt-BR"),
          n.commissionPaid ? "Pago" : "Pendente",
        ])}
      />

      <p className="mt-6 text-sm text-muted">
        Taxa de comissão configurada: {rate}%. Valores individuais dos serviços e total da nota não são exibidos.
      </p>
    </PermissionGuard>
  );
}
