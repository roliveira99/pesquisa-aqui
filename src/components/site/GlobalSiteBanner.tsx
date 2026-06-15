"use client";

import { usePathname } from "next/navigation";
import { SiteAnnouncements } from "@/components/site/SiteAnnouncements";

export function GlobalSiteBanner() {
  const pathname = usePathname();
  const hide =
    pathname.startsWith("/dashboard") || /^\/oficinas\/[^/]+$/.test(pathname);

  if (hide) return null;

  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <SiteAnnouncements placement="site_geral" />
      </div>
    </div>
  );
}
