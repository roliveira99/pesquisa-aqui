import { prisma } from "@/lib/db/prisma";
import type { DashboardBreakdownPoint, DashboardPeriod, DashboardStats } from "@/types/document-line";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  return x;
}

function startOfMonth(d: Date) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function formatDayLabel(d: Date) {
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
}

function formatWeekLabel(d: Date) {
  const end = addDays(d, 6);
  return `${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} – ${end.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;
}

function formatMonthLabel(d: Date) {
  return d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

export function resolvePeriodRange(
  period: DashboardPeriod,
  fromInput?: string,
  toInput?: string
): { from: Date; to: Date } {
  const now = new Date();
  const today = startOfDay(now);

  if (period === "custom" && fromInput && toInput) {
    return { from: startOfDay(new Date(fromInput)), to: endOfDay(new Date(toInput)) };
  }
  if (period === "day") {
    return { from: today, to: endOfDay(now) };
  }
  if (period === "week") {
    return { from: startOfWeek(today), to: endOfDay(now) };
  }
  return { from: startOfMonth(today), to: endOfDay(now) };
}

function previousRange(from: Date, to: Date): { from: Date; to: Date } {
  const ms = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - ms);
  return { from: prevFrom, to: prevTo };
}

async function completedOrdersInRange(workshopId: string, from: Date, to: Date) {
  return prisma.crmServiceOrder.findMany({
    where: {
      workshopId,
      status: "concluido",
      updatedAt: { gte: from, lte: to },
    },
    select: {
      id: true,
      value: true,
      vehicleId: true,
      clientId: true,
      updatedAt: true,
    },
  });
}

function countServed(orders: { vehicleId: string | null; clientId: string | null }[]) {
  const vehicles = new Set<string>();
  const clients = new Set<string>();
  for (const o of orders) {
    if (o.vehicleId) vehicles.add(o.vehicleId);
    if (o.clientId) clients.add(o.clientId);
  }
  return Math.max(vehicles.size, clients.size);
}

function buildBreakdown(
  orders: { updatedAt: Date; value: number; vehicleId: string | null; clientId: string | null }[],
  period: DashboardPeriod,
  from: Date,
  to: Date
): DashboardBreakdownPoint[] {
  if (period === "day") {
    const hours = Array.from({ length: 24 }, (_, h) => ({
      label: `${String(h).padStart(2, "0")}h`,
      value: 0,
      amount: 0,
    }));
    for (const o of orders) {
      const h = o.updatedAt.getHours();
      hours[h].value += 1;
      hours[h].amount = (hours[h].amount ?? 0) + o.value;
    }
    return hours.filter((p) => p.value > 0 || p.amount! > 0);
  }

  if (period === "week" || (period === "custom" && to.getTime() - from.getTime() <= 8 * 86400000)) {
    const points: DashboardBreakdownPoint[] = [];
    let cursor = startOfDay(from);
    while (cursor <= to) {
      const dayEnd = endOfDay(cursor);
      const dayOrders = orders.filter((o) => o.updatedAt >= cursor && o.updatedAt <= dayEnd);
      points.push({
        label: formatDayLabel(cursor),
        value: countServed(dayOrders),
        amount: dayOrders.reduce((s, o) => s + o.value, 0),
      });
      cursor = addDays(cursor, 1);
    }
    return points;
  }

  if (period === "month") {
    const points: DashboardBreakdownPoint[] = [];
    let cursor = startOfWeek(from);
    while (cursor <= to) {
      const weekEnd = endOfDay(addDays(cursor, 6));
      const weekOrders = orders.filter((o) => o.updatedAt >= cursor && o.updatedAt <= weekEnd);
      points.push({
        label: formatWeekLabel(cursor),
        value: countServed(weekOrders),
        amount: weekOrders.reduce((s, o) => s + o.value, 0),
      });
      cursor = addDays(cursor, 7);
    }
    return points;
  }

  const points: DashboardBreakdownPoint[] = [];
  let cursor = startOfMonth(from);
  while (cursor <= to) {
    const monthEnd = endOfDay(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0));
    const monthOrders = orders.filter((o) => o.updatedAt >= cursor && o.updatedAt <= monthEnd);
    points.push({
      label: formatMonthLabel(cursor),
      value: countServed(monthOrders),
      amount: monthOrders.reduce((s, o) => s + o.value, 0),
    });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return points;
}

export async function getDashboardStats(
  workshopId: string,
  period: DashboardPeriod,
  fromInput?: string,
  toInput?: string
): Promise<DashboardStats> {
  const { from, to } = resolvePeriodRange(period, fromInput, toInput);
  const orders = await completedOrdersInRange(workshopId, from, to);

  const prev = previousRange(from, to);
  const prevOrders = await completedOrdersInRange(workshopId, prev.from, prev.to);

  return {
    period,
    from: from.toISOString(),
    to: to.toISOString(),
    clientsServed: countServed(orders),
    revenue: orders.reduce((s, o) => s + o.value, 0),
    ordersCompleted: orders.length,
    breakdown: buildBreakdown(orders, period, from, to),
    previousClientsServed: countServed(prevOrders),
    previousRevenue: prevOrders.reduce((s, o) => s + o.value, 0),
  };
}
