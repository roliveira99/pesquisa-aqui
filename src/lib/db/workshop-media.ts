import type { Prisma } from "@prisma/client";
import { isDatabaseReachable, prisma } from "@/lib/db/prisma";
import type { WorkshopCatalog, WorkshopGalleryItem } from "@/types/workshop";

export async function getCatalogOverride(workshopId: string): Promise<WorkshopCatalog | null> {
  if (!(await isDatabaseReachable())) return null;
  const row = await prisma.workshop.findUnique({
    where: { id: workshopId },
    select: { catalogOverride: true },
  });
  return (row?.catalogOverride as WorkshopCatalog | null) ?? null;
}

export async function saveCatalogOverride(
  workshopId: string,
  catalog: WorkshopCatalog
): Promise<void> {
  await prisma.workshop.update({
    where: { id: workshopId },
    data: { catalogOverride: catalog as unknown as Prisma.InputJsonValue },
  });
}

export async function getWorkshopMedia(workshopId: string): Promise<{
  coverImage: string | null;
  tagline: string | null;
  gallery: WorkshopGalleryItem[];
}> {
  const row = await prisma.workshop.findUniqueOrThrow({
    where: { id: workshopId },
    select: { coverImage: true, tagline: true, gallery: true },
  });
  return {
    coverImage: row.coverImage,
    tagline: row.tagline,
    gallery: (row.gallery as WorkshopGalleryItem[] | null) ?? [],
  };
}

export async function updateWorkshopMedia(
  workshopId: string,
  input: {
    coverImage?: string;
    tagline?: string;
    gallery?: WorkshopGalleryItem[];
  }
): Promise<void> {
  await prisma.workshop.update({
    where: { id: workshopId },
    data: {
      ...(input.coverImage !== undefined ? { coverImage: input.coverImage || null } : {}),
      ...(input.tagline !== undefined ? { tagline: input.tagline || null } : {}),
      ...(input.gallery !== undefined
        ? { gallery: input.gallery as unknown as Prisma.InputJsonValue }
        : {}),
    },
  });
}
