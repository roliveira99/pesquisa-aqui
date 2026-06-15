"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { fetchReviewStatsBySlug } from "@/lib/api/reviews-client";

interface WorkshopLiveRatingProps {
  workshopSlug: string;
  fallbackAverage: number;
  fallbackCount: number;
  size?: "sm" | "md";
}

export function WorkshopLiveRating({
  workshopSlug,
  fallbackAverage,
  fallbackCount,
  size = "sm",
}: WorkshopLiveRatingProps) {
  const [average, setAverage] = useState(fallbackAverage);
  const [count, setCount] = useState(fallbackCount);

  useEffect(() => {
    fetchReviewStatsBySlug(workshopSlug, fallbackAverage, fallbackCount).then((stats) => {
      setAverage(stats.average);
      setCount(stats.count);
    });
  }, [workshopSlug, fallbackAverage, fallbackCount]);

  const starClass = size === "md" ? "h-5 w-5" : "h-4 w-4";
  const textClass = size === "md" ? "text-base" : "text-sm";

  return (
    <div className={`flex items-center gap-1.5 ${textClass}`}>
      <Icon name="star" className={`${starClass} text-amber-500`} />
      <span className="font-semibold text-foreground">{average.toFixed(1)}</span>
      <span className="text-muted">({count})</span>
    </div>
  );
}
