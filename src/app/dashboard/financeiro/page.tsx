"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButton, DataTable, PageHeader, TabPanel } from "@/components/dashboard/DashboardUI";
import { DashboardMetricPanel } from "@/components/dashboard/DashboardMetricPanel";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import type { FinancialEntryRecord } from "@/types/finance";

export default function FinanceiroPage() {
  const [tab, setTab] = useState("panorama");
  const [overview, setOverview] = useState<{
    revenueFromNotes: number;
    commissionsPaid: number;
    commissionsPending: number;
    receivablesOpen: number;
    payablesOpen: number;
    receivablesPaid: number;
    payablesPaid: number;
    balance: number;
    entries: FinancialEntryRecord[];
  } | null>(null);
  const [periodFilter, setPeriodFilter] = useState<"day" | "week" | "month" | "all">("month");
  const [form, setForm] = useState({
    kind: "pagar" as "pagar" | "receber",
    name: "",
    amount: "",
    dueAt: "",
  });

  const refresh = useCallback(async () => {
    const res = await fetch("/api/finance");
    if (res.ok) setOverview(await res.json());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function createEntry(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        kind: form.kind,
        name: form.name,
        amount: Number(form.amount),
        dueAt: form.dueAt || undefined,
      }),
    });
    setForm({ kind: "pagar", name: "", amount: "", dueAt: "" });
    await refresh();
  }

  async function markPaid(entryId: string) {
    await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-paid", entryId, paid: true }),
    });
    await refresh();
  }

  function inPeriod(dueAt: string | null): boolean {
    if (periodFilter === "all") return true;
    if (!dueAt) return false;
    const d = new Date(dueAt);
    const now = new Date();
    if (periodFilter === "day") {
      return d.toDateString() === now.toDateString();
    }
    if (periodFilter === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay() + 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return d >= start && d <= end;
    }
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }

  const filteredEntries = overview?.entries.filter((e) => inPeriod(e.dueAt)) ?? [];
  const receber = filteredEntries.filter((e) => e.kind === "receber");
  const pagar = filteredEntries.filter((e) => e.kind === "pagar");

  const tabs = [
    {
      id: "panorama",
      label: "Panorama",
      content: (
        <div>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <Stat label="Faturamento (notas)" value={`R$ ${(overview?.revenueFromNotes ?? 0).toLocaleString("pt-BR")}`} />
            <Stat label="Comissões pagas" value={`R$ ${(overview?.commissionsPaid ?? 0).toLocaleString("pt-BR")}`} />
            <Stat label="A receber (aberto)" value={`R$ ${(overview?.receivablesOpen ?? 0).toLocaleString("pt-BR")}`} />
            <Stat label="A pagar (aberto)" value={`R$ ${(overview?.payablesOpen ?? 0).toLocaleString("pt-BR")}`} />
            <Stat label="Recebido (pago)" value={`R$ ${(overview?.receivablesPaid ?? 0).toLocaleString("pt-BR")}`} />
            <Stat label="Pago" value={`R$ ${(overview?.payablesPaid ?? 0).toLocaleString("pt-BR")}`} />
          </div>
          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <DashboardMetricPanel
              title="Receita operacional"
              subtitle="Notas de serviço emitidas"
              icon="wallet"
              mode="currency"
              valueKey="revenue"
              previousKey="previousRevenue"
              breakdownKey="amount"
            />
          </div>
        </div>
      ),
    },
    {
      id: "pagar",
      label: "Contas a pagar",
      content: (
        <div>
          <PeriodFilter value={periodFilter} onChange={setPeriodFilter} />
          <DataTable
          headers={["Nome", "Valor", "Vencimento", "Status", "Ações"]}
          rows={pagar.map((e) => [
            e.name,
            `R$ ${e.amount.toFixed(2)}`,
            e.dueAt ? new Date(e.dueAt).toLocaleDateString("pt-BR") : "—",
            e.paid ? "Pago" : "Pendente",
            !e.paid ? (
              <ActionButton key={e.id} label="Marcar pago" variant="primary" onClick={() => void markPaid(e.id)} />
            ) : (
              "—"
            ),
          ])}
        />
        </div>
      ),
    },
    {
      id: "receber",
      label: "Contas a receber",
      content: (
        <div>
          <PeriodFilter value={periodFilter} onChange={setPeriodFilter} />
          <DataTable
          headers={["Nome", "Valor", "Vencimento", "Status", "Ações"]}
          rows={receber.map((e) => [
            e.name,
            `R$ ${e.amount.toFixed(2)}`,
            e.dueAt ? new Date(e.dueAt).toLocaleDateString("pt-BR") : "—",
            e.paid ? "Recebido" : "Pendente",
            !e.paid ? (
              <ActionButton key={e.id} label="Receber" variant="success" onClick={() => void markPaid(e.id)} />
            ) : (
              "—"
            ),
          ])}
        />
        </div>
      ),
    },
    {
      id: "novo",
      label: "Novo lançamento",
      content: (
        <form onSubmit={createEntry} className="card max-w-lg space-y-3 p-5">
          <select
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value as "pagar" | "receber" })}
            className="input-field"
          >
            <option value="pagar">Conta a pagar</option>
            <option value="receber">Conta a receber</option>
          </select>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            placeholder="Nome (ex.: Aluguel, Cliente X)"
          />
          <input
            required
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="input-field"
            placeholder="Valor (R$)"
          />
          <input
            type="datetime-local"
            value={form.dueAt}
            onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
            className="input-field"
          />
          <p className="text-xs text-muted">Lembretes com 1 dia de antecedência e no dia do vencimento (em breve por e-mail/notificação).</p>
          <button type="submit" className="btn btn-primary">Cadastrar</button>
        </form>
      ),
    },
  ];

  return (
    <PermissionGuard permissions={["owner.fluxo_caixa", "owner.contas_pagar", "owner.contas_receber"]}>
      <PageHeader
        title="Financeiro"
        description="Panorama da oficina, comissões deduzidas e contas personalizadas"
      />
      <TabPanel tabs={tabs} activeTab={tab} onTabChange={setTab} />
    </PermissionGuard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="dash-stat">
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

function PeriodFilter({
  value,
  onChange,
}: {
  value: "day" | "week" | "month" | "all";
  onChange: (v: "day" | "week" | "month" | "all") => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {(
        [
          ["day", "Dia"],
          ["week", "Semana"],
          ["month", "Mês"],
          ["all", "Todos"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`rounded-lg px-3 py-1.5 text-sm ${value === id ? "bg-accent text-accent-fg" : "border border-border"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
