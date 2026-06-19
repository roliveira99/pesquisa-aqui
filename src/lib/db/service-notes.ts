import { prisma } from "@/lib/db/prisma";
import type { DocumentLineItem } from "@/types/document-line";
import type { ServiceNoteRecord } from "@/types/service-note";
import type { MechanicKind } from "@/types/client";

export type { ServiceNoteRecord };

function mapNote(row: {
  id: string;
  workshopId: string;
  vehicleId: string;
  clientId: string | null;
  budgetId: string | null;
  status: string;
  lineItems: unknown;
  paymentMethods: unknown;
  subtotal: number;
  total: number;
  mechanicId: string | null;
  mechanicKind: MechanicKind | null;
  mechanicName: string | null;
  commissionRate: number | null;
  commissionAmount: number | null;
  commissionPaid: boolean;
  commissionPaidAt: Date | null;
  issuedAt: Date;
}): ServiceNoteRecord {
  return {
    id: row.id,
    workshopId: row.workshopId,
    vehicleId: row.vehicleId,
    clientId: row.clientId,
    budgetId: row.budgetId,
    orderId: row.budgetId,
    status: row.status as ServiceNoteRecord["status"],
    lineItems: (row.lineItems ?? []) as DocumentLineItem[],
    paymentMethods: (row.paymentMethods ?? []) as string[],
    subtotal: row.subtotal,
    total: row.total,
    mechanicId: row.mechanicId,
    mechanicKind: row.mechanicKind,
    mechanicName: row.mechanicName,
    commissionRate: row.commissionRate,
    commissionAmount: row.commissionAmount,
    commissionPaid: row.commissionPaid,
    commissionPaidAt: row.commissionPaidAt?.toISOString() ?? null,
    issuedAt: row.issuedAt.toISOString(),
  };
}

async function resolveCommission(
  workshopId: string,
  mechanicId: string | null,
  mechanicKind: MechanicKind | null,
  total: number
): Promise<{ rate: number; amount: number }> {
  if (!mechanicId || !mechanicKind) return { rate: 0, amount: 0 };

  const comp = await prisma.employeeCompensation.findFirst({
    where: {
      workshopId,
      ...(mechanicKind === "platform" ? { userId: mechanicId } : { fictionalMechanicId: mechanicId }),
    },
  });

  const rate = comp?.commissionRate ?? 8;
  return { rate, amount: Math.round(total * (rate / 100) * 100) / 100 };
}

export async function listServiceNotes(
  workshopId: string,
  filters?: {
    mechanicId?: string;
    mechanicKind?: MechanicKind;
    from?: Date;
    to?: Date;
    period?: "day" | "week" | "month";
  }
): Promise<ServiceNoteRecord[]> {
  let from = filters?.from;
  let to = filters?.to;
  const now = new Date();
  if (filters?.period === "day") {
    from = new Date(now.setHours(0, 0, 0, 0));
    to = new Date();
  } else if (filters?.period === "week") {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    d.setHours(0, 0, 0, 0);
    from = d;
    to = new Date();
  } else if (filters?.period === "month") {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
    to = new Date();
  }

  const rows = await prisma.serviceNote.findMany({
    where: {
      workshopId,
      ...(filters?.mechanicId
        ? { mechanicId: filters.mechanicId, mechanicKind: filters.mechanicKind }
        : {}),
      ...(from && to ? { issuedAt: { gte: from, lte: to } } : {}),
    },
    orderBy: { issuedAt: "desc" },
  });

  const vehicles = await prisma.crmVehicle.findMany({
    where: { workshopId, id: { in: rows.map((r) => r.vehicleId) } },
  });
  const clients = await prisma.crmClient.findMany({
    where: { workshopId, id: { in: rows.map((r) => r.clientId).filter(Boolean) as string[] } },
  });

  return rows.map((row) => {
    const note = mapNote(row);
    const vehicle = vehicles.find((v) => v.id === row.vehicleId);
    const client = clients.find((c) => c.id === row.clientId);
    return {
      ...note,
      vehiclePlate: vehicle?.plate,
      vehicleModel: vehicle?.model,
      clientName: client?.name,
    };
  });
}

