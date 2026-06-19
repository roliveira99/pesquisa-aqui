import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/db/dashboard-stats";
import { getRequestUser } from "@/lib/db/request-auth";
import type { DashboardPeriod } from "@/types/document-line";

export async function GET(request: Request) {
  const user = await getRequestUser();
  if (!user?.workshopId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") ?? "month") as DashboardPeriod;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  try {
    const stats = await getDashboardStats(user.workshopId, period, from, to);
    return NextResponse.json(stats);
  } catch (err) {
    console.error("[dashboard/stats]", err);
    return NextResponse.json({ error: "Não foi possível carregar as estatísticas." }, { status: 500 });
  }
}
