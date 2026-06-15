"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Permission } from "@/types/auth";
import { useAuth } from "@/components/auth/AuthProvider";
import { hasAnyPermission } from "@/lib/permissions";

interface PermissionGuardProps {
  permissions: Permission[];
  children: React.ReactNode;
}

export function PermissionGuard({ permissions, children }: PermissionGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !hasAnyPermission(user.role, permissions)) {
      router.replace("/dashboard");
    }
  }, [user, loading, permissions, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted">Carregando...</p>
      </div>
    );
  }

  if (!user || !hasAnyPermission(user.role, permissions)) return null;

  return <>{children}</>;
}
