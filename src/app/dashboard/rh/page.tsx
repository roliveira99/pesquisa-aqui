"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButton, DataTable, PageHeader, TabPanel } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import type { RhMechanicSummary, SalaryAdvanceRecord } from "@/lib/db/rh";

type Period = "day" | "week" | "month";

export default function RhPage() {
  const [tab, setTab] = useState("salarios");
  const [summaries, setSummaries] = useState<RhMechanicSummary[]>([]);
  const [advances, setAdvances] = useState<SalaryAdvanceRecord[]>([]);
  const [period, setPeriod] = useState<Period>("month");
  const [selectedMechanic, setSelectedMechanic] = useState<RhMechanicSummary | null>(null);
  const [mechanicNotes, setMechanicNotes] = useState<
    { id: string; lineItems: { name: string }[]; commissionAmount: number | null; commissionPaid: boolean; issuedAt: string }[]
  >([]);
  const [advanceForm, setAdvanceForm] = useState({ amount: "", date: "", notes: "" });

  const refresh = useCallback(async () => {
    const res = await fetch("/api/rh");
    if (res.ok) {
      const data = (await res.json()) as {
        mechanicSummaries: RhMechanicSummary[];
        advances: SalaryAdvanceRecord[];
      };
      setSummaries(data.mechanicSummaries);
      setAdvances(data.advances);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (selectedMechanic) void loadMechanicNotes(selectedMechanic);
  }, [period, selectedMechanic]);

  async function loadMechanicNotes(m: RhMechanicSummary) {
    const res = await fetch(
      `/api/rh?mechanicId=${encodeURIComponent(m.mechanicId)}&mechanicKind=${m.mechanicKind}&period=${period}`
    );
    if (res.ok) {
      const data = (await res.json()) as { notes: typeof mechanicNotes };
      setMechanicNotes(data.notes);
    }
  }

  async function saveCompensation(m: RhMechanicSummary, salary: number, commissionRate: number) {
    await fetch("/api/rh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert-compensation",
        userId: m.mechanicKind === "platform" ? m.mechanicId : undefined,
        fictionalMechanicId: m.mechanicKind === "fictional" ? m.mechanicId : undefined,
        salary,
        commissionRate,
      }),
    });
    await refresh();
  }

  async function addAdvance(m: RhMechanicSummary) {
    if (!advanceForm.amount || !advanceForm.date) return;
    await fetch("/api/rh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add-advance",
        userId: m.mechanicKind === "platform" ? m.mechanicId : undefined,
        fictionalMechanicId: m.mechanicKind === "fictional" ? m.mechanicId : undefined,
        amount: Number(advanceForm.amount),
        date: advanceForm.date,
        notes: advanceForm.notes,
      }),
    });
    setAdvanceForm({ amount: "", date: "", notes: "" });
    await refresh();
  }

  async function toggleCommissionPaid(noteId: string, paid: boolean) {
    await fetch("/api/rh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "commission-paid", noteId, paid }),
    });
    if (selectedMechanic) await loadMechanicNotes(selectedMechanic);
    await refresh();
  }

  const tabs = [
    {
      id: "salarios",
      label: "Salários e comissões",
      content: (
        <DataTable
          headers={["Mecânico", "Salário", "Taxa %", "Notas", "Comissão pend.", "Vales", "A receber", "Ações"]}
          rows={summaries.map((m) => [
            m.name,
            `R$ ${m.salary.toFixed(2)}`,
            `${m.commissionRate}%`,
            m.notesCount,
            `R$ ${m.commissionPending.toFixed(2)}`,
            `R$ ${m.advancesTotal.toFixed(2)}`,
            `R$ ${m.netToReceive.toFixed(2)}`,
            <ActionButton key={m.mechanicId} label="Detalhar" onClick={() => setSelectedMechanic(m)} />,
          ])}
        />
      ),
    },
    {
      id: "vales",
      label: "Vales (adiantamentos)",
      content: (
        <div className="space-y-4">
          <DataTable
            headers={["Mecânico", "Valor", "Data", "Obs."]}
            rows={advances.map((a) => [
              a.employeeName,
              `R$ ${a.amount.toFixed(2)}`,
              new Date(a.date).toLocaleDateString("pt-BR"),
              a.notes ?? "—",
            ])}
          />
        </div>
      ),
    },
  ];

  return (
    <PermissionGuard permissions={["owner.salarios", "owner.comissoes", "owner.ponto"]}>
      <PageHeader
        title="Recursos Humanos"
        description="Salários, comissões por nota, vales e status de pagamento"
        actions={
          <LinkButton href="/dashboard/permissoes" label="Permissões da gerência" />
        }
      />

      <TabPanel tabs={tabs} activeTab={tab} onTabChange={setTab} />

      {selectedMechanic && (
        <div className="card mt-6 space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">Histórico — {selectedMechanic.name}</h3>
            <div className="flex gap-2">
              {(["day", "week", "month"] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={period === p ? "dash-metric-tab dash-metric-tab--active" : "dash-metric-tab"}
                  onClick={() => setPeriod(p)}
                >
                  {p === "day" ? "Dia" : p === "week" ? "Semana" : "Mês"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="number"
              className="input-field"
              placeholder="Salário (R$)"
              defaultValue={selectedMechanic.salary}
              onBlur={(e) =>
                void saveCompensation(
                  selectedMechanic,
                  Number(e.target.value),
                  selectedMechanic.commissionRate
                )
              }
            />
            <input
              type="number"
              className="input-field"
              placeholder="Comissão %"
              defaultValue={selectedMechanic.commissionRate}
              onBlur={(e) =>
                void saveCompensation(
                  selectedMechanic,
                  selectedMechanic.salary,
                  Number(e.target.value)
                )
              }
            />
            <p className="self-center text-sm text-muted">
              A receber: <strong>R$ {selectedMechanic.netToReceive.toFixed(2)}</strong>
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-4">
            <input
              type="number"
              className="input-field"
              placeholder="Valor do vale"
              value={advanceForm.amount}
              onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
            />
            <input
              type="date"
              className="input-field"
              value={advanceForm.date}
              onChange={(e) => setAdvanceForm({ ...advanceForm, date: e.target.value })}
            />
            <input
              className="input-field"
              placeholder="Observação"
              value={advanceForm.notes}
              onChange={(e) => setAdvanceForm({ ...advanceForm, notes: e.target.value })}
            />
            <ActionButton
              label="Registrar vale"
              variant="primary"
              onClick={() => void addAdvance(selectedMechanic)}
            />
          </div>

          <DataTable
            headers={["Nota", "Serviços", "Comissão", "Data", "Pagamento"]}
            rows={mechanicNotes.map((n) => [
              n.id,
              n.lineItems.map((l) => l.name).join(", "),
              n.commissionAmount != null ? `R$ ${n.commissionAmount.toFixed(2)}` : "—",
              new Date(n.issuedAt).toLocaleDateString("pt-BR"),
              n.commissionPaid ? (
                <span className="dash-badge">Pago</span>
              ) : (
                <ActionButton
                  label="Marcar pago"
                  variant="success"
                  onClick={() => void toggleCommissionPaid(n.id, true)}
                />
              ),
            ])}
          />
        </div>
      )}
    </PermissionGuard>
  );
}

function LinkButton({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="btn btn-secondary text-sm">
      {label}
    </a>
  );
}
