"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardThemeToggle } from "@/components/dashboard/DashboardThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  return (
    <div className="dashboard-app flex min-h-screen">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Suspense fallback={null}>
        <DashboardSidebar
          mobileOpen={sidebarOpen}
          onNavigate={() => setSidebarOpen(false)}
        />
      </Suspense>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="rounded border border-border p-2 text-muted-foreground hover:bg-surface-hover"
              aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={sidebarOpen}
            >
              <Icon name={sidebarOpen ? "x" : "menu"} className="h-5 w-5" />
            </button>
            <Logo variant="system" size="sm" />
          </div>
          <DashboardThemeToggle compact />
        </header>

        <div className="dashboard-shell flex-1 overflow-auto">
          <div className="mx-auto max-w-[1400px] p-4 sm:p-5 lg:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
