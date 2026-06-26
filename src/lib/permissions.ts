import type { BusinessVertical } from "@/types/vertical";
import type { NavItem, Permission, UserRole } from "@/types/auth";
import { getCategoryLabel } from "@/lib/article-categories";

/** Perfis operacionais descontinuados — sem acesso ao painel. */
export const DEPRECATED_ROLES: UserRole[] = ["gerencia", "mecanico"];

export const roleLabels: Record<UserRole, string> = {
  master: "Administrador Master",
  jornalista: "Jornalista",
  dono: "Dono do perfil",
  gerencia: "Gerência (descontinuado)",
  mecanico: "Mecânico (descontinuado)",
};

export const roleIcons: Record<UserRole, string> = {
  master: "users",
  jornalista: "sparkles",
  dono: "building",
  gerencia: "clipboard",
  mecanico: "wrench",
};

const masterPermissions: Permission[] = [
  "admin.aprovar_oficinas",
  "admin.criar_contas",
  "admin.visualizar_oficinas",
  "admin.relatorios_globais",
  "admin.dashboard_geral",
  "admin.controle_assinaturas",
  "admin.bloquear_oficinas",
  "admin.suporte",
  "admin.moderar_avaliacoes",
  "admin.gerenciar_patrocinios",
  "admin.gerenciar_anuncios",
  "admin.gerenciar_jornalistas",
];

const jornalistaPermissions: Permission[] = ["jornalista.gerenciar_manchetes"];

/** Dono: apenas perfil público, classificados e agenda. */
const donoPermissions: Permission[] = [
  "owner.dashboard",
  "owner.perfil",
  "owner.classificados",
  "owner.catalogo",
  "owner.agenda",
];

const gerenciaPermissions: Permission[] = [];
const mecanicoPermissions: Permission[] = [];

export const rolePermissions: Record<UserRole, Permission[]> = {
  master: masterPermissions,
  jornalista: jornalistaPermissions,
  dono: donoPermissions,
  gerencia: gerenciaPermissions,
  mecanico: mecanicoPermissions,
};

export const roleRestrictions: Record<UserRole, string[]> = {
  master: ["Alterar dados operacionais sem permissão do perfil"],
  jornalista: [
    "Publica apenas na editoria atribuída",
    "Não define capa do jornal na home",
    "Não promove classificados premium",
  ],
  dono: [
    "Personaliza o perfil público no site",
    "Publica classificados e gerencia agenda",
    "Sem gestão operacional (estoque, financeiro, etc.)",
  ],
  gerencia: ["Perfil descontinuado — solicite migração ao administrador"],
  mecanico: ["Perfil descontinuado — solicite migração ao administrador"],
};

