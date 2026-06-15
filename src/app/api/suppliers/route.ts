import { NextResponse } from "next/server";
import { addSupplier, getSuppliers, removeSupplier, saveSuppliers } from "@/lib/db/suppliers";
import { getRequestUser, userHasPermission } from "@/lib/db/request-auth";
import type { SupplierContact } from "@/types/workshop";

export async function GET() {
  const user = await getRequestUser();
  if (!user?.workshopId || !userHasPermission(user, "mecanico.fornecedores")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const suppliers = await getSuppliers(user.workshopId);
  return NextResponse.json({ suppliers });
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user?.workshopId || !userHasPermission(user, "mecanico.fornecedores")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = (await request.json()) as {
    action?: "add" | "remove" | "save-all";
    name?: string;
    phone?: string;
    notes?: string;
    id?: string;
    suppliers?: SupplierContact[];
  };

  if (body.action === "save-all" && body.suppliers) {
    const saved = await saveSuppliers(user.workshopId, body.suppliers);
    return NextResponse.json({ suppliers: saved });
  }

  if (body.action === "remove" && body.id) {
    await removeSupplier(user.workshopId, body.id);
    const suppliers = await getSuppliers(user.workshopId);
    return NextResponse.json({ suppliers });
  }

  if (body.action === "add" && body.name && body.phone) {
    const created = await addSupplier(user.workshopId, {
      name: body.name,
      phone: body.phone,
      notes: body.notes,
    });
    const suppliers = await getSuppliers(user.workshopId);
    return NextResponse.json({ supplier: created, suppliers });
  }

  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}
