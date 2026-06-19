import { NextResponse } from "next/server";
import {
  anticipateInstallments,
  createFinancialEntry,
  finishRecurring,
  getFinanceOverview,
  markFinancialEntryPaid,
  markInstallmentPaid,
} from "@/lib/db/finance";
import { getRequestUser, userHasEffectivePermission, userHasPermission } from "@/lib/db/request-auth";
import type { FinancialEntryKind } from "@prisma/client";

export async function GET() {
  const user = await getRequestUser();
  if (!user?.workshopId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const canView =
    userHasPermission(user, "owner.fluxo_caixa") ||
    (await userHasEffectivePermission(user, "owner.fluxo_caixa"));
  if (!canView) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const overview = await getFinanceOverview(user.workshopId);
  return NextResponse.json(overview);
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user?.workshopId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const canManage =
    userHasPermission(user, "owner.contas_pagar") ||
    userHasPermission(user, "owner.contas_receber") ||
    (await userHasEffectivePermission(user, "owner.contas_pagar"));
  if (!canManage) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const action = body.action as string;
  const workshopId = user.workshopId;

  switch (action) {
    case "create": {
      const entry = await createFinancialEntry(workshopId, {
        kind: body.kind as FinancialEntryKind,
        name: body.name as string,
        amount: Number(body.amount),
        dueAt: body.dueAt as string | undefined,
        installmentCount: body.installmentCount ? Number(body.installmentCount) : undefined,
        isRecurring: body.isRecurring as boolean | undefined,
        reminderDayBefore: body.reminderDayBefore as boolean | undefined,
        reminderSameDay: body.reminderSameDay as boolean | undefined,
      });
      return NextResponse.json({ ok: true, entry });
    }
    case "mark-paid": {
      const result = await markFinancialEntryPaid(workshopId, body.entryId as string, body.paid as boolean);
      return NextResponse.json(result);
    }
    case "mark-installment": {
      const result = await markInstallmentPaid(
        workshopId,
        body.entryId as string,
        Number(body.installmentNumber),
        body.paid as boolean
      );
      return NextResponse.json(result);
    }
    case "anticipate": {
      const result = await anticipateInstallments(
        workshopId,
        body.entryId as string,
        body.installmentNumbers as number[]
      );
      return NextResponse.json(result);
    }
    case "finish-recurring": {
      const result = await finishRecurring(workshopId, body.entryId as string);
      return NextResponse.json(result);
    }
    default:
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }
}
