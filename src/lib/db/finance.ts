import { prisma } from "@/lib/db/prisma";
import type { FinancialEntryKind } from "@prisma/client";

export interface FinancialEntryRecord {
  id: string;
  kind: FinancialEntryKind;
  name: string;
  amount: number;
  dueAt: string | null;
  paid: boolean;
  paidAt: string | null;
  serviceNoteId: string | null;
}

export interface FinanceOverview {
  revenueFromNotes: number;
  commissionsPaid: number;
  commissionsPending: number;
  receivablesOpen: number;
  payablesOpen: number;
  balance: number;
  entries: FinancialEntryRecord[];
}

export async function getFinanceOverview(workshopId: string): Promise<FinanceOverview> {
  const [notes, entries] = await Promise.all([
    prisma.serviceNote.findMany({ where: { workshopId } }),
    prisma.financialEntry.findMany({ where: { workshopId }, orderBy: { dueAt: "asc" } }),
  ]);

  const revenueFromNotes = notes
    .filter((n) => n.status !== "rascunho")
    .reduce((s, n) => s + n.total, 0);
  const commissionsPaid = notes
    .filter((n) => n.commissionPaid)
    .reduce((s, n) => s + (n.commissionAmount ?? 0), 0);
  const commissionsPending = notes
    .filter((n) => !n.commissionPaid && n.commissionAmount)
    .reduce((s, n) => s + (n.commissionAmount ?? 0), 0);

  const mapped: FinancialEntryRecord[] = entries.map((e) => ({
    id: e.id,
    kind: e.kind,
    name: e.name,
    amount: e.amount,
    dueAt: e.dueAt?.toISOString() ?? null,
    paid: e.paid,
    paidAt: e.paidAt?.toISOString() ?? null,
    serviceNoteId: e.serviceNoteId,
  }));

  const receivablesOpen = mapped
    .filter((e) => e.kind === "receber" && !e.paid)
    .reduce((s, e) => s + e.amount, 0);
  const payablesOpen = mapped
    .filter((e) => e.kind === "pagar" && !e.paid)
    .reduce((s, e) => s + e.amount, 0);

  const paidReceivables = mapped
    .filter((e) => e.kind === "receber" && e.paid)
    .reduce((s, e) => s + e.amount, 0);
  const paidPayables = mapped
    .filter((e) => e.kind === "pagar" && e.paid)
    .reduce((s, e) => s + e.amount, 0);

  return {
    revenueFromNotes,
    commissionsPaid,
    commissionsPending,
    receivablesOpen,
    payablesOpen,
    balance: paidReceivables - paidPayables - commissionsPaid,
    entries: mapped,
  };
}

export async function createFinancialEntry(
  workshopId: string,
  input: {
    kind: FinancialEntryKind;
    name: string;
    amount: number;
    dueAt?: string;
    reminderDayBefore?: boolean;
    reminderSameDay?: boolean;
  }
): Promise<FinancialEntryRecord> {
  const row = await prisma.financialEntry.create({
    data: {
      workshopId,
      kind: input.kind,
      name: input.name.trim(),
      amount: input.amount,
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
      reminderDayBefore: input.reminderDayBefore ?? true,
      reminderSameDay: input.reminderSameDay ?? true,
    },
  });

  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    amount: row.amount,
    dueAt: row.dueAt?.toISOString() ?? null,
    paid: row.paid,
    paidAt: row.paidAt?.toISOString() ?? null,
    serviceNoteId: row.serviceNoteId,
  };
}

export async function markFinancialEntryPaid(
  workshopId: string,
  entryId: string,
  paid: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await prisma.financialEntry.updateMany({
    where: { id: entryId, workshopId },
    data: { paid, paidAt: paid ? new Date() : null },
  });
  if (result.count === 0) return { ok: false, error: "Lançamento não encontrado." };
  return { ok: true };
}
