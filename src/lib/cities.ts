/** Cidades disponíveis na plataforma (jornal, negócios e classificados). */
export const PLATFORM_CITIES = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Curitiba",
  "Santos",
  "Campinas",
  "Recife",
  "Goiânia",
  "Florianópolis",
  "Salvador",
  "Brasília",
] as const;

export type PlatformCity = (typeof PLATFORM_CITIES)[number];

export const ALL_CITIES_LABEL = "Todos";

export function normalizeCityFilter(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.toLowerCase() === "todos") return undefined;
  return trimmed;
}

export function withCityQuery(href: string, city?: string | null): string {
  const normalized = normalizeCityFilter(city ?? undefined);
  if (!normalized) return href;

  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const pathAndQuery = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const [path, query = ""] = pathAndQuery.split("?");
  const params = new URLSearchParams(query);
  params.set("cidade", normalized);
  const qs = params.toString();
  return `${path}?${qs}${hash}`;
}

export function isPlatformCity(value: string): value is PlatformCity {
  return (PLATFORM_CITIES as readonly string[]).includes(value);
}

export function mergePlatformCities(extra: string[]): string[] {
  const set = new Set<string>(PLATFORM_CITIES);
  for (const city of extra) {
    const trimmed = city.trim();
    if (trimmed) set.add(trimmed);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
}
