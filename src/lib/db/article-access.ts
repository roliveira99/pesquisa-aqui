import type { AuthUser } from "@/types/auth";
import { userHasPermission } from "@/lib/db/request-auth";

export function canManageJournalArticles(user: AuthUser): boolean {
  if (user.role === "master" && userHasPermission(user, "admin.gerenciar_anuncios")) {
    return true;
  }
  return user.role === "jornalista" && userHasPermission(user, "jornalista.gerenciar_manchetes");
}

export function journalistCategory(user: AuthUser): string | null {
  if (user.role !== "jornalista") return null;
  return user.journalNiche?.trim() || null;
}

export function canManageArticleCategory(user: AuthUser, category: string): boolean {
  if (user.role === "master") return true;
  const niche = journalistCategory(user);
  return !!niche && niche === category;
}
