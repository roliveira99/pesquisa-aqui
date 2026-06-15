"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButton, DataTable } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { MechanicKindBadge } from "@/components/dashboard/MechanicAssigneeSelect";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatCpf } from "@/lib/cpf";
import { orderStatusColors, orderStatusLabels } from "@/lib/labels";
import {
  apiAssignMechanic,
  apiCompleteOrder,
  fetchCrm,
} from "@/lib/api/crm-client";
import type { MechanicAssignee, MechanicKind, WorkshopServiceOrder } from "@/types/client";

export default function ServicosPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<WorkshopServiceOrder[]>([]);
  const [assignees, setAssignees] = useState<MechanicAssignee[]>([]);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    const data = await fetchCrm();
    setOrders(data.orders);
    setAssignees(data.assignees);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, user?.workshopId]);

  async function handleComplete(orderId: string) {
    const result = await apiCompleteOrder(orderId);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(
      `Serviço concluído — creditado a ${result.order.mechanicName}. Cliente (CPF ${formatCpf(result.order.clientCpf)}) pode avaliar no perfil.`
    );
    await refresh();
  }

  async function handleReassign(orderId: string, mechanicId: string, kind: MechanicKind) {
    const result = await apiAssignMechanic(orderId, mechanicId, kind);
    if (result.ok) {
      setMessage(`Serviço reatribuído para ${result.order.mechanicName}.`);
      await refresh();
    }
  }

  return (
    <PermissionGuard permissions={["gerencia.controle_servicos"]}>
      <PageHeader
        title="Controle de serviços"
        description="Conclua OS e reatribua entre mecânicos com login ou perfis fictícios"
        actions={
          <>
            <ActionButton label="Emitir nota" variant="primary" />
            <ActionButton label="PDF" />
            <ActionButton label="WhatsApp" />
          </>
        }
      />

      {message && (
        <p className="mb-4 rounded-lg border border-border bg-surface-hover px-4 py-3 text-sm text-muted-foreground">
          {message}
        </p>
      )}

      <DataTable
        headers={["OS", "Cliente", "Responsável", "Veículo", "Serviço", "Status", "Ações"]}
        rows={orders.map((s) => [
          s.id,
          s.clientName,
          <span key={`m-${s.id}`} className="inline-flex flex-wrap items-center gap-2">
            {s.mechanicName ?? "—"}
            <MechanicKindBadge kind={s.mechanicKind} />
          </span>,
          s.vehicle,
          s.service,
          <span
            key={`st-${s.id}`}
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${orderStatusColors[s.status]}`}
          >
            {orderStatusLabels[s.status]}
          </span>,
          s.status !== "concluido" ? (
            <div key={`act-${s.id}`} className="flex flex-wrap gap-2">
              <ActionButton
                label="Concluir"
                variant="success"
                onClick={() => void handleComplete(s.id)}
              />
              <select
                className="rounded border border-border bg-surface px-2 py-1 text-xs"
                defaultValue=""
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!raw) return;
                  const [kind, id] = raw.split(":");
                  void handleReassign(s.id, id, kind as MechanicKind);
                  e.target.value = "";
                }}
              >
                <option value="">Reatribuir...</option>
                {assignees.map((a) => (
                  <option key={`${a.kind}:${a.id}`} value={`${a.kind}:${a.id}`}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span key={`ok-${s.id}`} className="text-xs text-emerald-600">
              Concluído
            </span>
          ),
        ])}
      />
    </PermissionGuard>
  );
}
