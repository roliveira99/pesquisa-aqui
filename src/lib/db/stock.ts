import { prisma } from "@/lib/db/prisma";

export interface StockItemRecord {
  id: string;
  workshopId: string;
  catalogItemId: string | null;
  name: string;
  sku: string | null;
  quantity: number;
  minQuantity: number;
  unitPrice: number | null;
  costPrice: number | null;
  salePrice: number | null;
  markupPercent: number | null;
  publicVisible: boolean;
}

export async function listStockItems(workshopId: string): Promise<StockItemRecord[]> {
  const [stock, catalog] = await Promise.all([
    prisma.stockItem.findMany({ where: { workshopId }, orderBy: { name: "asc" } }),
    prisma.catalogItem.findMany({ where: { workshopId } }),
  ]);

  return stock.map((s) => {
    const cat = catalog.find((c) => c.id === s.catalogItemId);
    return {
      id: s.id,
      workshopId: s.workshopId,
      catalogItemId: s.catalogItemId,
      name: s.name,
      sku: s.sku,
      quantity: s.quantity,
      minQuantity: s.minQuantity,
      unitPrice: s.unitPrice,
      costPrice: s.costPrice,
      salePrice: s.salePrice ?? s.unitPrice,
      markupPercent: s.markupPercent,
      publicVisible: cat?.publicVisible ?? false,
    };
  });
}

export async function upsertStockItem(
  workshopId: string,
  input: {
    id?: string;
    name: string;
    sku?: string;
    quantity: number;
    minQuantity?: number;
    unitPrice?: number;
    costPrice?: number;
    salePrice?: number;
    markupPercent?: number;
    publicVisible?: boolean;
    kind?: "servico" | "peca";
  }
): Promise<StockItemRecord> {
  const name = input.name.trim();
  if (!name) throw new Error("Informe o nome da peça.");

  const salePrice = input.salePrice ?? input.unitPrice ?? null;
  const unitPrice = salePrice;

  if (input.id) {
    const existing = await prisma.stockItem.findFirst({ where: { id: input.id, workshopId } });
    if (!existing) throw new Error("Item não encontrado.");

    const row = await prisma.stockItem.update({
      where: { id: input.id },
      data: {
        name,
        sku: input.sku?.trim() || null,
        quantity: input.quantity,
        minQuantity: input.minQuantity ?? existing.minQuantity,
        unitPrice,
        costPrice: input.costPrice ?? existing.costPrice,
        salePrice,
        markupPercent: input.markupPercent ?? existing.markupPercent,
      },
    });

    if (existing.catalogItemId) {
      await prisma.catalogItem.update({
        where: { id: existing.catalogItemId },
        data: {
          name,
          unitPrice: unitPrice ?? 0,
          costPrice: input.costPrice ?? undefined,
          markupPercent: input.markupPercent ?? undefined,
          ...(input.publicVisible !== undefined ? { publicVisible: input.publicVisible } : {}),
        },
      });
    }

    return {
      id: row.id,
      workshopId: row.workshopId,
      catalogItemId: row.catalogItemId,
      name: row.name,
      sku: row.sku,
      quantity: row.quantity,
      minQuantity: row.minQuantity,
      unitPrice: row.unitPrice,
      costPrice: row.costPrice,
      salePrice: row.salePrice ?? row.unitPrice,
      markupPercent: row.markupPercent,
      publicVisible: input.publicVisible ?? false,
    };
  }

  const catalogItem = await prisma.catalogItem.create({
    data: {
      workshopId,
      kind: input.kind ?? "peca",
      name,
      unitPrice: unitPrice ?? 0,
      costPrice: input.costPrice ?? null,
      markupPercent: input.markupPercent ?? null,
      publicVisible: input.publicVisible ?? false,
      active: true,
    },
  });

  const row = await prisma.stockItem.create({
    data: {
      workshopId,
      catalogItemId: catalogItem.id,
      name,
      sku: input.sku?.trim() || null,
      quantity: input.quantity,
      minQuantity: input.minQuantity ?? 0,
      unitPrice,
      costPrice: input.costPrice ?? null,
      salePrice,
      markupPercent: input.markupPercent ?? null,
    },
  });

  return {
    id: row.id,
    workshopId: row.workshopId,
    catalogItemId: row.catalogItemId,
    name: row.name,
    sku: row.sku,
    quantity: row.quantity,
    minQuantity: row.minQuantity,
    unitPrice: row.unitPrice,
    costPrice: row.costPrice,
    salePrice: row.salePrice ?? row.unitPrice,
    markupPercent: row.markupPercent,
    publicVisible: input.publicVisible ?? false,
  };
}

export async function adjustStockQuantity(
  workshopId: string,
  stockId: string,
  delta: number
): Promise<{ ok: true; quantity: number } | { ok: false; error: string }> {
  const item = await prisma.stockItem.findFirst({ where: { id: stockId, workshopId } });
  if (!item) return { ok: false, error: "Item não encontrado." };

  const quantity = Math.max(0, item.quantity + delta);
  await prisma.stockItem.update({ where: { id: stockId }, data: { quantity } });
  return { ok: true, quantity };
}
