import type { AgendaRequest, CatalogItem, SupplierContact, WorkshopCatalog } from "@/types/workshop";

const AGENDA_KEY = "mp-oficinas-agenda-solicitacoes";
const SUPPLIERS_KEY = "mp-oficinas-fornecedores";
const CATALOG_KEY = "mp-oficinas-catalogo";

export function getAgendaRequests(workshopId?: string): AgendaRequest[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(AGENDA_KEY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as AgendaRequest[];
    return workshopId ? list.filter((r) => r.workshopId === workshopId) : list;
  } catch {
    return [];
  }
}

export const defaultSuppliers: SupplierContact[] = [
  { id: "s1", name: "AutoPeças Central", phone: "(11) 3456-9000", notes: "Entrega em 2h" },
  { id: "s2", name: "Distribuidora Sul", phone: "(11) 98765-1111", notes: "Filtros e óleos" },
  { id: "s3", name: "Freios & Cia", phone: "(11) 3344-5566" },
];

export function getSuppliers(workshopId: string): SupplierContact[] {
  if (typeof window === "undefined") return defaultSuppliers;
  const raw = localStorage.getItem(`${SUPPLIERS_KEY}-${workshopId}`);
  if (!raw) return defaultSuppliers;
  try {
    return JSON.parse(raw) as SupplierContact[];
  } catch {
    return defaultSuppliers;
  }
}

export function saveSuppliers(workshopId: string, suppliers: SupplierContact[]) {
  localStorage.setItem(`${SUPPLIERS_KEY}-${workshopId}`, JSON.stringify(suppliers));
}

export function getCatalogOverride(workshopId: string): WorkshopCatalog | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`${CATALOG_KEY}-${workshopId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WorkshopCatalog;
  } catch {
    return null;
  }
}

export function saveCatalogOverride(workshopId: string, catalog: WorkshopCatalog) {
  localStorage.setItem(`${CATALOG_KEY}-${workshopId}`, JSON.stringify(catalog));
}

export function formatCatalogPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function newCatalogItem(name: string, priceFrom: number): CatalogItem {
  return {
    id: `item-${Date.now()}`,
    name,
    priceFrom,
  };
}

export function newSupplier(name: string, phone: string, notes?: string): SupplierContact {
  return {
    id: `sup-${Date.now()}`,
    name,
    phone,
    notes,
  };
}
