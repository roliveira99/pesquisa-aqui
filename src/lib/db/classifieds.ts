import { prisma } from "@/lib/db/prisma";

export interface ClassifiedAdRecord {
  id: string;
  workshopId: string | null;
  workshopName: string | null;
  title: string;
  body: string;
  price: number | null;
  contact: string | null;
  category: string;
  images: string[];
  active: boolean;
  createdAt: string;
  expiresAt: string | null;
}

export async function listClassifieds(opts?: {
  workshopId?: string;
  activeOnly?: boolean;
  publicOnly?: boolean;
}): Promise<ClassifiedAdRecord[]> {
  const rows = await prisma.classifiedAd.findMany({
    where: {
      ...(opts?.workshopId ? { workshopId: opts.workshopId } : {}),
      ...(opts?.activeOnly !== false ? { active: true } : {}),
    },
    include: { workshop: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows
    .filter((r) => !r.expiresAt || r.expiresAt > new Date())
    .map(mapClassified);
}

export async function createClassified(
  input: {
    workshopId?: string;
    title: string;
    body: string;
    price?: number;
    contact?: string;
    category?: string;
    images?: string[];
    expiresAt?: string;
  }
): Promise<ClassifiedAdRecord> {
  const row = await prisma.classifiedAd.create({
    data: {
      workshopId: input.workshopId ?? null,
      title: input.title.trim(),
      body: input.body.trim(),
      price: input.price ?? null,
      contact: input.contact?.trim() || null,
      category: input.category?.trim() || "geral",
      images: (input.images ?? []) as object,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      active: true,
    },
    include: { workshop: { select: { name: true } } },
  });
  return mapClassified(row);
}

export async function updateClassified(
  id: string,
  workshopId: string | undefined,
  input: Partial<{
    title: string;
    body: string;
    price: number;
    contact: string;
    category: string;
    active: boolean;
  }>
): Promise<{ ok: true; ad: ClassifiedAdRecord } | { ok: false; error: string }> {
  const existing = await prisma.classifiedAd.findFirst({
    where: { id, ...(workshopId ? { workshopId } : {}) },
  });
  if (!existing) return { ok: false, error: "Anúncio não encontrado." };

  const row = await prisma.classifiedAd.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.body !== undefined ? { body: input.body.trim() } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.contact !== undefined ? { contact: input.contact.trim() || null } : {}),
      ...(input.category !== undefined ? { category: input.category.trim() } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    },
    include: { workshop: { select: { name: true } } },
  });
  return { ok: true, ad: mapClassified(row) };
}

export async function deleteClassified(
  id: string,
  workshopId?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await prisma.classifiedAd.deleteMany({
    where: { id, ...(workshopId ? { workshopId } : {}) },
  });
  if (result.count === 0) return { ok: false, error: "Anúncio não encontrado." };
  return { ok: true };
}

function mapClassified(row: {
  id: string;
  workshopId: string | null;
  workshop?: { name: string } | null;
  title: string;
  body: string;
  price: number | null;
  contact: string | null;
  category: string;
  images: unknown;
  active: boolean;
  createdAt: Date;
  expiresAt: Date | null;
}): ClassifiedAdRecord {
  return {
    id: row.id,
    workshopId: row.workshopId,
    workshopName: row.workshop?.name ?? null,
    title: row.title,
    body: row.body,
    price: row.price,
    contact: row.contact,
    category: row.category,
    images: (row.images as string[] | null) ?? [],
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt?.toISOString() ?? null,
  };
}
