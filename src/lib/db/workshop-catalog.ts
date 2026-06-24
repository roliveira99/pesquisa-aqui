import { listCatalogItems } from "@/lib/db/catalog-items";
import type { CatalogItem, WorkshopCatalog } from "@/types/workshop";

function mergeCatalogItems(existing: CatalogItem[], added: CatalogItem[]): CatalogItem[] {
  const seen = new Set(existing.map((item) => item.id));
  const merged = [...existing];
  for (const item of added) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }
  return merged.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

function emptyCatalog(): WorkshopCatalog {
  return { services: [], parts: [] };
}

function normalizeCatalog(catalog: WorkshopCatalog | null | undefined): WorkshopCatalog {
  if (!catalog) return emptyCatalog();
  return {
    services: Array.isArray(catalog.services) ? catalog.services : [],
    parts: Array.isArray(catalog.parts) ? catalog.parts : [],
  };
}

/** Catálogo exibido no perfil público: JSON da oficina + itens marcados como públicos no cadastro. */
export async function resolveWorkshopPublicCatalog(
  workshopId: string,
  baseCatalog: WorkshopCatalog
): Promise<WorkshopCatalog> {
  const base = normalizeCatalog(baseCatalog);
  const publicItems = await listCatalogItems(workshopId, { publicOnly: true });

  const servicesFromDb: CatalogItem[] = publicItems
    .filter((item) => item.kind === "servico")
    .map((item) => ({
      id: item.id,
      name: item.name,
      priceFrom: item.unitPrice,
      description: item.description,
    }));

  const partsFromDb: CatalogItem[] = publicItems
    .filter((item) => item.kind === "peca")
    .map((item) => ({
      id: item.id,
      name: item.name,
      priceFrom: item.unitPrice,
      description: item.description,
    }));

  return {
    services: mergeCatalogItems(base.services, servicesFromDb),
    parts: mergeCatalogItems(base.parts, partsFromDb),
  };
}
