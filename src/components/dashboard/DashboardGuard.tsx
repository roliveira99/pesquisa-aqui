"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { isValidAuthUser } from "@/lib/auth";

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const isValid = user && isValidAuthUser(user);

  useEffect(() => {
    if (!loading && !isValid) {
      if (user) logout();
      router.replace("/login");
    }
  }, [user, loading, isValid, logout, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted">Carregando...</p>
      </div>
    );
  }

  if (!isValid) return null;

  return <>{children}</>;
}
