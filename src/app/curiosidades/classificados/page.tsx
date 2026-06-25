import { APP_NAME } from "@/lib/brand";
import { ClassifiedOffersSection } from "@/components/classifieds/ClassifiedOffersSection";
import { NewspaperCategoryNav, NewspaperMasthead } from "@/components/news/NewspaperMasthead";
import { listPremiumClassifieds } from "@/lib/db/classifieds";

export const metadata = {
  title: `Classificados premium — Jornal ${APP_NAME}`,
  description: "Anúncios em destaque no jornal digital.",
};

export default async function JournalClassifiedsPage() {
  const premiumClassifieds = await listPremiumClassifieds(24);

  return (
    <div className="classified-marketplace-page news-feed-page newspaper-page mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <NewspaperMasthead />
      <NewspaperCategoryNav activeTab="classificados" />

      <header className="classified-page-header classified-page-header-inline">
        <h2 className="classified-page-title">Classificados premium</h2>
        <p className="classified-page-subtitle">
          Anúncios selecionados para o jornal — negócios locais em destaque na sua região.
        </p>
      </header>

      {premiumClassifieds.length === 0 ? (
        <p className="classified-empty">Nenhum classificado premium publicado ainda.</p>
      ) : (
        <>
          <ClassifiedOffersSection
            ads={premiumClassifieds}
            title="Grandes ofertas"
            layout="grid"
            seeMoreHref="/classificados"
            hideHeader
          />
        </>
      )}
    </div>
  );
}
