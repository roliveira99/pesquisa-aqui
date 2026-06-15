"use client";

import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/components/theme/ThemeProvider";

interface ThemeToggleProps {
  variant?: "default" | "sidebar" | "compact";
}

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <span
        className={`inline-flex rounded-lg ${
          variant === "sidebar" ? "h-9 w-9" : "h-9 w-9"
        }`}
        aria-hidden
      />
    );
  }

  const isDark = theme === "dark";
  const label = isDark ? "Ativar tema claro" : "Ativar tema escuro";

  const base =
    variant === "sidebar"
      ? "rounded-lg p-2 text-sidebar-text transition-colors hover:bg-sidebar-hover hover:text-white"
      : variant === "compact"
        ? "rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        : "btn btn-secondary !p-2";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={base}
      aria-label={label}
      title={label}
    >
      <Icon name={isDark ? "sun" : "moon"} className="h-5 w-5" />
      {variant === "default" && (
        <span className="hidden sm:inline">{isDark ? "Claro" : "Escuro"}</span>
      )}
    </button>
  );
}
