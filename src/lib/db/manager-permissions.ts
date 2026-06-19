import { prisma } from "@/lib/db/prisma";
import type { Permission } from "@/types/auth";

const GRANTABLE_PERMISSIONS: Permission[] = [
  "owner.fluxo_caixa",
  "owner.contas_pagar",
  "owner.contas_receber",
  "owner.estoque",
  "owner.salarios",
  "owner.comissoes",
  "gerencia.estoque",
  "gerencia.emissao_notas",
];

export async function listManagerGrants(workshopId: string) {
  const [grants, managers] = await Promise.all([
    prisma.managerPermissionGrant.findMany({ where: { workshopId } }),
    prisma.user.findMany({ where: { workshopId, role: "gerencia" } }),
  ]);

  return {
    managers: managers.map((m) => ({ id: m.id, name: m.name, email: m.email })),
    grants: grants.map((g) => ({
      id: g.id,
      userId: g.userId,
      permission: g.permission as Permission,
      granted: g.granted,
    })),
    grantablePermissions: GRANTABLE_PERMISSIONS,
  };
}

export async function setManagerGrant(
  workshopId: string,
  userId: string,
  permission: string,
  granted: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const manager = await prisma.user.findFirst({
    where: { id: userId, workshopId, role: "gerencia" },
  });
  if (!manager) return { ok: false, error: "Gerente não encontrado nesta oficina." };

  await prisma.managerPermissionGrant.upsert({
    where: { userId_permission: { userId, permission } },
    create: { workshopId, userId, permission, granted },
    update: { granted },
  });

  return { ok: true };
}

export async function userHasGrant(userId: string, permission: Permission): Promise<boolean> {
  const grant = await prisma.managerPermissionGrant.findUnique({
    where: { userId_permission: { userId, permission } },
  });
  return grant?.granted ?? false;
}

export { GRANTABLE_PERMISSIONS };
