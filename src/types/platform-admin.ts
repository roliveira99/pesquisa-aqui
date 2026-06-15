export type SponsorshipTier = "none" | "bronze" | "prata" | "ouro" | "diamante";

export interface WorkshopSponsorship {
  workshopId: string;
  tier: SponsorshipTier;
  /** Valor mensal de referência (controle interno admin). */
  monthlyValue?: number;
  notes?: string;
  updatedAt: string;
}

export type AnnouncementPlacement =
  | "home_topo"
  | "home_meio"
  | "oficinas_topo"
  | "site_geral";

export type AnnouncementStyle = "info" | "promo" | "alerta";

export interface SiteAnnouncement {
  id: string;
  title: string;
  message: string;
  linkUrl?: string;
  linkLabel?: string;
  placement: AnnouncementPlacement;
  style: AnnouncementStyle;
  active: boolean;
  createdAt: string;
}

export interface PlatformAdminSettings {
  sponsorships: WorkshopSponsorship[];
  announcements: SiteAnnouncement[];
  removedReviewIds: string[];
}

export const sponsorshipTierLabels: Record<SponsorshipTier, string> = {
  none: "Sem patrocínio",
  bronze: "Bronze",
  prata: "Prata",
  ouro: "Ouro",
  diamante: "Diamante",
};

export const sponsorshipTierPriority: Record<SponsorshipTier, number> = {
  none: 0,
  bronze: 1,
  prata: 2,
  ouro: 3,
  diamante: 4,
};

export const sponsorshipTierBadgeClass: Record<SponsorshipTier, string> = {
  none: "",
  bronze: "bg-amber-700/15 text-amber-800 dark:text-amber-300",
  prata: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  ouro: "bg-yellow-500/20 text-yellow-800 dark:text-yellow-300",
  diamante: "bg-violet-500/15 text-violet-800 dark:text-violet-300",
};
