"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ActionButton, DataTable } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import {
  MechanicAssigneeSelect,
  MechanicKindBadge,
} from "@/components/dashboard/MechanicAssigneeSelect";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { orderStatusColors, orderStatusLabels } from "@/lib/labels";
import {
  apiAssignMechanic,
  apiCreateOrder,
  apiUpdateOrderStatus,
  fetchCrm,
} from "@/lib/api/crm-client";
import { DocumentLineBuilder } from "@/components/dashboard/DocumentLineBuilder";
import type { MechanicAssignee, MechanicKind, WorkshopServiceOrder, WorkshopVehicle } from "@/types/client";
import type { DocumentLineItem } from "@/types/document-line";

export default function OrcamentosPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<WorkshopServiceOrder[]>([]);
  const [vehicles, setVehicles] = useState<WorkshopVehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [assignees, setAssignees] = useState<MechanicAssignee[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [lineItems, setLineItems] = useState<DocumentLineItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [mechanicId, setMechanicId] = useState("");
  const [mechanicKind, setMechanicKind] = useState<MechanicKind>("fictional");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isOwner = user?.role === "dono";
  const isGerencia = user?.role === "gerencia";

  const refresh = useCallback(async () => {
    const data = await fetchCrm();
    setOrders(data.orders);
    setAssignees(data.assignees);
    setVehicles(data.vehicles);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, user?.workshopId]);

  const clientVehicles = vehicles;

  async function approve(id: string) {
    await apiUpdateOrderStatus(id, "em_andamento");
    await refresh();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!vehicleId) {
      setError("Selecione o veículo. Cadastre a placa em Cadastros se necessário.");
      return;
    }
    if (lineItems.length === 0) {
      setError("Adicione ao menos um serviço ou peça ao orçamento.");
      return;
    }

    const total = lineItems.reduce((s, l) => s + l.total, 0);
    const service = lineItems.map((l) => `${l.name} (${l.quantity}x)`).join("; ");

    const result = await apiCreateOrder({
      vehicleId,
      service,
      value: total,
      lineItems,
      paymentMethods,
      mechanicId,
      mechanicKind,
      status: "pendente",
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const assignee = assignees.find((a) => a.id === mechanicId && a.kind === mechanicKind);
    setMessage(
      `Orçamento ${result.order.id} criado e atribuído a ${assignee?.name ?? result.order.mechanicName}. Perfil fictício não acessa o sistema — você gerencia daqui.`
    );
    setVehicleId("");
    setLineItems([]);
    setPaymentMethods([]);
    setMechanicId("");
    setShowForm(false);
    await refresh();
  }

  async function handleReassign(orderId: string, newMechanicId: string, kind: MechanicKind) {
    const result = await apiAssignMechanic(orderId, newMechanicId, kind);
    if (result.ok) await refresh();
  }

  return (
    <PermissionGuard
      permissions={[
        "owner.aprovar_orcamentos",
        "owner.criar_orcamento",
        "gerencia.aprovar_orcamentos",
        "gerencia.criar_orcamento",
        "gerencia.alterar_orcamentos",
      ]}
    >
      <PageHeader
        title="Orçamentos"
        description="Gestão interna (mecânico, gerência, dono). Para nota ao cliente com CNPJ, use Notas ao cliente."
        actions={
          <>
            <Link
              href="/dashboard/notas"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface-hover"
            >
              Notas ao cliente
            </Link>
            <ActionButton
              label={showForm ? "Fechar formulário" : "+ Novo orçamento"}
              variant="primary"
              onClick={() => {
                setShowForm(!showForm);
                setError("");
              }}
            />
            <ActionButton label="Nota cliente" onClick={() => window.location.assign("/dashboard/notas")} />
          </>
        }
      />

      {message && (
        <p className="dash-alert">{message}</p>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 space-y-4 p-5">
          <h3 className="font-semibold">Novo orçamento</h3>
          <p className="text-sm text-muted">
            Monte o orçamento com itens do catálogo ou avulsos. Pode ser impresso ou enviado ao cliente após aprovação.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              required
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="input-field"
            >
              <option value="">Veículo (placa) *</option>
              {clientVehicles.map((v) => (
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
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" className="btn btn-primary">
            Criar orçamento e solicitar aprovação
          </button>
        </form>
      )}

      <DataTable
        headers={["OS", "Veículo", "Serviço", "Responsável", "Valor", "Status", "Ações"]}
        rows={orders.map((o) => [
          o.id,
          o.vehiclePlate ? `${o.vehiclePlate} — ${o.vehicle}` : o.vehicle,
          o.service,
          <span key={`m-${o.id}`} className="inline-flex flex-wrap items-center gap-2">
            {o.mechanicName ?? "—"}
            <MechanicKindBadge kind={o.mechanicKind} />
          </span>,
          `R$ ${o.value}`,
          <span
            key={o.id}
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${orderStatusColors[o.status]}`}
          >
            {orderStatusLabels[o.status]}
          </span>,
          o.status === "pendente" ? (
            <div key={`act-${o.id}`} className="flex flex-wrap gap-2">
              <ActionButton label="Aprovar" variant="success" onClick={() => void approve(o.id)} />
              {(isOwner || isGerencia) && (
                <ReassignSelect
                  orderId={o.id}
                  assignees={assignees}
                  onReassign={handleReassign}
                />
              )}
            </div>
          ) : (
            <ReassignSelect orderId={o.id} assignees={assignees} onReassign={handleReassign} />
          ),
        ])}
      />

      <p className="mt-6 rounded-lg border border-border bg-surface p-4 text-sm text-muted">
        Perfis <strong>sem acesso</strong> não entram no sistema. Crie-os em Equipe sem acesso e selecione ao
        lançar o orçamento — a produtividade aparece no relatório da equipe.
      </p>
    </PermissionGuard>
  );
}

function ReassignSelect({
  orderId,
  assignees,
  onReassign,
}: {
  orderId: string;
  assignees: MechanicAssignee[];
  onReassign: (orderId: string, mechanicId: string, kind: MechanicKind) => void | Promise<void>;
}) {
  return (
    <select
      className="rounded border border-border bg-surface px-2 py-1 text-xs"
      defaultValue=""
      onChange={(e) => {
        const raw = e.target.value;
        if (!raw) return;
        const [kind, id] = raw.split(":");
        void onReassign(orderId, id, kind as MechanicKind);
        e.target.value = "";
      }}
    >
      <option value="">Reatribuir...</option>
      {assignees.map((a) => (
        <option key={`${a.kind}:${a.id}`} value={`${a.kind}:${a.id}`}>
          {a.name} {a.kind === "fictional" ? "(sem acesso)" : ""}
        </option>
      ))}
    </select>
  );
}
