import { ClassifiedOffersSection } from "@/components/classifieds/ClassifiedOffersSection";

export {
  ClassifiedOffersSection,
  ClassifiedCategoryBar,
} from "@/components/classifieds/ClassifiedOffersSection";
export { ClassifiedProductCard } from "@/components/classifieds/ClassifiedProductCard";
export function NewspaperClassifiedsSection({
  ads,
  compact = false,
  hideTitle = false,
}: {
  ads: Parameters<typeof ClassifiedOffersSection>[0]["ads"];
  compact?: boolean;
  hideTitle?: boolean;
}) {
  if (ads.length === 0) return null;

  return (
    <ClassifiedOffersSection
      ads={ads}
      title="Grandes ofertas"
      description="Anúncios em destaque — vendas, serviços e oportunidades da região"
      seeMoreHref="/curiosidades/classificados"
      layout={compact ? "carousel" : "grid"}
      compact={compact}
      hideHeader={hideTitle}
    />
  );
}

/** @deprecated Use ClassifiedProductCard */
export { ClassifiedProductCard as NewspaperClassifiedCard } from "@/components/classifieds/ClassifiedProductCard";
