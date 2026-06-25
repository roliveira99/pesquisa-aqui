import Link from "next/link";
import {
  ClassifiedCategoryBar,
  ClassifiedOffersSection,
} from "@/components/classifieds/ClassifiedOffersSection";
import { formatClassifiedCategory, listClassifieds } from "@/lib/db/classifieds";

type Props = { searchParams: Promise<{ categoria?: string }> };

export default async function ClassificadosPage({ searchParams }: Props) {
  const { categoria } = await searchParams;
  const allAds = await listClassifieds({ activeOnly: true });
  const categoryFilter = categoria && categoria !== "all" ? categoria : undefined;
  const ads = categoryFilter
    ? allAds.filter((a) => a.category === categoryFilter)
    : allAds;

  const premium = ads.filter((a) => a.premium);
  const regular = ads.filter((a) => !a.premium);

  const counts = allAds.reduce<Record<string, number>>((acc, ad) => {
    acc[ad.category] = (acc[ad.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="classified-marketplace-page mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="classified-page-header">
        <h1 className="classified-page-title">Classificados</h1>
        <p className="classified-page-subtitle">
          Compre, venda e divulgue na sua região — anúncios premium também aparecem no jornal.
        </p>
      </header>

      <ClassifiedCategoryBar active={categoryFilter ?? "all"} counts={counts} />

      {ads.length === 0 ? (
        <p className="classified-empty">Nenhum classificado publicado nesta categoria.</p>
      ) : (
        <>
          {premium.length > 0 && (
            <ClassifiedOffersSection
              ads={premium}
              title="Grandes ofertas"
              description="Destaques selecionados — os mais procurados da região"
              layout="carousel"
              seeMoreHref="/curiosidades/classificados"
              id="classificados-premium"
            />
          )}

          {regular.length > 0 && (
            <ClassifiedOffersSection
              ads={regular}
              title={premium.length > 0 ? "Mais anúncios" : "Todos os anúncios"}
              description={
                categoryFilter
                  ? `Resultados em ${formatClassifiedCategory(categoryFilter)}`
                  : "Explore oportunidades de negócios locais"
              }
              layout="grid"
              seeMoreHref="/login"
              seeMoreLabel="Anunciar"
              id="classificados-todos"
            />
          )}
        </>
      )}

      <p className="classified-page-footer">
        É dono de negócio?{" "}
        <Link href="/login" className="classified-footer-link">
          Publique no painel
        </Link>
        {" · "}
        Destaque premium no jornal via administrador.
      </p>
    </div>
  );
}
