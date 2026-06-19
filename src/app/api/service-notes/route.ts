import { NextResponse } from "next/server";
import {
  createServiceNote,
  createServiceNoteFromOrder,
  listServiceNotes,
  markServiceNotePaid,
  setServiceNoteCommissionPaid,
} from "@/lib/db/service-notes";
import { getAllMechanicAssignees } from "@/lib/db/crm";
import { getRequestUser, userHasPermission } from "@/lib/db/request-auth";
import type { MechanicKind } from "@/types/client";
import type { DocumentLineItem } from "@/types/document-line";

export async function GET(request: Request) {
  const user = await getRequestUser();
  if (!user?.workshopId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") as "day" | "week" | "month" | null;
  const mechanicOnly = searchParams.get("mechanicOnly") === "1";

  const filters: Parameters<typeof listServiceNotes>[1] = { period: period ?? undefined };
  if (mechanicOnly && user.role === "mecanico" && user.workshopId) {
    const assignees = await getAllMechanicAssignees(user.workshopId);
    const mine =
      assignees.find((a) => a.kind === "platform" && a.name === user.name) ??
      assignees.find((a) => a.kind === "platform");
    if (mine) {
      filters.mechanicId = mine.id;
      filters.mechanicKind = mine.kind;
    }
  }

  const notes = await listServiceNotes(user.workshopId, filters);
  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user?.workshopId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const action = body.action as string;
  const workshopId = user.workshopId;

  switch (action) {
    case "from-order": {
      if (!userHasPermission(user, "gerencia.emissao_notas") && !userHasPermission(user, "owner.emissao_pdf")) {
        return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
      }
      const result = await createServiceNoteFromOrder(
        workshopId,
        body.orderId as string,
        body.lineItems as DocumentLineItem[] | undefined,
        body.paymentMethods as string[] | undefined
      );
      return NextResponse.json(result);
    }
    case "create": {
      if (!userHasPermission(user, "gerencia.emissao_notas") && !userHasPermission(user, "owner.emissao_pdf")) {
        return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
      }
      const result = await createServiceNote(workshopId, {
        vehicleId: body.vehicleId as string,
        lineItems: body.lineItems as DocumentLineItem[],
        paymentMethods: body.paymentMethods as string[] | undefined,
        mechanicId: body.mechanicId as string,
        mechanicKind: body.mechanicKind as MechanicKind,
        mechanicName: body.mechanicName as string,
        orderId: body.orderId as string | undefined,
        clientId: body.clientId as string | undefined,
      });
      return NextResponse.json(result);
    }
    case "commission-paid": {
      if (!userHasPermission(user, "owner.comissoes") && !userHasPermission(user, "owner.salarios")) {
        return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
      }
      const result = await setServiceNoteCommissionPaid(
        workshopId,
        body.noteId as string,
        body.paid as boolean
      );
      return NextResponse.json(result);
    }
    case "mark-paid": {
      const result = await markServiceNotePaid(workshopId, body.noteId as string);
      return NextResponse.json(result);
    }
    default:
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }
}
