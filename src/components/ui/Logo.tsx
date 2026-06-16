import Link from "next/link";

interface LogoProps {
  variant?: "default" | "light" | "system";
  size?: "sm" | "md";
}

export function Logo({ variant = "default", size = "md" }: LogoProps) {
  const isLight = variant === "light";
  const isSystem = variant === "system";
  const boxSize = size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm";
  const textSize = size === "sm" ? "text-base" : "text-lg";

  const boxClass = isLight
    ? "bg-white text-sidebar"
    : isSystem
      ? "border border-[var(--dash-border)] bg-[var(--dash-surface-alt)] text-[var(--dash-text)]"
      : "bg-accent text-white shadow-sm";

  const titleClass = isLight
    ? "text-white"
    : isSystem
      ? "text-[var(--dash-text)]"
      : "text-foreground";

  const subtitleClass = isLight
    ? "text-sidebar-text"
    : isSystem
      ? "text-[var(--dash-text-muted)]"
      : "text-muted";

  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span
        className={`flex ${boxSize} items-center justify-center rounded font-bold ${boxClass}`}
      >
        MP
      </span>
      <div className="leading-tight">
        <span className={`block font-semibold tracking-tight ${textSize} ${titleClass}`}>
          MP Oficinas
        </span>
        {size === "md" && (
          <span className={`hidden text-[11px] sm:block ${subtitleClass}`}>
            Gestão automotiva
          </span>
        )}
      </div>
    </Link>
  );
}