export async function createServiceNote(
  workshopId: string,
  input: {
    vehicleId: string;
    lineItems: DocumentLineItem[];
    paymentMethods?: string[];
    mechanicId: string;
    mechanicKind: MechanicKind;
    mechanicName: string;
    orderId?: string;
    clientId?: string;
  }
): Promise<{ ok: true; note: ServiceNoteRecord } | { ok: false; error: string }> {
  const vehicle = await prisma.crmVehicle.findFirst({
    where: { id: input.vehicleId, workshopId },
  });
  if (!vehicle) return { ok: false, error: "Veículo não encontrado." };
  if (input.lineItems.length === 0) return { ok: false, error: "Adicione itens à nota." };

  const subtotal = input.lineItems.reduce((s, l) => s + l.total, 0);
  const total = subtotal;
  const { rate, amount } = await resolveCommission(
    workshopId,
    input.mechanicId,
    input.mechanicKind,
    total
  );

  const note = await prisma.$transaction(async (tx) => {
    const created = await tx.serviceNote.create({
      data: {
        workshopId,
        vehicleId: input.vehicleId,
        clientId: input.clientId ?? vehicle.clientId,
        budgetId: input.orderId ?? null,
        status: "emitida",
        lineItems: input.lineItems as object,
        paymentMethods: (input.paymentMethods ?? []) as object,
        subtotal,
        total,
        mechanicId: input.mechanicId,
        mechanicKind: input.mechanicKind,
        mechanicName: input.mechanicName,
        commissionRate: rate,
        commissionAmount: amount,
        stockDeducted: true,
      },
    });

    for (const line of input.lineItems) {
      if (line.kind !== "peca" || !line.catalogItemId) continue;
      const stock = await tx.stockItem.findFirst({
        where: { workshopId, catalogItemId: line.catalogItemId },
      });
      if (stock) {
        await tx.stockItem.update({
          where: { id: stock.id },
          data: { quantity: Math.max(0, stock.quantity - line.quantity) },
        });
      }
    }

    if (input.orderId) {
      await tx.crmServiceOrder.updateMany({
        where: { id: input.orderId, workshopId },
        data: { status: "concluido" },
      });
    }

    await tx.financialEntry.create({
      data: {
        workshopId,
        kind: "receber",
        name: `Nota ${created.id}`,
        amount: total,
        dueAt: new Date(),
        serviceNoteId: created.id,
      },
    });

    return created;
  });

  return { ok: true, note: mapNote(note) };
}

export async function createServiceNoteFromOrder(
  workshopId: string,
  orderId: string,
  lineItems?: DocumentLineItem[],
  paymentMethods?: string[]
): Promise<{ ok: true; note: ServiceNoteRecord } | { ok: false; error: string }> {
  const order = await prisma.crmServiceOrder.findFirst({ where: { id: orderId, workshopId } });
  if (!order) return { ok: false, error: "Orçamento não encontrado." };
  if (order.status !== "em_andamento" && order.status !== "pendente") {
    return { ok: false, error: "Só é possível emitir nota de orçamentos aprovados ou em andamento." };
  }
  if (!order.vehicleId || !order.mechanicId || !order.mechanicKind) {
    return { ok: false, error: "Orçamento incompleto (veículo ou mecânico)." };
  }

  const storedLines = order.lineItems as unknown as DocumentLineItem[] | null;
  const items =
    lineItems ??
    (storedLines?.length
      ? storedLines
      : [
          {
            id: `line-${order.id}`,
            name: order.service,
            kind: "servico" as const,
            quantity: 1,
            unitPrice: order.value,
            total: order.value,
          },
        ]);

  return createServiceNote(workshopId, {
    vehicleId: order.vehicleId,
    lineItems: items,
    paymentMethods: paymentMethods ?? ((order.paymentMethods as string[]) ?? []),
    mechanicId: order.mechanicId,
    mechanicKind: order.mechanicKind,
    mechanicName: order.mechanicName ?? "—",
    orderId,
    clientId: order.clientId ?? undefined,
  });
}

export async function setServiceNoteCommissionPaid(
  workshopId: string,
  noteId: string,
  paid: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await prisma.serviceNote.updateMany({
    where: { id: noteId, workshopId },
    data: { commissionPaid: paid, commissionPaidAt: paid ? new Date() : null },
  });
  if (result.count === 0) return { ok: false, error: "Nota não encontrada." };
  return { ok: true };
}

export async function markServiceNotePaid(
  workshopId: string,
  noteId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await prisma.serviceNote.updateMany({
    where: { id: noteId, workshopId },
    data: { status: "paga" },
  });
  if (result.count === 0) return { ok: false, error: "Nota não encontrada." };
  return { ok: true };
}
