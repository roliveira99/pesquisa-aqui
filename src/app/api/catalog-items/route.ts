import { NextResponse } from "next/server";
import { listCatalogItems, upsertCatalogItem } from "@/lib/db/catalog-items";
import { getRequestUser } from "@/lib/db/request-auth";
import type { CatalogItemKind } from "@prisma/client";

export async function GET(request: Request) {
  const user = await getRequestUser();
  if (!user?.workshopId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;
  const publicOnly = searchParams.get("public") === "1";

  const items = await listCatalogItems(user.workshopId, { search, publicOnly });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user?.workshopId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  try {
    const item = await upsertCatalogItem(user.workshopId, {
      id: body.id as string | undefined,
      kind: body.kind as CatalogItemKind,
      name: body.name as string,
      description: body.description as string | undefined,
      unitPrice: Number(body.unitPrice),
      publicVisible: body.publicVisible as boolean | undefined,
      active: body.active as boolean | undefined,
      stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : undefined,
    });
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Erro ao salvar item." },
      { status: 400 }
    );
  }
}
