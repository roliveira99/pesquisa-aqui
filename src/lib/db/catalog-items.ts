import { prisma } from "@/lib/db/prisma";
import type { CatalogItemRecord } from "@/types/document-line";
import type { CatalogItemKind } from "@prisma/client";

function mapRow(row: {
  id: string;
  workshopId: string;
  kind: CatalogItemKind;
  name: string;
  description: string | null;
  unitPrice: number;
  publicVisible: boolean;
  active: boolean;
  stockItem: { quantity: number } | null;
}): CatalogItemRecord {
  return {
    id: row.id,
    workshopId: row.workshopId,
    kind: row.kind,
    name: row.name,
    description: row.description ?? undefined,
    unitPrice: row.unitPrice,
    publicVisible: row.publicVisible,
    active: row.active,
    stockQuantity: row.stockItem?.quantity,
  };
}

export async function listCatalogItems(
  workshopId: string,
  opts?: { publicOnly?: boolean; includeInactive?: boolean; search?: string; kind?: CatalogItemKind }
): Promise<CatalogItemRecord[]> {
  const rows = await prisma.catalogItem.findMany({
    where: {
      workshopId,
      ...(opts?.kind ? { kind: opts.kind } : {}),
      ...(opts?.publicOnly ? { publicVisible: true } : {}),
      ...(opts?.includeInactive ? {} : { active: true }),
      ...(opts?.search
        ? { name: { contains: opts.search, mode: "insensitive" as const } }
        : {}),
    },
    include: { stockItem: { select: { quantity: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map(mapRow);
}

export async function upsertCatalogItem(
  workshopId: string,
  input: {
    id?: string;
    kind: CatalogItemKind;
    name: string;
    description?: string;
    unitPrice: number;
    publicVisible?: boolean;
    active?: boolean;
    stockQuantity?: number;
  }
): Promise<CatalogItemRecord> {
  const name = input.name.trim();
  if (!name) throw new Error("Informe o nome do item.");

  if (input.id) {
    const row = await prisma.catalogItem.update({
      where: { id: input.id },
      data: {
        kind: input.kind,
        name,
        description: input.description?.trim() || null,
        unitPrice: input.unitPrice,
        publicVisible: input.publicVisible ?? true,
        active: input.active ?? true,
      },
      include: { stockItem: { select: { quantity: true } } },
    });

    if (input.stockQuantity !== undefined && !input.publicVisible) {
      await prisma.stockItem.upsert({
        where: { catalogItemId: row.id },
        create: {
          workshopId,
          catalogItemId: row.id,
          name: row.name,
          quantity: input.stockQuantity,
          unitPrice: row.unitPrice,
        },
        update: { quantity: input.stockQuantity, name: row.name, unitPrice: row.unitPrice },
      });
    }

    return mapRow(row);
  }

  const row = await prisma.catalogItem.create({
    data: {
      workshopId,
      kind: input.kind,
      name,
      description: input.description?.trim() || null,
      unitPrice: input.unitPrice,
      publicVisible: input.publicVisible ?? true,
      active: true,
    },
    include: { stockItem: { select: { quantity: true } } },
  });

  if (input.stockQuantity !== undefined && input.publicVisible === false) {
    await prisma.stockItem.create({
      data: {
        workshopId,
        catalogItemId: row.id,
        name: row.name,
        quantity: input.stockQuantity,
        unitPrice: row.unitPrice,
      },
    });
  }

  return mapRow(row);
}
