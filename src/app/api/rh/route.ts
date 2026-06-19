import { NextResponse } from "next/server";
import { addSalaryAdvance, getRhOverview, upsertEmployeeCompensation } from "@/lib/db/rh";
import { listServiceNotes, setServiceNoteCommissionPaid } from "@/lib/db/service-notes";
import { getRequestUser, userHasPermission } from "@/lib/db/request-auth";
import type { MechanicKind } from "@/types/client";

export async function GET(request: Request) {
  const user = await getRequestUser();
  if (!user?.workshopId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mechanicId = searchParams.get("mechanicId");
  const mechanicKind = searchParams.get("mechanicKind") as MechanicKind | null;
  const period = searchParams.get("period") as "day" | "week" | "month" | null;

  if (mechanicId && mechanicKind) {
    const notes = await listServiceNotes(user.workshopId, {
      mechanicId,
      mechanicKind,
      period: period ?? undefined,
    });
    return NextResponse.json({ notes });
  }

  const overview = await getRhOverview(user.workshopId);
  return NextResponse.json(overview);
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user?.workshopId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const action = body.action as string;

  if (!userHasPermission(user, "owner.salarios") && !userHasPermission(user, "owner.comissoes")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  switch (action) {
    case "upsert-compensation": {
      const employee = await upsertEmployeeCompensation(user.workshopId, {
        userId: body.userId as string | undefined,
        fictionalMechanicId: body.fictionalMechanicId as string | undefined,
        salary: Number(body.salary),
        commissionRate: Number(body.commissionRate),
      });
      return NextResponse.json({ ok: true, employee });
    }
    case "add-advance": {
      const advance = await addSalaryAdvance(user.workshopId, {
        userId: body.userId as string | undefined,
        fictionalMechanicId: body.fictionalMechanicId as string | undefined,
        amount: Number(body.amount),
        date: body.date as string,
        notes: body.notes as string | undefined,
      });
      return NextResponse.json({ ok: true, advance });
    }
    case "commission-paid": {
      const result = await setServiceNoteCommissionPaid(
        user.workshopId,
        body.noteId as string,
        body.paid as boolean
      );
      return NextResponse.json(result);
    }
    default:
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }
}
