import { NextResponse } from "next/server";
import {
  createJournalist,
  deleteJournalist,
  listJournalists,
  updateJournalist,
} from "@/lib/db/admin";
import { getRequestUser, userHasPermission } from "@/lib/db/request-auth";

export async function GET() {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!userHasPermission(user, "admin.gerenciar_jornalistas")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const journalists = await listJournalists();
  return NextResponse.json({ journalists });
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });
  }
  if (!userHasPermission(user, "admin.gerenciar_jornalistas")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const result = await createJournalist({
    name: body.name as string,
    email: body.email as string,
    password: body.password as string,
    journalNiche: body.journalNiche as string,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });
  }
  if (!userHasPermission(user, "admin.gerenciar_jornalistas")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const result = await updateJournalist({
    id: body.id as string,
    name: body.name as string | undefined,
    journalNiche: body.journalNiche as string | undefined,
    password: body.password as string | undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}

export async function DELETE(request: Request) {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });
  }
  if (!userHasPermission(user, "admin.gerenciar_jornalistas")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });

  const result = await deleteJournalist(id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
