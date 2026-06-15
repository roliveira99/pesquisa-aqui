"use client";

import { Icon } from "@/components/ui/Icon";
import type { StarRating } from "@/types/review";

interface StarDisplayProps {
  value: number;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarDisplay({ value, size = "md" }: StarDisplayProps) {
  const cls = sizeClasses[size];
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="star"
          className={`${cls} ${star <= Math.round(value) ? "text-amber-500" : "text-border"}`}
        />
      ))}
    </span>
  );
}

interface StarInputProps {
  value: StarRating | 0;
  onChange: (value: StarRating) => void;
  disabled?: boolean;
}

export function StarInput({ value, onChange, disabled }: StarInputProps) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Nota de 1 a 5 estrelas">
      {([1, 2, 3, 4, 5] as StarRating[]).map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          className="rounded p-0.5 transition hover:scale-110 disabled:opacity-50"
          aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
        >
          <Icon
            name="star"
            className={`h-8 w-8 ${star <= value ? "text-amber-500" : "text-border hover:text-amber-300"}`}
          />
        </button>
      ))}
    </div>
  );
}

export function RatingSummary({
  average,
  count,
  size = "md",
}: {
  average: number;
  count: number;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`font-bold text-foreground ${size === "lg" ? "text-3xl" : size === "md" ? "text-xl" : "text-base"}`}>
        {average.toFixed(1)}
      </span>
      <StarDisplay value={average} size={size} />
      <span className="text-sm text-muted">
        ({count} {count === 1 ? "avaliação" : "avaliações"})
      </span>
    </div>
  );
}
