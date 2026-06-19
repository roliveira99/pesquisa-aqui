"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButton, DataTable, PageHeader } from "@/components/dashboard/DashboardUI";
import { DocumentLineBuilder } from "@/components/dashboard/DocumentLineBuilder";
import { MechanicAssigneeSelect } from "@/components/dashboard/MechanicAssigneeSelect";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  buildBudgetPrintHtml,
  buildBudgetShareText,
  printDocument,
  shareViaEmail,
  shareViaWhatsApp,
} from "@/lib/document-share";
import { apiAddVehicle, fetchCrm } from "@/lib/api/crm-client";
import type { BudgetRecord } from "@/types/budget";
import type { MechanicAssignee, MechanicKind, WorkshopVehicle } from "@/types/client";
import type { DocumentLineItem } from "@/types/document-line";
import type { ServiceNoteRecord } from "@/types/service-note";

export default function NotasServicoPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<ServiceNoteRecord[]>([]);
  const [approvedBudgets, setApprovedBudgets] = useState<BudgetRecord[]>([]);
  const [vehicles, setVehicles] = useState<WorkshopVehicle[]>([]);
  const [assignees, setAssignees] = useState<MechanicAssignee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vehicleId, setVehicleId] = useState("");
  const [newPlate, setNewPlate] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newYear, setNewYear] = useState("");
  const [lineItems, setLineItems] = useState<DocumentLineItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [mechanicId, setMechanicId] = useState("");
  const [mechanicKind, setMechanicKind] = useState<MechanicKind>("fictional");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const [crm, notesRes, budgetsRes] = await Promise.all([
      fetchCrm(),
      fetch("/api/service-notes"),
      fetch("/api/budgets?status=aprovado"),
    ]);
    setVehicles(crm.vehicles);
    setAssignees(crm.assignees);
    if (notesRes.ok) {
      const data = (await notesRes.json()) as { notes: ServiceNoteRecord[] };
      setNotes(data.notes);
    }
    if (budgetsRes.ok) {
      const data = (await budgetsRes.json()) as { budgets: BudgetRecord[] };
      setApprovedBudgets(data.budgets.filter((b) => !b.serviceNoteId));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function emitFromBudget(budgetId: string) {
    setError("");
    const res = await fetch("/api/service-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "from-budget", budgetId }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!data.ok) {
      setError(data.error ?? "Não foi possível emitir a nota.");
      return;
    }
    setMessage("Nota emitida a partir do orçamento aprovado.");
    await refresh();
  }

  async function handleAddVehicle(e: React.FormEvent) {
    e.preventDefault();
    const result = await apiAddVehicle({ plate: newPlate, model: newModel, year: newYear || undefined });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setVehicleId(result.vehicle.id);
    setNewPlate("");
    setNewModel("");
    setNewYear("");
    setShowVehicleForm(false);
    await refresh();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const assignee = assignees.find((a) => a.id === mechanicId && a.kind === mechanicKind);
    if (!vehicleId || !assignee || lineItems.length === 0) {
      setError("Preencha veículo, mecânico e itens.");
      return;
    }

    const res = await fetch("/api/service-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        vehicleId,
        lineItems,
        paymentMethods,
        mechanicId,
        mechanicKind,
        mechanicName: assignee.name,
      }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!data.ok) {
      setError(data.error ?? "Erro ao emitir nota.");
      return;
    }

    setMessage("Nota de serviço emitida.");
    setShowForm(false);
    setVehicleId("");
    setLineItems([]);
    setPaymentMethods([]);
    await refresh();
  }

  function sendNote(n: ServiceNoteRecord, channel: "whatsapp" | "email" | "print") {
    const text = buildBudgetShareText({
      id: n.id,
      workshopName: user?.workshopName ?? "Oficina",
      vehiclePlate: n.vehiclePlate,
      vehicleModel: n.vehicleModel,
      lineItems: n.lineItems,
      total: n.total,
    }).replace("Orçamento", "Nota de serviço");
    if (channel === "whatsapp") shareViaWhatsApp(text);
    else if (channel === "email") shareViaEmail(`Nota de serviço ${n.id}`, text);
    else printDocument(`Nota ${n.id}`, buildBudgetPrintHtml({
      id: n.id,
      workshopName: user?.workshopName ?? "Oficina",
      vehiclePlate: n.vehiclePlate,
      vehicleModel: n.vehicleModel,
      lineItems: n.lineItems,
      total: n.total,
    }).replace("Orçamento", "Nota de serviço"));
  }

  return (
    <PermissionGuard permissions={["owner.emissao_pdf", "gerencia.emissao_notas"]}>
      <PageHeader
        title="Notas de serviço"
        description="Documento oficial do serviço realizado — entra no financeiro, comissão do mecânico e baixa de estoque"
        actions={
          <ActionButton
            label={showForm ? "Fechar" : "+ Nova nota"}
            variant="primary"
            onClick={() => setShowForm(!showForm)}
          />
        }
      />

      {message && <p className="dash-alert mb-4">{message}</p>}
      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      {approvedBudgets.length > 0 && (
        <div className="card mb-6 p-5">
          <h3 className="mb-3 font-semibold">Orçamentos aprovados</h3>
          <p className="mb-4 text-sm text-muted">
            Converta orçamentos aceitos pelo cliente em nota de serviço.
          </p>
          <DataTable
            headers={["ID", "Veículo", "Total", "Mecânico", "Ações"]}
            rows={approvedBudgets.map((b) => [
              b.id.slice(-8).toUpperCase(),
              b.vehiclePlate ?? "—",
              `R$ ${b.total.toFixed(2)}`,
              b.mechanicName ?? "—",
              <ActionButton
                key={b.id}
                label="Emitir nota"
                variant="success"
                onClick={() => void emitFromBudget(b.id)}
              />,
            ])}
          />
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 space-y-4 p-5">
          <h3 className="font-semibold">Nova nota de serviço</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <select
                required
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="input-field w-full"
              >
                <option value="">Veículo *</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate} — {v.model}{v.year ? ` (${v.year})` : ""}
                  </option>
                ))}
              </select>
              <ActionButton
                label={showVehicleForm ? "Cancelar cadastro" : "+ Cadastrar veículo"}
                variant="secondary"
                onClick={() => setShowVehicleForm(!showVehicleForm)}
              />
            </div>
            <MechanicAssigneeSelect
              assignees={assignees}
              value={mechanicId}
              kind={mechanicKind}
              onChange={(id, kind) => {
                setMechanicId(id);
                setMechanicKind(kind);
              }}
              required
            />
          </div>

          {showVehicleForm && (
            <div className="rounded-lg border border-border p-4">
              <p className="mb-2 text-sm font-medium">Cadastro rápido de veículo</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <input required value={newPlate} onChange={(e) => setNewPlate(e.target.value.toUpperCase())} className="input-field" placeholder="Placa" />
                <input required value={newModel} onChange={(e) => setNewModel(e.target.value)} className="input-field" placeholder="Modelo" />
                <input value={newYear} onChange={(e) => setNewYear(e.target.value)} className="input-field" placeholder="Ano" />
              </div>
              <button type="button" onClick={(e) => void handleAddVehicle(e)} className="btn btn-secondary mt-2 text-sm">
                Salvar veículo
              </button>
            </div>
          )}

          <DocumentLineBuilder
            lineItems={lineItems}
            onChange={setLineItems}
            paymentMethods={paymentMethods}
            onPaymentMethodsChange={setPaymentMethods}
          />
          <button type="submit" className="btn btn-primary">
            Emitir nota e concluir serviço
          </button>
        </form>
      )}

      <DataTable
        headers={["Nota", "Veículo", "Mecânico", "Total", "Comissão", "Data", "Enviar"]}
        rows={notes.map((n) => [
          n.id.slice(-8).toUpperCase(),
          n.vehiclePlate ?? "—",
          n.mechanicName ?? "—",
          `R$ ${n.total.toFixed(2)}`,
          n.commissionAmount != null ? `R$ ${n.commissionAmount.toFixed(2)}` : "—",
          new Date(n.issuedAt).toLocaleDateString("pt-BR"),
          <div key={`send-${n.id}`} className="flex flex-wrap gap-1">
            <ActionButton label="WhatsApp" onClick={() => sendNote(n, "whatsapp")} />
            <ActionButton label="E-mail" onClick={() => sendNote(n, "email")} />
            <ActionButton label="Imprimir" onClick={() => sendNote(n, "print")} />
          </div>,
        ])}
      />
    </PermissionGuard>
  );
}
