/** Imagens padrão por editoria quando a matéria não tem foto própria. */
const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  cidade: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80",
  esporte: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80",
  negocios: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80",
  cultura: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
  tecnologia: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
  servicos: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80",
  geral: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80",
};

const FALLBACK_ARTICLE_IMAGE =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80";

export function getArticleImageUrl(article: {
  imageUrl?: string | null;
  category: string;
}): string {
  const custom = article.imageUrl?.trim();
  if (custom) return custom;
  return CATEGORY_DEFAULT_IMAGES[article.category] ?? FALLBACK_ARTICLE_IMAGE;
}

export function articleHasCustomImage(article: { imageUrl?: string | null }): boolean {
  return Boolean(article.imageUrl?.trim());
}
