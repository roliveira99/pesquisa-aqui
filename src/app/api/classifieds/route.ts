import { NextResponse } from "next/server";
import {
  createClassified,
  deleteClassified,
  listClassifieds,
  updateClassified,
} from "@/lib/db/classifieds";
import { getRequestUser } from "@/lib/db/request-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user = await getRequestUser();
  const workshopId = searchParams.get("workshopId") ?? user?.workshopId ?? undefined;
  const mine = searchParams.get("mine") === "1";

  const ads = await listClassifieds({
    workshopId: mine && user?.workshopId ? user.workshopId : workshopId,
    activeOnly: !mine,
  });
  return NextResponse.json({ ads });
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  const body = (await request.json()) as Record<string, unknown>;
  const action = body.action as string;

  switch (action) {
    case "create": {
      if (!user?.workshopId || user.role !== "dono") {
        return NextResponse.json({ error: "Apenas o dono pode publicar classificados." }, { status: 403 });
      }
      const ad = await createClassified({
        workshopId: user.workshopId,
        title: body.title as string,
        body: body.body as string,
        price: body.price !== undefined ? Number(body.price) : undefined,
        contact: body.contact as string | undefined,
        category: body.category as string | undefined,
      });
      return NextResponse.json({ ok: true, ad });
    }
    case "update": {
      if (!user?.workshopId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      const result = await updateClassified(body.id as string, user.workshopId, {
        title: body.title as string | undefined,
        body: body.body as string | undefined,
        price: body.price !== undefined ? Number(body.price) : undefined,
        contact: body.contact as string | undefined,
        category: body.category as string | undefined,
        active: body.active as boolean | undefined,
      });
      return NextResponse.json(result);
    }
    case "delete": {
      if (!user?.workshopId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      const result = await deleteClassified(body.id as string, user.workshopId);
      return NextResponse.json(result);
    }
    default:
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }
}
