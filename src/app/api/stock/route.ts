import { NextResponse } from "next/server";
import { adjustStockQuantity, listStockItems, upsertStockItem } from "@/lib/db/stock";
import { getRequestUser, userHasEffectivePermission, userHasPermission } from "@/lib/db/request-auth";

export async function GET() {
  const user = await getRequestUser();
  if (!user?.workshopId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const canView =
    userHasPermission(user, "owner.estoque") ||
    userHasPermission(user, "gerencia.estoque") ||
    (await userHasEffectivePermission(user, "owner.estoque"));
  if (!canView) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const items = await listStockItems(user.workshopId);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user?.workshopId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const canEdit =
    userHasPermission(user, "owner.estoque") ||
    userHasPermission(user, "gerencia.entrada_pecas") ||
    (await userHasEffectivePermission(user, "owner.estoque"));
  if (!canEdit) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const action = body.action as string;

  try {
    switch (action) {
      case "upsert": {
        const item = await upsertStockItem(user.workshopId, {
          id: body.id as string | undefined,
          name: body.name as string,
          sku: body.sku as string | undefined,
          quantity: Number(body.quantity),
          minQuantity: body.minQuantity !== undefined ? Number(body.minQuantity) : undefined,
          unitPrice: body.unitPrice !== undefined ? Number(body.unitPrice) : undefined,
          costPrice: body.costPrice !== undefined ? Number(body.costPrice) : undefined,
          salePrice: body.salePrice !== undefined ? Number(body.salePrice) : undefined,
          markupPercent: body.markupPercent !== undefined ? Number(body.markupPercent) : undefined,
          publicVisible: body.publicVisible as boolean | undefined,
          kind: body.kind as "servico" | "peca" | undefined,
        });
        return NextResponse.json({ ok: true, item });
      }
      case "adjust": {
        const result = await adjustStockQuantity(
          user.workshopId,
          body.stockId as string,
          Number(body.delta)
        );
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Erro." },
      { status: 400 }
    );
  }
}
