import { NextResponse } from "next/server";
import { DEMO_ACCOUNTS } from "@/lib/auth";
import { getRequestUser } from "@/lib/db/request-auth";
import { isDatabaseReachable } from "@/lib/db/prisma";

export async function GET() {
  const user = await getRequestUser();
  if (user) {
    return NextResponse.json({ user });
  }

  if (!(await isDatabaseReachable())) {
    return NextResponse.json({ user: null, offline: true });
  }

  return NextResponse.json({ user: null });
}

/** Fallback offline: aceita sessão em memória via header (não usado em produção). */
export async function POST(request: Request) {
  if (await isDatabaseReachable()) {
    return NextResponse.json({ error: "Use login com banco configurado." }, { status: 400 });
  }

  const body = (await request.json()) as { email?: string; password?: string };
  const account = DEMO_ACCOUNTS.find(
    (a) => a.email === body.email && a.password === body.password
  );

  if (!account) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  return NextResponse.json({ user: account.user, offline: true });
}
