import { NextResponse } from "next/server";
import {
  deleteArticle,
  getArticleAdminById,
  listArticles,
  seedArticlesIfEmpty,
  setArticleActive,
  upsertArticle,
} from "@/lib/db/articles";
import {
  canManageArticleCategory,
  canManageJournalArticles,
  journalistCategory,
} from "@/lib/db/article-access";
import { getRequestUser } from "@/lib/db/request-auth";
import { isPlatformCity } from "@/lib/cities";

async function assertArticleAccess(user: import("@/types/auth").AuthUser, articleId: string) {
  const article = await getArticleAdminById(articleId);
  if (!article) return { ok: false as const, status: 404, error: "Manchete não encontrada." };
  if (!canManageArticleCategory(user, article.category)) {
    return { ok: false as const, status: 403, error: "Sem permissão para esta editoria." };
  }
  return { ok: true as const, article };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get("admin") === "1";

  if (admin) {
    const user = await getRequestUser();
    if (!user || !canManageJournalArticles(user)) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    await seedArticlesIfEmpty();
    const category = user.role === "jornalista" ? journalistCategory(user) ?? undefined : undefined;
    const articles = await listArticles({ activeOnly: false, category });
    return NextResponse.json({ articles });
  }

  await seedArticlesIfEmpty();
  const articles = await listArticles({ activeOnly: true });
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user || !canManageJournalArticles(user)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const action = body.action as string;
  const isMaster = user.role === "master";
  const niche = journalistCategory(user);

  switch (action) {
    case "upsert": {
      const category = isMaster
        ? (body.category as string | undefined)
        : niche ?? undefined;

      if (!category || !canManageArticleCategory(user, category)) {
        return NextResponse.json({ error: "Editoria não permitida." }, { status: 403 });
      }

      if (body.id) {
        const access = await assertArticleAccess(user, body.id as string);
        if (!access.ok) {
          return NextResponse.json({ error: access.error }, { status: access.status });
        }
      }

      const cityInput =
        (body.city as string | null | undefined)?.trim() ||
        (user.role === "jornalista" ? user.journalCity?.trim() : undefined);

      if (!cityInput || !isPlatformCity(cityInput)) {
        return NextResponse.json(
          { error: "Selecione a cidade da matéria." },
          { status: 400 }
        );
      }

      const article = await upsertArticle({
        id: body.id as string | undefined,
        title: body.title as string,
        summary: body.summary as string,
        content: body.content as string,
        category,
        city: cityInput,
        icon: body.icon as string | undefined,
        imageUrl: body.imageUrl as string | null | undefined,
        featured: isMaster ? (body.featured as boolean | undefined) : false,
        active: body.active as boolean | undefined,
        authorId: body.id ? undefined : user.id,
      });
      return NextResponse.json({ ok: true, article });
    }
    case "toggle-active": {
      const access = await assertArticleAccess(user, body.id as string);
      if (!access.ok) {
        return NextResponse.json({ error: access.error }, { status: access.status });
      }
      const ok = await setArticleActive(body.id as string, body.active as boolean);
      return NextResponse.json({ ok });
    }
    case "delete": {
      const access = await assertArticleAccess(user, body.id as string);
      if (!access.ok) {
        return NextResponse.json({ error: access.error }, { status: access.status });
      }
      await deleteArticle(body.id as string);
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }
}
