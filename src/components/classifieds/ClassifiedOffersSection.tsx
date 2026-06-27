import Link from "next/link";
import { ClassifiedProductCard } from "@/components/classifieds/ClassifiedProductCard";
import type { ClassifiedAdRecord } from "@/lib/db/classifieds";

export function ClassifiedOffersSection({
  ads,
  title = "Grandes ofertas",
  description,
  seeMoreHref = "/classificados",
  seeMoreLabel = "Ver mais",
  layout = "carousel",
  compact = false,
  hideHeader = false,
  id = "secao-classificados",
}: {
  ads: ClassifiedAdRecord[];
  title?: string;
  description?: string;
  seeMoreHref?: string;
  seeMoreLabel?: string;
  layout?: "carousel" | "grid";
  compact?: boolean;
  hideHeader?: boolean;
  id?: string;
}) {
  if (ads.length === 0) return null;

  const variant = layout === "carousel" ? "carousel" : "grid";

  return (
    <section
      id={id}
      className={`classified-marketplace ${compact ? "classified-marketplace-compact" : ""}`}
    >
      {!hideHeader && (
        <header className="classified-section-header">
          <div>
            <h2 className="classified-section-title">{title}</h2>
            {description && <p className="classified-section-desc">{description}</p>}
          </div>
          <Link href={seeMoreHref} className="classified-section-more">
            {seeMoreLabel}
          </Link>
        </header>
      )}

      {layout === "carousel" ? (
        <div className="classified-carousel-wrap">
          <div className="classified-carousel-track" role="list">
            {ads.map((ad) => (
              <div key={ad.id} className="classified-carousel-item" role="listitem">
                <ClassifiedProductCard ad={ad} variant={variant} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="classified-product-grid">
          {ads.map((ad) => (
            <ClassifiedProductCard key={ad.id} ad={ad} variant="grid" />
          ))}
        </div>
      )}
    </section>
  );
}

export function ClassifiedCategoryBar({
  active,
  counts,
  cityFilter,
}: {
  active?: string;
  counts: Record<string, number>;
  cityFilter?: string;
}) {
  const cityQs = cityFilter ? `&cidade=${encodeURIComponent(cityFilter)}` : "";
  const categories = [
    { value: "all", label: "Todos" },
    { value: "vendas", label: "Vendas" },
    { value: "veiculos", label: "Veículos" },
    { value: "pecas", label: "Peças" },
    { value: "servicos", label: "Serviços" },
    { value: "geral", label: "Geral" },
  ];

  return (
    <nav className="classified-category-bar" aria-label="Categorias de classificados">
      {categories.map((cat) => {
        const count = cat.value === "all"
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[cat.value] ?? 0;
        if (cat.value !== "all" && count === 0) return null;

        const href =
          cat.value === "all"
            ? cityFilter
              ? `/classificados?cidade=${encodeURIComponent(cityFilter)}`
              : "/classificados"
            : `/classificados?categoria=${cat.value}${cityQs}`;
        const isActive = (active ?? "all") === cat.value;

        return (
          <Link
            key={cat.value}
            href={href}
            className={`classified-category-pill ${isActive ? "classified-category-pill-active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {cat.label}
          </Link>
        );
      })}
    </nav>
  );
}
