import { prisma } from "@/lib/db/prisma";
import type { FinancialEntryKind, SubscriptionStatus } from "@prisma/client";

export interface SubscriptionRecord {
  id: string;
  workshopId: string;
  workshopName: string;
  monthlyValue: number;
  nextDueAt: string;
  status: SubscriptionStatus;
  paid: boolean;
  paymentLink: string | null;
  lastChargedAt: string | null;
  lastReminderAt: string | null;
  daysSinceCharge: number | null;
  notes: string | null;
}

function daysSince(date: Date | null): number | null {
  if (!date) return null;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export async function listSubscriptions(): Promise<SubscriptionRecord[]> {
  const rows = await prisma.workshopSubscription.findMany({
    include: { workshop: { select: { name: true } } },
    orderBy: { nextDueAt: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    workshopId: r.workshopId,
    workshopName: r.workshop.name,
    monthlyValue: r.monthlyValue,
    nextDueAt: r.nextDueAt.toISOString(),
    status: r.status,
    paid: r.paid,
    paymentLink: r.paymentLink,
    lastChargedAt: r.lastChargedAt?.toISOString() ?? null,
    lastReminderAt: r.lastReminderAt?.toISOString() ?? null,
    daysSinceCharge: daysSince(r.lastChargedAt),
    notes: r.notes,
  }));
}

export async function getWorkshopSubscription(
  workshopId: string
): Promise<SubscriptionRecord | null> {
  const r = await prisma.workshopSubscription.findUnique({
    where: { workshopId },
    include: { workshop: { select: { name: true } } },
  });
  if (!r) return null;
  return {
    id: r.id,
    workshopId: r.workshopId,
    workshopName: r.workshop.name,
    monthlyValue: r.monthlyValue,
    nextDueAt: r.nextDueAt.toISOString(),
    status: r.status,
    paid: r.paid,
    paymentLink: r.paymentLink,
    lastChargedAt: r.lastChargedAt?.toISOString() ?? null,
    lastReminderAt: r.lastReminderAt?.toISOString() ?? null,
    daysSinceCharge: daysSince(r.lastChargedAt),
    notes: r.notes,
  };
}

export async function upsertSubscription(input: {
  workshopId: string;
  monthlyValue: number;
  nextDueAt: string;
  status?: SubscriptionStatus;
  paid?: boolean;
  paymentLink?: string;
  notes?: string;
}): Promise<SubscriptionRecord> {
  const workshop = await prisma.workshop.findUnique({ where: { id: input.workshopId } });
  if (!workshop) throw new Error("Oficina não encontrada.");

  const row = await prisma.workshopSubscription.upsert({
    where: { workshopId: input.workshopId },
    create: {
      workshopId: input.workshopId,
      monthlyValue: input.monthlyValue,
      nextDueAt: new Date(input.nextDueAt),
      status: input.status ?? "ativa",
      paid: input.paid ?? false,
      paymentLink: input.paymentLink?.trim() || null,
      notes: input.notes?.trim() || null,
    },
    update: {
      monthlyValue: input.monthlyValue,
      nextDueAt: new Date(input.nextDueAt),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.paid !== undefined ? { paid: input.paid } : {}),
      ...(input.paymentLink !== undefined ? { paymentLink: input.paymentLink?.trim() || null } : {}),
      ...(input.notes !== undefined ? { notes: input.notes?.trim() || null } : {}),
    },
    include: { workshop: { select: { name: true } } },
  });

  return {
    id: row.id,
    workshopId: row.workshopId,
    workshopName: row.workshop.name,
    monthlyValue: row.monthlyValue,
    nextDueAt: row.nextDueAt.toISOString(),
    status: row.status,
    paid: row.paid,
    paymentLink: row.paymentLink,
    lastChargedAt: row.lastChargedAt?.toISOString() ?? null,
    lastReminderAt: row.lastReminderAt?.toISOString() ?? null,
    daysSinceCharge: daysSince(row.lastChargedAt),
    notes: row.notes,
  };
}

export async function chargeSubscription(
  subscriptionId: string
): Promise<{ ok: true; subscription: SubscriptionRecord } | { ok: false; error: string }> {
  const existing = await prisma.workshopSubscription.findUnique({ where: { id: subscriptionId } });
  if (!existing) return { ok: false, error: "Assinatura não encontrada." };

  const now = new Date();
  const row = await prisma.workshopSubscription.update({
    where: { id: subscriptionId },
    data: {
      lastChargedAt: now,
      lastReminderAt: now,
      paid: false,
      status: "atrasada",
    },
    include: { workshop: { select: { name: true } } },
  });

  return {
    ok: true,
    subscription: {
      id: row.id,
      workshopId: row.workshopId,
      workshopName: row.workshop.name,
      monthlyValue: row.monthlyValue,
      nextDueAt: row.nextDueAt.toISOString(),
      status: row.status,
      paid: row.paid,
      paymentLink: row.paymentLink,
      lastChargedAt: row.lastChargedAt?.toISOString() ?? null,
      lastReminderAt: row.lastReminderAt?.toISOString() ?? null,
      daysSinceCharge: 0,
      notes: row.notes,
    },
  };
}

export async function setSubscriptionPaid(
  subscriptionId: string,
  paid: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const existing = await prisma.workshopSubscription.findUnique({ where: { id: subscriptionId } });
  if (!existing) return { ok: false, error: "Assinatura não encontrada." };

  const nextDue = new Date(existing.nextDueAt);
  if (paid) nextDue.setMonth(nextDue.getMonth() + 1);

  await prisma.workshopSubscription.update({
    where: { id: subscriptionId },
    data: {
      paid,
      status: paid ? "ativa" : existing.status === "suspensa" ? "suspensa" : "atrasada",
      ...(paid ? { nextDueAt: nextDue } : {}),
    },
  });
  return { ok: true };
}

export async function setSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await prisma.workshopSubscription.updateMany({
    where: { id: subscriptionId },
    data: { status },
  });
  if (result.count === 0) return { ok: false, error: "Assinatura não encontrada." };
  return { ok: true };
}

export async function ensureSubscriptionsForWorkshops(): Promise<void> {
  const workshops = await prisma.workshop.findMany({ select: { id: true } });
  const existing = await prisma.workshopSubscription.findMany({ select: { workshopId: true } });
  const has = new Set(existing.map((e) => e.workshopId));
  const due = new Date();
  due.setDate(due.getDate() + 30);
  for (const w of workshops) {
    if (has.has(w.id)) continue;
    await prisma.workshopSubscription.create({
      data: {
        workshopId: w.id,
        monthlyValue: 199,
        nextDueAt: due,
        status: "ativa",
      },
    });
  }
}
