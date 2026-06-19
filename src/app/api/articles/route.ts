import { NextResponse } from "next/server";
import {
  deleteArticle,
  listArticles,
  seedArticlesIfEmpty,
  upsertArticle,
} from "@/lib/db/articles";
import { getRequestUser, userHasPermission } from "@/lib/db/request-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get("admin") === "1";

  if (admin) {
    const user = await getRequestUser();
    if (!user || user.role !== "master") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    await seedArticlesIfEmpty();
    const articles = await listArticles(false);
    return NextResponse.json({ articles });
  }

  await seedArticlesIfEmpty();
  const articles = await listArticles(true);
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user || user.role !== "master") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  if (!userHasPermission(user, "admin.gerenciar_anuncios")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const action = body.action as string;

  switch (action) {
    case "upsert": {
      const article = await upsertArticle({
        id: body.id as string | undefined,
        title: body.title as string,
        summary: body.summary as string,
        content: body.content as string,
        category: body.category as string | undefined,
        icon: body.icon as string | undefined,
        imageUrl: body.imageUrl as string | undefined,
        active: body.active as boolean | undefined,
      });
      return NextResponse.json({ ok: true, article });
    }
    case "delete": {
      await deleteArticle(body.id as string);
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }
}
