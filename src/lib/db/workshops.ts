import { workshops as staticWorkshops, getWorkshopBySlug as getStaticBySlug } from "@/data/workshops";
import { mapDbWorkshop } from "@/lib/db/mappers";
import { isDatabaseReachable, prisma } from "@/lib/db/prisma";
import { resolveWorkshopPublicCatalog } from "@/lib/db/workshop-catalog";
import type { Workshop } from "@/types/workshop";
import type { Prisma } from "@prisma/client";

async function withPublicCatalog(workshop: Workshop): Promise<Workshop> {
  if (!(await isDatabaseReachable())) return workshop;
  return {
    ...workshop,
    catalog: await resolveWorkshopPublicCatalog(workshop.id, workshop.catalog),
  };
}

export async function listWorkshops(filter?: {
  vertical?: import("@/types/vertical").BusinessVertical;
  city?: string;
}): Promise<Workshop[]> {
  if (!(await isDatabaseReachable())) {
    let list = staticWorkshops;
    if (filter?.vertical) list = list.filter((w) => (w.vertical ?? "automotive") === filter.vertical);
    if (filter?.city) list = list.filter((w) => w.city === filter.city);
    return list;
  }

  const rows = await prisma.workshop.findMany({
    where: {
      ...(filter?.vertical ? { vertical: filter.vertical } : {}),
      ...(filter?.city ? { city: filter.city } : {}),
    },
    orderBy: { name: "asc" },
  });
  const workshops = rows.map(mapDbWorkshop);
  return Promise.all(workshops.map(withPublicCatalog));
}

export async function getWorkshopBySlug(slug: string): Promise<Workshop | null> {
  if (!(await isDatabaseReachable())) {
    return getStaticBySlug(slug) ?? null;
  }

  const row = await prisma.workshop.findUnique({ where: { slug } });
  if (!row) return null;
  return withPublicCatalog(mapDbWorkshop(row));
}

export async function getWorkshopById(id: string): Promise<Workshop | null> {
  if (!(await isDatabaseReachable())) {
    return staticWorkshops.find((w) => w.id === id) ?? null;
  }

  const row = await prisma.workshop.findUnique({ where: { id } });
  if (!row) return null;
  return withPublicCatalog(mapDbWorkshop(row));
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
