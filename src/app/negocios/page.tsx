import { Suspense } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SiteAnnouncements } from "@/components/site/SiteAnnouncements";
import { WorkshopDirectory } from "@/components/workshop/WorkshopGrid";
import { CitySelector } from "@/components/region/CitySelector";
import { normalizeCityFilter } from "@/lib/cities";
import { getSponsorshipTier, sortWorkshopsBySponsorship } from "@/lib/db/platform";
import { listWorkshops } from "@/lib/db/workshops";
import { getVerticalConfig, VERTICAL_LIST } from "@/lib/verticals/config";
import type { BusinessVertical } from "@/types/vertical";
import type { SponsorshipTier } from "@/types/platform-admin";

function DirectoryFallback() {
  return <p className="py-12 text-center text-muted">Carregando negócios...</p>;
}

interface PageProps {
  searchParams: Promise<{ segmento?: string; cidade?: string }>;
}

export default async function NegociosPage({ searchParams }: PageProps) {
  const { segmento, cidade } = await searchParams;
  const vertical = (segmento as BusinessVertical | undefined) ?? undefined;
  const cityFilter = normalizeCityFilter(cidade);
  const verticalConfig = getVerticalConfig(vertical ?? null);

  const workshops = await sortWorkshopsBySponsorship(
    await listWorkshops({
      ...(vertical ? { vertical } : {}),
      ...(cityFilter ? { city: cityFilter } : {}),
    })
  );
  const tiers: Record<string, SponsorshipTier> = {};
  for (const w of workshops) {
    tiers[w.id] = await getSponsorshipTier(w.id);
  }

  const cityQs = cityFilter ? `&cidade=${encodeURIComponent(cityFilter)}` : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SiteAnnouncements placement="oficinas_topo" className="mb-8" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>Cidade:</span>
          <Suspense fallback={<span>Carregando…</span>}>
            <CitySelector />
          </Suspense>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <span className="self-center text-sm text-muted">Segmento:</span>
        <a
          href={cityFilter ? `/negocios?cidade=${encodeURIComponent(cityFilter)}` : "/negocios"}
          className={`rounded-full border px-3 py-1 text-sm transition ${
            !vertical ? "border-accent bg-accent-soft text-accent" : "border-border text-muted-foreground hover:border-accent"
          }`}
        >
          Todos
        </a>
        {VERTICAL_LIST.map((v) => (
          <a
            key={v.id}
            href={`/negocios?segmento=${v.id}${cityQs}`}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              vertical === v.id ? "border-accent bg-accent-soft text-accent" : "border-border text-muted-foreground hover:border-accent"
            }`}
          >
            {v.name}
          </a>
        ))}
      </div>

      <SectionHeader
        eyebrow="Diretório"
        title={`${verticalConfig.directoryTitle}${cityFilter ? ` — ${cityFilter}` : ""}`}
        description={verticalConfig.directoryDescription}
      />
      <Suspense fallback={<DirectoryFallback />}>
        <WorkshopDirectory workshops={workshops} tiers={tiers} vertical={vertical} />
      </Suspense>
    </div>
  );
}
