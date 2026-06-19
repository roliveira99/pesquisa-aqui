import { NextResponse } from "next/server";
import { listManagerGrants, setManagerGrant, userHasGrant } from "@/lib/db/manager-permissions";
import { getRequestUser, userHasPermission } from "@/lib/db/request-auth";
import type { Permission } from "@/types/auth";

export async function GET() {
  const user = await getRequestUser();
  if (!user?.workshopId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (user.role === "gerencia") {
    const grants: Permission[] = [];
    const candidates: Permission[] = [
      "owner.fluxo_caixa",
      "owner.contas_pagar",
      "owner.contas_receber",
      "owner.estoque",
      "owner.salarios",
      "owner.comissoes",
    ];
    for (const p of candidates) {
      if (await userHasGrant(user.id, p)) grants.push(p);
    }
    return NextResponse.json({ grants });
  }

  if (!userHasPermission(user, "owner.cadastro_funcionarios")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const data = await listManagerGrants(user.workshopId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user?.workshopId || !userHasPermission(user, "owner.cadastro_funcionarios")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = (await request.json()) as {
    userId: string;
    permission: string;
    granted: boolean;
  };

  const result = await setManagerGrant(
    user.workshopId,
    body.userId,
    body.permission,
    body.granted
  );
  return NextResponse.json(result);
}
