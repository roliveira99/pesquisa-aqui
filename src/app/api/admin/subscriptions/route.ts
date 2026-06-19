import { NextResponse } from "next/server";
import {
  chargeSubscription,
  ensureSubscriptionsForWorkshops,
  listSubscriptions,
  setSubscriptionPaid,
  setSubscriptionStatus,
  upsertSubscription,
} from "@/lib/db/subscriptions";
import { getRequestUser, userHasPermission } from "@/lib/db/request-auth";
import type { SubscriptionStatus } from "@prisma/client";

export async function GET() {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  if (user.role === "master") {
    if (!userHasPermission(user, "admin.controle_assinaturas")) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }
    await ensureSubscriptionsForWorkshops();
    const subscriptions = await listSubscriptions();
    return NextResponse.json({ subscriptions });
  }

  if (user.role === "dono" && user.workshopId) {
    const { getWorkshopSubscription } = await import("@/lib/db/subscriptions");
    const subscription = await getWorkshopSubscription(user.workshopId);
    return NextResponse.json({ subscription });
  }

  return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user || user.role !== "master") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  if (!userHasPermission(user, "admin.controle_assinaturas")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const action = body.action as string;

  switch (action) {
    case "upsert": {
      const subscription = await upsertSubscription({
        workshopId: body.workshopId as string,
        monthlyValue: Number(body.monthlyValue),
        nextDueAt: body.nextDueAt as string,
        status: body.status as SubscriptionStatus | undefined,
        paid: body.paid as boolean | undefined,
        paymentLink: body.paymentLink as string | undefined,
        notes: body.notes as string | undefined,
      });
      return NextResponse.json({ ok: true, subscription });
    }
    case "charge": {
      const result = await chargeSubscription(body.subscriptionId as string);
      return NextResponse.json(result);
    }
    case "set-paid": {
      const result = await setSubscriptionPaid(body.subscriptionId as string, body.paid as boolean);
      return NextResponse.json(result);
    }
    case "set-status": {
      const result = await setSubscriptionStatus(
        body.subscriptionId as string,
        body.status as SubscriptionStatus
      );
      return NextResponse.json(result);
    }
    default:
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }
}
