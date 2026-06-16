"use client";

import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { Theme } from "@/types/theme";

const options: { id: Theme; label: string; icon: "sun" | "moon" }[] = [
  { id: "light", label: "Claro", icon: "sun" },
  { id: "dark", label: "Escuro", icon: "moon" },
];

interface DashboardThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export function DashboardThemeToggle({ className = "", compact = false }: DashboardThemeToggleProps) {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div
        className={`dash-theme-toggle ${compact ? "dash-theme-toggle-compact" : ""} ${className}`}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`dash-theme-toggle ${compact ? "dash-theme-toggle-compact" : ""} ${className}`}
      role="group"
      aria-label="Tema da interface"
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => setTheme(opt.id)}
          aria-pressed={theme === opt.id}
          title={opt.label}
          className={`dash-theme-option ${theme === opt.id ? "dash-theme-option-active" : ""}`}
        >
          <Icon name={opt.icon} className="h-3.5 w-3.5 shrink-0" />
          {!compact && <span>{opt.label}</span>}
        </button>
      ))}
    </div>
  );
}
