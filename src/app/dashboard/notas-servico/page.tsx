"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ActionButton, DataTable, PageHeader } from "@/components/dashboard/DashboardUI";
import { DocumentLineBuilder } from "@/components/dashboard/DocumentLineBuilder";
import { MechanicAssigneeSelect } from "@/components/dashboard/MechanicAssigneeSelect";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { fetchCrm } from "@/lib/api/crm-client";
import type { MechanicAssignee, MechanicKind, WorkshopServiceOrder, WorkshopVehicle } from "@/types/client";
import type { DocumentLineItem } from "@/types/document-line";
import type { ServiceNoteRecord } from "@/types/service-note";

export default function NotasServicoPage() {
  const [notes, setNotes] = useState<ServiceNoteRecord[]>([]);
  const [orders, setOrders] = useState<WorkshopServiceOrder[]>([]);
  const [vehicles, setVehicles] = useState<WorkshopVehicle[]>([]);
  const [assignees, setAssignees] = useState<MechanicAssignee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [vehicleId, setVehicleId] = useState("");
  const [lineItems, setLineItems] = useState<DocumentLineItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [mechanicId, setMechanicId] = useState("");
  const [mechanicKind, setMechanicKind] = useState<MechanicKind>("fictional");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const [crm, notesRes] = await Promise.all([
      fetchCrm(),
      fetch("/api/service-notes"),
    ]);
    setOrders(crm.orders);
    setVehicles(crm.vehicles);
    setAssignees(crm.assignees);
    if (notesRes.ok) {
      const data = (await notesRes.json()) as { notes: ServiceNoteRecord[] };
      setNotes(data.notes);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const approvedOrders = orders.filter(
    (o) => o.status === "em_andamento" || o.status === "pendente"
  );

  async function emitFromOrder(order: WorkshopServiceOrder) {
    setError("");
    const res = await fetch("/api/service-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "from-order", orderId: order.id }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!data.ok) {
      setError(data.error ?? "Não foi possível emitir a nota.");
      return;
    }
    setMessage(`Nota emitida a partir do orçamento ${order.id}. Estoque atualizado.`);
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

    setMessage("Nota de serviço emitida. Serviço registrado como realizado.");
    setShowForm(false);
    setVehicleId("");
    setLineItems([]);
    setPaymentMethods([]);
    await refresh();
  }

  return (
    <PermissionGuard
      permissions={["owner.emissao_pdf", "gerencia.emissao_notas", "gerencia.alterar_orcamentos"]}
    >
      <PageHeader
        title="Notas de serviço"
        description="Documento oficial do serviço realizado — baixa estoque, registra comissão e gera conta a receber"
        actions={
          <>
            <Link href="/dashboard/orcamentos" className="btn btn-secondary text-sm">
              Orçamentos
            </Link>
            <ActionButton
              label={showForm ? "Fechar" : "+ Nova nota"}
              variant="primary"
              onClick={() => setShowForm(!showForm)}
            />
          </>
        }
      />

      {message && <p className="dash-alert mb-4">{message}</p>}
      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      {approvedOrders.length > 0 && (
        <div className="card mb-6 p-5">
          <h3 className="mb-3 font-semibold">Converter orçamento aprovado</h3>
          <p className="mb-4 text-sm text-muted">
            Orçamentos aprovados podem virar nota na hora do pagamento — os itens são reaproveitados.
          </p>
          <DataTable
            headers={["OS", "Veículo", "Serviço", "Valor", "Ações"]}
            rows={approvedOrders.map((o) => [
              o.id,
              o.vehiclePlate ?? o.vehicle,
              o.service,
              `R$ ${o.value.toFixed(2)}`,
              <ActionButton
                key={o.id}
                label="Emitir nota"
                variant="success"
                onClick={() => void emitFromOrder(o)}
              />,
            ])}
          />
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 space-y-4 p-5">
          <h3 className="font-semibold">Nova nota de serviço</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              required
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="input-field"
            >
              <option value="">Veículo *</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate} — {v.model}
                </option>
              ))}
            </select>
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
        headers={["Nota", "Veículo", "Mecânico", "Total", "Comissão", "Status", "Data"]}
        rows={notes.map((n) => [
          n.id,
          n.vehiclePlate ?? "—",
          n.mechanicName ?? "—",
          `R$ ${n.total.toFixed(2)}`,
          n.commissionAmount != null ? `R$ ${n.commissionAmount.toFixed(2)}` : "—",
          n.commissionPaid ? (
            <span className="dash-badge">Comissão paga</span>
          ) : (
            <span className="text-xs text-muted">Comissão pendente</span>
          ),
          new Date(n.issuedAt).toLocaleDateString("pt-BR"),
        ])}
      />

      <p className="mt-4 text-sm text-muted">
        Para nota ao cliente com CNPJ (impressão/WhatsApp), use{" "}
        <Link href="/dashboard/notas" className="dash-link">
          Notas ao cliente
        </Link>
        .
      </p>
    </PermissionGuard>
  );
}
