import { NextResponse } from "next/server";
import {
  createWorkshopTeamMember,
  listWorkshopTeam,
  removeWorkshopTeamMember,
  resetWorkshopMemberPassword,
} from "@/lib/db/workshop-team";
import { getRequestUser, userHasPermission } from "@/lib/db/request-auth";
import { setManagerGrant } from "@/lib/db/manager-permissions";

export async function GET() {
  const user = await getRequestUser();
  if (!user?.workshopId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  if (!userHasPermission(user, "owner.cadastro_funcionarios") && user.role !== "dono") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const members = await listWorkshopTeam(user.workshopId);
  return NextResponse.json({ members: members.filter((m) => m.id !== user.id || m.role !== "dono") });
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user?.workshopId || user.role !== "dono") {
    return NextResponse.json({ error: "Apenas o dono pode gerenciar a equipe." }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const action = body.action as string;

  switch (action) {
    case "create": {
      const result = await createWorkshopTeamMember(user.workshopId, {
        name: body.name as string,
        email: body.email as string,
        password: body.password as string,
        role: body.role as "gerencia" | "mecanico",
      });
      return NextResponse.json(result);
    }
    case "remove": {
      const result = await removeWorkshopTeamMember(
        user.workshopId,
        body.userId as string,
        user.id
      );
      return NextResponse.json(result);
    }
    case "reset-password": {
      const result = await resetWorkshopMemberPassword(
        user.workshopId,
        body.userId as string,
        body.password as string
      );
      return NextResponse.json(result);
    }
    case "grant": {
      const result = await setManagerGrant(
        user.workshopId,
        body.userId as string,
        body.permission as string,
        body.granted as boolean
      );
      return NextResponse.json(result);
    }
    default:
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }
}
