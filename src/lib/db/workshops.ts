import { workshops as staticWorkshops, getWorkshopBySlug as getStaticBySlug } from "@/data/workshops";
import { mapDbWorkshop } from "@/lib/db/mappers";
import { isDatabaseReachable, prisma } from "@/lib/db/prisma";
import type { Workshop } from "@/types/workshop";
import type { Prisma } from "@prisma/client";

export async function listWorkshops(): Promise<Workshop[]> {
  if (!(await isDatabaseReachable())) return staticWorkshops;

  const rows = await prisma.workshop.findMany({ orderBy: { name: "asc" } });
  return rows.map(mapDbWorkshop);
}

export async function getWorkshopBySlug(slug: string): Promise<Workshop | null> {
  if (!(await isDatabaseReachable())) {
    return getStaticBySlug(slug) ?? null;
  }

  const row = await prisma.workshop.findUnique({ where: { slug } });
  return row ? mapDbWorkshop(row) : null;
}

export async function getWorkshopById(id: string): Promise<Workshop | null> {
  if (!(await isDatabaseReachable())) {
    return staticWorkshops.find((w) => w.id === id) ?? null;
  }

  const row = await prisma.workshop.findUnique({ where: { id } });
  return row ? mapDbWorkshop(row) : null;
}

export async function listWorkshopSlugs(): Promise<string[]> {
  if (!(await isDatabaseReachable())) {
    return staticWorkshops.map((w) => w.slug);
  }

  const rows = await prisma.workshop.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}

export async function updateWorkshopCatalog(
  workshopId: string,
  catalog: Workshop["catalog"]
): Promise<void> {
  await prisma.workshop.update({
    where: { id: workshopId },
    data: { catalogOverride: catalog as unknown as Prisma.InputJsonValue },
  });
}
