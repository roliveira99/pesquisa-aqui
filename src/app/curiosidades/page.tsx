import { APP_NAME } from "@/lib/brand";
import {
  NewspaperLeadStory,
  NewspaperHeadlineGrid,
  NewspaperCategorySections,
} from "@/components/news/NewspaperArticles";
import { NewspaperCategoryNav, NewspaperMasthead } from "@/components/news/NewspaperMasthead";
import { groupArticlesForJournalPage } from "@/components/news/NewspaperHomeTop";
import { listArticles, seedArticlesIfEmpty } from "@/lib/db/articles";

export const metadata = {
  title: `Jornal — ${APP_NAME}`,
  description: "Notícias de cidade, esporte, negócios, cultura e serviços da sua região.",
};

export default async function CuriosidadesPage() {
  await seedArticlesIfEmpty();
  const articles = await listArticles(true);
  const { lead, sidebar } = groupArticlesForJournalPage(articles);
  const activeCategories = [...new Set(articles.map((a) => a.category))];

  return (
    <div className="newspaper-page mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <NewspaperMasthead />
      <NewspaperCategoryNav activeCategories={activeCategories} />

      {articles.length === 0 ? (
        <p className="py-16 text-center text-muted">Nenhuma matéria publicada ainda.</p>
      ) : (
        <>
          <div className="grid gap-8 lg:grid-cols-3">
            {lead && <NewspaperLeadStory article={lead} />}
            <NewspaperHeadlineGrid articles={sidebar} />
          </div>
          <NewspaperCategorySections articles={articles} />
        </>
      )}
    </div>
  );
}
