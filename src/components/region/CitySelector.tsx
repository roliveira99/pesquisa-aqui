"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ALL_CITIES_LABEL, PLATFORM_CITIES, normalizeCityFilter } from "@/lib/cities";

function CitySelectorInner({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = normalizeCityFilter(searchParams.get("cidade")) ?? "";

  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!next) params.delete("cidade");
    else params.set("cidade", next);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <label className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      <span className="sr-only">Cidade do jornal e dos comércios</span>
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="max-w-[11rem] cursor-pointer truncate rounded-md border border-border bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground sm:max-w-none sm:text-xs"
        aria-label="Selecionar cidade"
      >
        <option value="">{ALL_CITIES_LABEL}</option>
        {PLATFORM_CITIES.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CitySelector(props: { className?: string }) {
  return (
    <Suspense
      fallback={
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted sm:text-xs">
          {ALL_CITIES_LABEL}
        </span>
      }
    >
      <CitySelectorInner {...props} />
    </Suspense>
  );
}
