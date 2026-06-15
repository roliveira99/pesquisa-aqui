import { isDatabaseReachable, prisma } from "@/lib/db/prisma";
import type { SupplierContact } from "@/types/workshop";

export const defaultSuppliers: SupplierContact[] = [
  { id: "s1", name: "AutoPeças Central", phone: "(11) 3456-9000", notes: "Entrega em 2h" },
  { id: "s2", name: "Distribuidora Sul", phone: "(11) 98765-1111", notes: "Filtros e óleos" },
  { id: "s3", name: "Freios & Cia", phone: "(11) 3344-5566" },
];

function mapSupplier(row: {
  id: string;
  name: string;
  phone: string;
  notes: string | null;
}): SupplierContact {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    notes: row.notes ?? undefined,
  };
}

export async function getSuppliers(workshopId: string): Promise<SupplierContact[]> {
  if (!(await isDatabaseReachable())) return defaultSuppliers;

  const rows = await prisma.supplierContact.findMany({
    where: { workshopId },
    orderBy: { name: "asc" },
  });
  return rows.length > 0 ? rows.map(mapSupplier) : defaultSuppliers;
}

export async function saveSuppliers(
  workshopId: string,
  suppliers: SupplierContact[]
): Promise<SupplierContact[]> {
  await prisma.supplierContact.deleteMany({ where: { workshopId } });
  if (suppliers.length === 0) return [];

  await prisma.supplierContact.createMany({
    data: suppliers.map((s) => ({
      id: s.id,
      workshopId,
      name: s.name,
      phone: s.phone,
      notes: s.notes ?? null,
    })),
  });
  return suppliers;
}

export async function addSupplier(
  workshopId: string,
  input: { name: string; phone: string; notes?: string }
): Promise<SupplierContact> {
  const row = await prisma.supplierContact.create({
    data: {
      id: `sup-${Date.now()}`,
      workshopId,
      name: input.name.trim(),
      phone: input.phone.trim(),
      notes: input.notes?.trim() || null,
    },
  });
  return mapSupplier(row);
}

export async function removeSupplier(workshopId: string, id: string): Promise<void> {
  await prisma.supplierContact.deleteMany({ where: { id, workshopId } });
}
