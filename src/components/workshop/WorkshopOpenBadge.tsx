"use client";

import { useEffect, useState } from "react";
import { getWorkshopOpenStatus, openStatusLabel } from "@/lib/workshop-hours";

export function WorkshopOpenBadge({ openingHours }: { openingHours: string }) {
  const [status, setStatus] = useState<ReturnType<typeof getWorkshopOpenStatus>>("unknown");

  useEffect(() => {
    setStatus(getWorkshopOpenStatus(openingHours));
    const id = window.setInterval(() => setStatus(getWorkshopOpenStatus(openingHours)), 60_000);
    return () => clearInterval(id);
  }, [openingHours]);

  if (status === "unknown") return null;

  const isOpen = status === "open";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        isOpen
          ? "bg-emerald-500/90 text-white shadow-sm"
          : "bg-gray-800/70 text-gray-100"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isOpen ? "animate-pulse bg-white" : "bg-gray-400"}`}
      />
      {openStatusLabel(status)}
    </span>
  );
}
