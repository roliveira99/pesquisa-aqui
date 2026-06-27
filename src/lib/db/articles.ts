import { slugifyTitle } from "@/lib/article-slug";
import { prisma } from "@/lib/db/prisma";

export interface SiteArticleRecord {
  id: string;
  slug: string | null;
  title: string;
  summary: string;
  content: string;
  category: string;
  city: string | null;
  icon: string;
  imageUrl: string | null;
  featured: boolean;
  active: boolean;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base || "noticia";
  let n = 0;
  while (true) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const existing = await prisma.siteArticle.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    n += 1;
  }
}

export interface ListArticlesOptions {
  activeOnly?: boolean;
  category?: string;
  city?: string;
}

export async function listArticles(
  activeOnlyOrOptions: boolean | ListArticlesOptions = true
): Promise<SiteArticleRecord[]> {
  const options: ListArticlesOptions =
    typeof activeOnlyOrOptions === "boolean"
      ? { activeOnly: activeOnlyOrOptions }
      : activeOnlyOrOptions;
  const activeOnly = options.activeOnly ?? true;
  const rows = await prisma.siteArticle.findMany({
    where: {
      ...(activeOnly ? { active: true } : {}),
      ...(options.category ? { category: options.category } : {}),
      ...(options.city ? { city: options.city } : {}),
    },
    include: { author: { select: { name: true } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(mapArticle);
}

export async function getArticleAdminById(id: string): Promise<SiteArticleRecord | null> {
  const row = await prisma.siteArticle.findUnique({
    where: { id },
    include: { author: { select: { name: true } } },
  });
  return row ? mapArticle(row) : null;
}

export function pickLeadArticle(articles: SiteArticleRecord[]): SiteArticleRecord | null {
  if (articles.length === 0) return null;
  return articles.find((a) => a.featured) ?? articles[0];
}

export function articlesByCategory(
  articles: SiteArticleRecord[],
  category: string,
  excludeId?: string,
  limit = 4
): SiteArticleRecord[] {
  return articles
    .filter((a) => a.category === category && a.id !== excludeId)
    .slice(0, limit);
}

export async function getArticleBySlugOrId(slugOrId: string): Promise<SiteArticleRecord | null> {
  const row =
    (await prisma.siteArticle.findFirst({
      where: { slug: slugOrId, active: true },
    })) ??
    (await prisma.siteArticle.findFirst({
      where: { id: slugOrId, active: true },
    }));
  return row ? mapArticle(row) : null;
}

export async function getRelatedArticles(
  articleId: string,
  category: string,
  limit = 4
): Promise<SiteArticleRecord[]> {
  const rows = await prisma.siteArticle.findMany({
    where: { active: true, id: { not: articleId }, category },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(mapArticle);
}

export async function upsertArticle(input: {
  id?: string;
  title: string;
  summary: string;
  content: string;
  category?: string;
  city?: string | null;
  icon?: string;
  imageUrl?: string | null;
  featured?: boolean;
  active?: boolean;
  slug?: string;
  authorId?: string | null;
}): Promise<SiteArticleRecord> {
  const baseSlug = slugifyTitle(input.slug ?? input.title);
  const allowFeatured = input.featured === true;

  if (allowFeatured) {
    await prisma.siteArticle.updateMany({
      where: input.id ? { id: { not: input.id } } : {},
      data: { featured: false },
    });
  }

  if (input.id) {
    const row = await prisma.siteArticle.update({
      where: { id: input.id },
      data: {
        title: input.title.trim(),
        summary: input.summary.trim(),
        content: input.content.trim(),
        category: input.category?.trim() || "geral",
        city: input.city?.trim() || null,
        icon: input.icon?.trim() || "car",
        imageUrl: input.imageUrl?.trim() || null,
        slug: await uniqueSlug(baseSlug, input.id),
        ...(input.featured !== undefined ? { featured: input.featured } : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
        ...(input.authorId !== undefined ? { authorId: input.authorId } : {}),
      },
      include: { author: { select: { name: true } } },
    });
    return mapArticle(row);
  }

  const row = await prisma.siteArticle.create({
    data: {
      title: input.title.trim(),
      summary: input.summary.trim(),
      content: input.content.trim(),
      category: input.category?.trim() || "geral",
      city: input.city?.trim() || null,
      icon: input.icon?.trim() || "car",
      imageUrl: input.imageUrl?.trim() || null,
      slug: await uniqueSlug(baseSlug),
      featured: input.featured ?? false,
      active: input.active ?? true,
      authorId: input.authorId ?? null,
    },
    include: { author: { select: { name: true } } },
  });
  return mapArticle(row);
}

export async function setArticleActive(id: string, active: boolean): Promise<boolean> {
  const result = await prisma.siteArticle.updateMany({ where: { id }, data: { active } });
  return result.count > 0;
}

export async function deleteArticle(id: string): Promise<void> {
  await prisma.siteArticle.deleteMany({ where: { id } });
}

function mapArticle(row: {
  id: string;
  slug: string | null;
  title: string;
  summary: string;
  content: string;
  category: string;
  city: string | null;
  icon: string;
  imageUrl: string | null;
  featured: boolean;
  active: boolean;
  authorId?: string | null;
  author?: { name: string } | null;
  createdAt: Date;
}): SiteArticleRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: row.content,
    category: row.category,
    city: row.city,
    icon: row.icon,
    imageUrl: row.imageUrl,
    featured: row.featured,
    active: row.active,
    authorId: row.authorId ?? null,
    authorName: row.author?.name ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function backfillArticleSlugs(): Promise<number> {
  const rows = await prisma.siteArticle.findMany({ where: { slug: null } });
  let updated = 0;
  for (const row of rows) {
    await prisma.siteArticle.update({
      where: { id: row.id },
      data: { slug: await uniqueSlug(slugifyTitle(row.title), row.id) },
    });
    updated += 1;
  }
  return updated;
}

export async function seedArticlesIfEmpty(): Promise<void> {
  await backfillArticleSlugs();
  const count = await prisma.siteArticle.count();
  if (count > 0) return;

  const samples = [
    {
      title: "Prefeitura anuncia obras de revitalização no centro da cidade",
      summary: "Investimento previsto para calçadas, iluminação e faixas exclusivas para ônibus.",
      content:
        "A administração municipal confirmou o cronograma das obras de revitalização do centro, com início previsto para o próximo trimestre.\n\n" +
        "Comerciantes locais serão consultados em audiências públicas. A expectativa é melhorar mobilidade e atrair mais visitantes à região.",
      category: "cidade",
      city: "São Paulo",
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80",
    },
    {
      title: "Time local vence clássico regional e assume liderança",
      summary: "Gol nos acréscimos garante três pontos na rodada do campeonato estadual.",
      content:
        "Em partida emocionante no estádio municipal, o time da casa superou o rival por 2 a 1 e assumiu a ponta da tabela.\n\n" +
        "O técnico destacou a entrega do elenco e confirmou que busca reforços para a segunda fase da competição.",
      category: "esporte",
      city: "Rio de Janeiro",
      imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80",
    },
    {
      title: "Feira de empreendedores reunirá 80 expositores no fim de semana",
      summary: "Evento gratuito conecta pequenos negócios a clientes da região.",
      content:
        "A feira acontece no parque central, com foco em gastronomia, artesanato e serviços locais. Haverá palestras sobre crédito e marketing digital para MEIs.",
      category: "negocios",
      city: "Campinas",
      imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80",
    },
    {
      title: "Festival de música independente confirma atrações nacionais",
      summary: "Programação gratuita em três palcos espalhados pela orla.",
      content:
        "O festival retorna após dois anos com foco em artistas locais e bandas convidadas. A organização estima público de 15 mil pessoas durante o fim de semana.",
      category: "cultura",
      city: "Salvador",
      imageUrl: "https://images.unsplash.com/photo-1459749411177-041a6838c9c0?w=1200&q=80",
    },
    {
      title: "Como escolher serviços locais com avaliações verificadas",
      summary: "Plataforma reúne negócios da região com histórico de atendimentos.",
      content:
        "Antes de fechar um serviço, compare perfis, leia avaliações de clientes reais e peça orçamento detalhado. Transparência é o principal indicador de confiança.",
      category: "servicos",
      city: "Curitiba",
    },
    {
      title: "Novas ferramentas de IA chegam a pequenas empresas",
      summary: "Soluções acessíveis ajudam na gestão de estoque e atendimento.",
      content:
        "Pequenos comércios passam a adotar assistentes virtuais e automações simples para responder clientes e organizar agenda — sem necessidade de equipe técnica.",
      category: "tecnologia",
      city: "São Paulo",
    },
  ];

  for (const s of samples) {
    await upsertArticle(s);
  }
}
