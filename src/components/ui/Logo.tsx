import Link from "next/link";

interface LogoProps {
  variant?: "default" | "light";
  size?: "sm" | "md";
}

export function Logo({ variant = "default", size = "md" }: LogoProps) {
  const isLight = variant === "light";
  const boxSize = size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm";
  const textSize = size === "sm" ? "text-base" : "text-lg";

  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span
        className={`flex ${boxSize} items-center justify-center rounded-lg font-bold ${
          isLight
            ? "bg-white text-sidebar"
            : "bg-accent text-white shadow-sm"
        }`}
      >
        MP
      </span>
      <div className="leading-tight">
        <span
          className={`block font-semibold tracking-tight ${textSize} ${
            isLight ? "text-white" : "text-foreground"
          }`}
        >
          MP Oficinas
        </span>
        {size === "md" && (
          <span
            className={`hidden text-[11px] sm:block ${
              isLight ? "text-sidebar-text" : "text-muted"
            }`}
          >
            Gestão automotiva
          </span>
        )}
      </div>
    </Link>
  );
}
