"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchActiveAnnouncements } from "@/lib/api/platform-client";
import type { AnnouncementPlacement, SiteAnnouncement } from "@/types/platform-admin";

const styleClasses = {
  info: "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-100",
  promo: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100",
  alerta: "border-orange-200 bg-orange-50 text-orange-950 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-100",
};

interface SiteAnnouncementsProps {
  placement: AnnouncementPlacement;
  className?: string;
}

export function SiteAnnouncements({ placement, className }: SiteAnnouncementsProps) {
  const [items, setItems] = useState<SiteAnnouncement[]>([]);

  useEffect(() => {
    fetchActiveAnnouncements(placement).then(setItems);
  }, [placement]);

  if (items.length === 0) return null;

  return (
    <div className={`space-y-3 ${className ?? ""}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`rounded-xl border px-4 py-3 sm:px-5 sm:py-4 ${styleClasses[item.style]}`}
          role="status"
        >
          <p className="font-semibold">{item.title}</p>
          <p className="mt-1 text-sm opacity-90">{item.message}</p>
          {item.linkUrl && (
            <Link
              href={item.linkUrl}
              className="mt-2 inline-block text-sm font-semibold underline underline-offset-2"
            >
              {item.linkLabel ?? "Saiba mais"}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
