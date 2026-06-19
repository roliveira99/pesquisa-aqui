import { hashPassword } from "@/lib/db/auth";
import { prisma } from "@/lib/db/prisma";
import type { UserRole } from "@prisma/client";

export type WorkshopTeamMember = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export async function listWorkshopTeam(workshopId: string): Promise<WorkshopTeamMember[]> {
  const rows = await prisma.user.findMany({
    where: { workshopId, role: { in: ["dono", "gerencia", "mecanico"] } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function createWorkshopTeamMember(
  workshopId: string,
  input: {
    name: string;
    email: string;
    password: string;
    role: "gerencia" | "mecanico";
  }
): Promise<{ ok: true; member: WorkshopTeamMember } | { ok: false; error: string }> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name || !email || input.password.length < 6) {
    return { ok: false, error: "Nome, e-mail e senha (mín. 6 caracteres) são obrigatórios." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "Este e-mail já está em uso." };

  const row = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(input.password),
      role: input.role,
      workshopId,
    },
  });

  return {
    ok: true,
    member: {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: row.createdAt.toISOString(),
    },
  };
}

export async function removeWorkshopTeamMember(
  workshopId: string,
  userId: string,
  actorId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const target = await prisma.user.findFirst({ where: { id: userId, workshopId } });
  if (!target) return { ok: false, error: "Usuário não encontrado." };
  if (target.role === "dono") return { ok: false, error: "Não é possível remover o dono da oficina." };
  if (target.id === actorId) return { ok: false, error: "Você não pode remover sua própria conta." };

  await prisma.session.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
  return { ok: true };
}

export async function resetWorkshopMemberPassword(
  workshopId: string,
  userId: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (password.length < 6) return { ok: false, error: "Senha deve ter no mínimo 6 caracteres." };
  const result = await prisma.user.updateMany({
    where: { id: userId, workshopId, role: { in: ["gerencia", "mecanico"] } },
    data: { passwordHash: await hashPassword(password) },
  });
  if (result.count === 0) return { ok: false, error: "Usuário não encontrado." };
  await prisma.session.deleteMany({ where: { userId } });
  return { ok: true };
}

export async function isWorkshopBlocked(workshopId: string): Promise<boolean> {
  const w = await prisma.workshop.findUnique({ where: { id: workshopId }, select: { blocked: true } });
  return w?.blocked ?? false;
}

export async function setWorkshopBlocked(
  workshopId: string,
  blocked: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await prisma.workshop.updateMany({ where: { id: workshopId }, data: { blocked } });
  if (result.count === 0) return { ok: false, error: "Oficina não encontrada." };
  if (blocked) {
    const users = await prisma.user.findMany({ where: { workshopId }, select: { id: true } });
    await prisma.session.deleteMany({ where: { userId: { in: users.map((u) => u.id) } } });
  }
  return { ok: true };
}
