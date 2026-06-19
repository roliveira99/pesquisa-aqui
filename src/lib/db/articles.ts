import { prisma } from "@/lib/db/prisma";

export interface SiteArticleRecord {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  icon: string;
  imageUrl: string | null;
  active: boolean;
  createdAt: string;
}

export async function listArticles(activeOnly = true): Promise<SiteArticleRecord[]> {
  const rows = await prisma.siteArticle.findMany({
    where: activeOnly ? { active: true } : {},
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapArticle);
}

export async function upsertArticle(input: {
  id?: string;
  title: string;
  summary: string;
  content: string;
  category?: string;
  icon?: string;
  imageUrl?: string;
  active?: boolean;
}): Promise<SiteArticleRecord> {
  if (input.id) {
    const row = await prisma.siteArticle.update({
      where: { id: input.id },
      data: {
        title: input.title.trim(),
        summary: input.summary.trim(),
        content: input.content.trim(),
        category: input.category?.trim() || "geral",
        icon: input.icon?.trim() || "car",
        imageUrl: input.imageUrl?.trim() || null,
        ...(input.active !== undefined ? { active: input.active } : {}),
      },
    });
    return mapArticle(row);
  }
  const row = await prisma.siteArticle.create({
    data: {
      title: input.title.trim(),
      summary: input.summary.trim(),
      content: input.content.trim(),
      category: input.category?.trim() || "geral",
      icon: input.icon?.trim() || "car",
      imageUrl: input.imageUrl?.trim() || null,
      active: input.active ?? true,
    },
  });
  return mapArticle(row);
}

export async function deleteArticle(id: string): Promise<void> {
  await prisma.siteArticle.deleteMany({ where: { id } });
}

function mapArticle(row: {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  icon: string;
  imageUrl: string | null;
  active: boolean;
  createdAt: Date;
}): SiteArticleRecord {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    category: row.category,
    icon: row.icon,
    imageUrl: row.imageUrl,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function seedArticlesIfEmpty(): Promise<void> {
  const count = await prisma.siteArticle.count();
  if (count > 0) return;
  const samples = [
    {
      title: "Quando trocar o óleo do motor?",
      summary: "Intervalos recomendados e sinais de que está na hora da revisão.",
      content: "A troca periódica do óleo protege o motor contra desgaste. Consulte o manual do veículo e registre a quilometragem a cada revisão.",
      category: "manutencao",
      icon: "wrench",
    },
    {
      title: "Como escolher uma oficina de confiança",
      summary: "Avaliações, transparência de preços e histórico de serviços.",
      content: "Prefira oficinas com perfil completo, avaliações verificadas e orçamento detalhado antes do serviço.",
      category: "dicas",
      icon: "star",
    },
  ];
  for (const s of samples) {
    await prisma.siteArticle.create({ data: { ...s, active: true } });
  }
}
