import { NextResponse } from "next/server";
import { getCatalogOverride, saveCatalogOverride } from "@/lib/db/workshop-media";
import { mapDbWorkshop } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import { resolveWorkshopPublicCatalog } from "@/lib/db/workshop-catalog";
import { getRequestUser, userHasPermission } from "@/lib/db/request-auth";
import type { WorkshopCatalog } from "@/types/workshop";

export async function GET() {
  const user = await getRequestUser();
  if (!user?.workshopId || !userHasPermission(user, "owner.catalogo")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const row = await prisma.workshop.findUnique({ where: { id: user.workshopId } });
  if (!row) {
    return NextResponse.json({ error: "Negócio não encontrado." }, { status: 404 });
  }

  const workshop = mapDbWorkshop(row);
  const catalog = (await getCatalogOverride(user.workshopId)) ?? workshop.catalog;
  const publicCatalog = await resolveWorkshopPublicCatalog(user.workshopId, workshop.catalog);

  return NextResponse.json({ catalog, publicCatalog, slug: row.slug });
}

export async function PUT(request: Request) {
  const user = await getRequestUser();
  if (!user?.workshopId || !userHasPermission(user, "owner.catalogo")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = (await request.json()) as { catalog: WorkshopCatalog };

  const imageUrls = [
    ...body.catalog.services.map((i) => i.imageUrl),
    ...body.catalog.parts.map((i) => i.imageUrl),
  ].filter((url): url is string => typeof url === "string" && url.length > 0);

  if (imageUrls.some((url) => url.length > 2_500_000)) {
    return NextResponse.json(
      { error: "Uma ou mais imagens do catálogo são muito grandes." },
      { status: 413 }
    );
  }

  await saveCatalogOverride(user.workshopId, body.catalog);
  return NextResponse.json({ ok: true });
}
