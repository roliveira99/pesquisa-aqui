import { NextResponse } from "next/server";
import { getCatalogOverride, saveCatalogOverride } from "@/lib/db/workshop-media";
import { getRequestUser, userHasPermission } from "@/lib/db/request-auth";
import type { WorkshopCatalog } from "@/types/workshop";

export async function GET() {
  const user = await getRequestUser();
  if (!user?.workshopId || !userHasPermission(user, "owner.cadastro_servicos")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const catalog = await getCatalogOverride(user.workshopId);
  return NextResponse.json({ catalog });
}

export async function PUT(request: Request) {
  const user = await getRequestUser();
  if (!user?.workshopId || !userHasPermission(user, "owner.cadastro_servicos")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = (await request.json()) as { catalog: WorkshopCatalog };
  await saveCatalogOverride(user.workshopId, body.catalog);
  return NextResponse.json({ ok: true });
}
