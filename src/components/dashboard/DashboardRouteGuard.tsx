"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { canAccessRoute } from "@/lib/permissions";

export function DashboardRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (!canAccessRoute(user.role, pathname)) {
      router.replace("/dashboard");
    }
  }, [user, loading, pathname, router]);

  if (loading || !user) return null;

  if (!canAccessRoute(user.role, pathname)) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted">Redirecionando...</p>
      </div>
    );
  }

  return <>{children}</>;
}
