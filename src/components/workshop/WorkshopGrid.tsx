"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WorkshopCard } from "@/components/workshop/WorkshopCard";
import { Icon } from "@/components/ui/Icon";
import { fetchReviewStatsBySlug } from "@/lib/api/reviews-client";
import { getWorkshopOpenStatus } from "@/lib/workshop-hours";
import { getVerticalConfig } from "@/lib/verticals/config";
import { workshopTypeLabels } from "@/lib/labels";
import type { BusinessVertical } from "@/types/vertical";
import { sponsorshipTierLabels } from "@/types/platform-admin";
import type { SponsorshipTier } from "@/types/platform-admin";
import type { Workshop } from "@/types/workshop";

interface WorkshopGridProps {
  workshops: Workshop[];
  tiers?: Record<string, SponsorshipTier>;
  limit?: number;
}

function tierFor(tiers: Record<string, SponsorshipTier> | undefined, id: string): SponsorshipTier {
  return tiers?.[id] ?? "none";
}

export function WorkshopGrid({ workshops, tiers, limit }: WorkshopGridProps) {
  const list = limit ? workshops.slice(0, limit) : workshops;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((workshop) => {
        const tier = tierFor(tiers, workshop.id);
        return (
          <WorkshopCard
            key={workshop.id}
            workshop={workshop}
            sponsorshipTier={tier !== "none" ? tier : undefined}
            sponsorshipLabel={tier !== "none" ? sponsorshipTierLabels[tier] : undefined}
          />
        );
      })}
    </div>
  );
}

type SortMode = "destaque" | "avaliacao" | "nome";

interface WorkshopDirectoryProps {
  workshops: Workshop[];
  tiers?: Record<string, SponsorshipTier>;
  vertical?: BusinessVertical;
}

export function WorkshopDirectory({ workshops, tiers, vertical }: WorkshopDirectoryProps) {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const initialType = searchParams.get("tipo") ?? "todas";
  const initialCategory = searchParams.get("categoria") ?? "todas";
  const verticalConfig = getVerticalConfig(vertical ?? null);

  const [filter, setFilter] = useState(
    verticalConfig.usesAutomotiveTypes ? initialType : initialCategory
  );
  const [search, setSearch] = useState(initialQ);
  const [serviceFilter, setServiceFilter] = useState("");
  const [sort, setSort] = useState<SortMode>("destaque");
  const [ratingMap, setRatingMap] = useState<Record<string, number>>({});

  useEffect(() => {
    setSearch(initialQ);
    setFilter(verticalConfig.usesAutomotiveTypes ? initialType : initialCategory);
  }, [initialQ, initialType, initialCategory, verticalConfig.usesAutomotiveTypes]);

  useEffect(() => {
    if (sort !== "avaliacao") return;
    let cancelled = false;

    async function loadRatings() {
      const entries = await Promise.all(
        workshops.map(async (w) => {
          const stats = await fetchReviewStatsBySlug(w.slug, w.rating, w.reviewCount);
          return [w.id, stats.average] as const;
        })
      );
      if (!cancelled) {
        setRatingMap(Object.fromEntries(entries));
      }
    }

    loadRatings();
    return () => {
      cancelled = true;
    };
  }, [sort, workshops]);

  const filtered = useMemo(() => {
    let list = workshops.filter((w) => {
      const q = search.toLowerCase();
      const matchesType = verticalConfig.usesAutomotiveTypes
        ? filter === "todas" || w.type === filter
        : filter === "todas" || w.category === filter;
      const matchesSearch =
        q === "" ||
        w.name.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q) ||
        w.state.toLowerCase().includes(q) ||
        w.services.some((s) => s.toLowerCase().includes(q)) ||
        w.specialties.some((s) => s.toLowerCase().includes(q));
      const matchesService =
        serviceFilter === "" ||
        w.services.some((s) => s.toLowerCase().includes(serviceFilter.toLowerCase())) ||
        w.catalog.services.some((c) => c.name.toLowerCase().includes(serviceFilter.toLowerCase()));
      return matchesType && matchesSearch && matchesService;
    });

    if (sort === "avaliacao") {
      list = [...list].sort((a, b) => {
        const ra = ratingMap[a.id] ?? a.rating;
        const rb = ratingMap[b.id] ?? b.rating;
        return rb - ra;
      });
    } else if (sort === "nome") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [workshops, filter, search, serviceFilter, sort, ratingMap, verticalConfig.usesAutomotiveTypes]);

  const filters = verticalConfig.usesAutomotiveTypes
    ? [
        { value: "todas", label: "Todas" },
        { value: "carros", label: workshopTypeLabels.carros },
        { value: "motos", label: workshopTypeLabels.motos },
        { value: "mista", label: workshopTypeLabels.mista },
        { value: "estetica", label: workshopTypeLabels.estetica },
      ]
    : [
        { value: "todas", label: "Todas" },
        ...verticalConfig.categories.map((c) => ({ value: c.value, label: c.label })),
      ];

  const openCount = filtered.filter(
    (w) => getWorkshopOpenStatus(w.openingHours) === "open"
  ).length;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted">
        <span className="font-medium text-foreground">{filtered.length} resultados</span>
        {openCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-emerald-700 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {openCount} abertos agora
          </span>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-accent text-white shadow-sm"
                  : "border border-border bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="grid w-full gap-2 sm:grid-cols-3 xl:max-w-2xl">
          <div className="relative sm:col-span-1">
            <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Cidade ou nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field !pl-10"
            />
          </div>
          <input
            type="search"
            placeholder="Serviço (ex.: freios, detailing)"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="input-field"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="input-field"
          >
            <option value="destaque">Patrocinadas primeiro</option>
            <option value="avaliacao">Melhor avaliação</option>
            <option value="nome">Nome A–Z</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-lg font-medium text-foreground">Nenhuma oficina encontrada</p>
          <p className="mt-2 text-sm text-muted">Tente outra cidade, serviço ou tipo de estabelecimento.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((workshop) => {
            const tier = tierFor(tiers, workshop.id);
            return (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                sponsorshipTier={tier !== "none" ? tier : undefined}
                sponsorshipLabel={tier !== "none" ? sponsorshipTierLabels[tier] : undefined}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
