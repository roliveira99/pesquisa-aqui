"use client";

import Image from "next/image";
import Link from "next/link";
import { businessProfilePath } from "@/lib/platform-routes";
import type { Workshop } from "@/types/workshop";
import type { SponsorshipTier } from "@/types/platform-admin";
import { sponsorshipTierBadgeClass } from "@/types/platform-admin";
import { WorkshopTypeBadge } from "./WorkshopTypeBadge";
import { WorkshopLiveRating } from "./WorkshopLiveRating";
import { WorkshopOpenBadge } from "./WorkshopOpenBadge";
import { Icon } from "@/components/ui/Icon";
import { workshopTypeLabels } from "@/lib/labels";

interface WorkshopCardProps {
  workshop: Workshop;
  sponsorshipTier?: SponsorshipTier;
  sponsorshipLabel?: string;
}

export function WorkshopCard({ workshop, sponsorshipTier, sponsorshipLabel }: WorkshopCardProps) {
  const isSponsored = sponsorshipTier && sponsorshipTier !== "none";
  const cover = workshop.coverImage;

  return (
    <Link
      href={businessProfilePath(workshop.slug)}
      className={`group flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isSponsored ? "ring-2 ring-amber-400/50" : ""
      }`}
    >
      <div className="relative h-44 overflow-hidden bg-surface-hover">
        {cover ? (
          <Image
            src={cover}
            alt={workshop.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-accent/30 to-accent/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <WorkshopTypeBadge type={workshop.type} />
          {isSponsored && sponsorshipLabel && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur ${sponsorshipTierBadgeClass[sponsorshipTier]}`}
            >
              ★ {sponsorshipLabel}
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <WorkshopOpenBadge openingHours={workshop.openingHours} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-accent">{workshop.name}</h3>
        {workshop.tagline && (
          <p className="mt-1 line-clamp-1 text-xs text-muted">{workshop.tagline}</p>
        )}
        <p className="mt-1 flex items-center gap-1 text-sm text-muted">
          <Icon name="building" className="h-3.5 w-3.5 shrink-0 opacity-60" />
          {workshop.city}, {workshop.state}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {workshop.services.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-md bg-surface-hover px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <WorkshopLiveRating
            workshopSlug={workshop.slug}
            fallbackAverage={workshop.rating}
            fallbackCount={workshop.reviewCount}
          />
          <span className="flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition group-hover:opacity-100">
            Ver perfil
            <Icon name="arrow-right" className="h-4 w-4" />
          </span>
        </div>
      </div>

      <p className="sr-only">{workshopTypeLabels[workshop.type]}</p>
    </Link>
  );
}