export const navigationByRole: Record<UserRole, NavItem[]> = {
  master: [
    { href: "/dashboard", label: "Dashboard geral", icon: "dashboard", permission: "admin.dashboard_geral" },
    {
      href: "/dashboard/admin/oficinas",
      label: "Perfis no site",
      icon: "building",
      permission: "admin.visualizar_oficinas",
      group: "Gestão da plataforma",
    },
    {
      href: "/dashboard/admin/contas",
      label: "Acessos de perfis",
      icon: "users",
      permission: "admin.criar_contas",
      group: "Gestão da plataforma",
    },
    {
      href: "/dashboard/admin/patrocinios",
      label: "Patrocínios",
      icon: "star",
      permission: "admin.gerenciar_patrocinios",
      group: "Gestão da plataforma",
    },
    {
      href: "/dashboard/admin/assinaturas",
      label: "Assinaturas e planos",
      icon: "credit-card",
      permission: "admin.controle_assinaturas",
      group: "Gestão da plataforma",
    },
    {
      href: "/dashboard/admin/anuncios?tab=jornal",
      label: "Jornal / Manchetes",
      icon: "sparkles",
      permission: "admin.gerenciar_anuncios",
      group: "Gestão da plataforma",
    },
    {
      href: "/dashboard/admin/anuncios?tab=jornalistas",
      label: "Jornalistas",
      icon: "users",
      permission: "admin.gerenciar_jornalistas",
      group: "Gestão da plataforma",
    },
    {
      href: "/dashboard/admin/anuncios?tab=classificados",
      label: "Classificados premium",
      icon: "package",
      permission: "admin.gerenciar_anuncios",
      group: "Gestão da plataforma",
    },
    {
      href: "/dashboard/admin/anuncios?tab=banners",
      label: "Banners e pop-ups",
      icon: "file",
      permission: "admin.gerenciar_anuncios",
      group: "Gestão da plataforma",
    },
    {
      href: "/dashboard/admin/avaliacoes",
      label: "Moderação de avaliações",
      icon: "clipboard",
      permission: "admin.moderar_avaliacoes",
      group: "Gestão da plataforma",
    },
    {
      href: "/dashboard/admin/relatorios",
      label: "Relatórios globais",
      icon: "chart",
      permission: "admin.relatorios_globais",
      group: "Gestão da plataforma",
    },
    {
      href: "/dashboard/admin/suporte",
      label: "Suporte",
      icon: "headset",
      permission: "admin.suporte",
      group: "Gestão da plataforma",
    },
  ],
  jornalista: [
    {
      href: "/dashboard/jornal",
      label: "Minha editoria",
      icon: "sparkles",
      permission: "jornalista.gerenciar_manchetes",
    },
  ],
  dono: [
    { href: "/dashboard", label: "Início", icon: "dashboard", permission: "owner.dashboard" },
    {
      href: "/dashboard/perfil",
      label: "Meu perfil no site",
      icon: "sparkles",
      permission: "owner.perfil",
      group: "Meu site",
    },
    {
      href: "/dashboard/classificados",
      label: "Classificados",
      icon: "package",
      permission: "owner.classificados",
      group: "Meu site",
    },
    {
      href: "/dashboard/catalogo",
      label: "Catálogo",
      icon: "clipboard",
      permission: "owner.catalogo",
      group: "Meu site",
    },
    {
      href: "/dashboard/agenda",
      label: "Agenda",
      icon: "calendar",
      permission: "owner.agenda",
      group: "Meu site",
    },
  ],
  gerencia: [],
  mecanico: [],
};

/** Rotas extras permitidas além do menu (aliases). */
const OWNER_EXTRA_ROUTES = ["/dashboard/midia"];

export function isDeprecatedRole(role: UserRole): boolean {
  return DEPRECATED_ROLES.includes(role);
}

export function getDashboardHomeHref(role: UserRole): string {
  return navigationByRole[role][0]?.href ?? "/dashboard";
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export const agendaPermissions: Permission[] = ["owner.agenda"];

export function getRoleLabel(
  role: UserRole,
  _vertical?: BusinessVertical | null,
  journalNiche?: string | null
): string {
  if (role === "jornalista" && journalNiche) {
    return `Jornalista — ${getCategoryLabel(journalNiche)}`;
  }
  return roleLabels[role];
}

export function getNavItems(role: UserRole, _vertical?: BusinessVertical | null): NavItem[] {
  return navigationByRole[role] ?? [];
}

function routeMatches(pathname: string, href: string): boolean {
  const baseHref = href.split("?")[0];
  return pathname === baseHref || pathname.startsWith(`${baseHref}/`);
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  if (isDeprecatedRole(role)) {
    return pathname === "/dashboard";
  }

  const items = navigationByRole[role];
  const fromNav = items.some((item) => routeMatches(pathname, item.href));

  if (role === "dono") {
    return fromNav || OWNER_EXTRA_ROUTES.some((route) => routeMatches(pathname, route));
  }

  if (pathname === "/dashboard") {
    return items.length > 0 || role === "master";
  }

  return fromNav;
}
