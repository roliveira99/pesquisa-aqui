export type BusinessVertical =
  | "automotive"
  | "beauty"
  | "food"
  | "retail"
  | "health"
  | "services"
  | "education"
  | "pets"
  | "other";

export interface VerticalCategory {
  value: string;
  label: string;
}

export interface VerticalConfig {
  id: BusinessVertical;
  name: string;
  /** Nome plural curto: "oficinas", "salões", "lojas" */
  businessPlural: string;
  /** Nome singular: "oficina", "salão", "loja" */
  businessSingular: string;
  directoryTitle: string;
  directoryDescription: string;
  searchPlaceholder: string;
  heroTitle: string;
  heroSubtitle: string;
  defaultEmoji: string;
  categories: VerticalCategory[];
  /** Usa WorkshopType (carros/motos/…) em vez de category */
  usesAutomotiveTypes: boolean;
}

export interface PlatformTerminology {
  directoryNav: string;
  directoryPath: string;
  profilePath: (slug: string) => string;
  managerLoginSubtitle: string;
  homeFeaturedTitle: string;
  homeFeaturedDescription: string;
  homeManagerTitle: string;
  homeManagerDescription: string;
}
