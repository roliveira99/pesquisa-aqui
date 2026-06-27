import { APP_NAME } from "@/lib/brand";
import { NewsDashboard, NewsFeedToolbar } from "@/components/news/NewsDashboard";
import { NewspaperClassifiedsSection } from "@/components/news/NewspaperClassifieds";
import { NewspaperCategoryNav, NewspaperMasthead } from "@/components/news/NewspaperMasthead";
import { normalizeCityFilter } from "@/lib/cities";
import { listPremiumClassifieds } from "@/lib/db/classifieds";
import { listArticles, seedArticlesIfEmpty } from "@/lib/db/articles";

export const metadata = {
  title: `Jornal — ${APP_NAME}`,
  description: "Capa do jornal: notícias de cidade, esporte, negócios, cultura e classificados premium.",
};

type Props = { searchParams: Promise<{ cidade?: string }> };

export default async function CuriosidadesPage({ searchParams }: Props) {
  const { cidade } = await searchParams;
  const cityFilter = normalizeCityFilter(cidade);

  await seedArticlesIfEmpty();
  const [articles, premiumClassifieds] = await Promise.all([
    listArticles({ activeOnly: true, city: cityFilter }),
    listPremiumClassifieds(4, cityFilter),
  ]);

  return (
    <div id="jornal-completo" className="news-feed-page newspaper-page mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <NewspaperMasthead />
      <NewspaperCategoryNav activeTab="inicio" selectedCity={cityFilter} />
      <NewsFeedToolbar />

      {articles.length === 0 && premiumClassifieds.length === 0 ? (
        <p className="py-16 text-center text-muted">
          {cityFilter
            ? `Nenhuma matéria publicada para ${cityFilter} ainda.`
            : "Nenhuma matéria publicada ainda."}
        </p>
      ) : (
        <>
          {articles.length > 0 && <NewsDashboard articles={articles} />}
          <NewspaperClassifiedsSection ads={premiumClassifieds} compact />
        </>
      )}
    </div>
  );
}
