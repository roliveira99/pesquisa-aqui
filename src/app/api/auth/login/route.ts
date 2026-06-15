import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { DEMO_ACCOUNTS } from "@/lib/auth";
import {
  createSession,
  newSessionExpiry,
  sessionCookieOptions,
  SESSION_COOKIE,
  toAuthUser,
} from "@/lib/db/auth";
import { isDatabaseReachable, prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
  }

  if (!(await isDatabaseReachable())) {
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email && a.password === password
    );
    if (!account) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }
    return NextResponse.json({ user: account.user, offline: true });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email },
    include: { workshop: { select: { name: true } } },
  });

  if (!dbUser || !(await bcrypt.compare(password, dbUser.passwordHash))) {
    return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  const user = toAuthUser(dbUser, dbUser.workshop?.name ?? null);
  const token = await createSession(dbUser.id);
  const expiresAt = newSessionExpiry();
  const response = NextResponse.json({ user });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
  return response;
}
