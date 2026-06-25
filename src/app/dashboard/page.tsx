"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AdminHome } from "@/components/dashboard/home/AdminHome";
import { DeprecatedRoleHome } from "@/components/dashboard/home/DeprecatedRoleHome";
import { OwnerHome } from "@/components/dashboard/home/OwnerHome";
import { getDashboardHomeHref, isDeprecatedRole } from "@/lib/permissions";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === "jornalista") {
      router.replace(getDashboardHomeHref(user.role));
    }
  }, [user, router]);

  if (!user) return null;

  if (isDeprecatedRole(user.role)) {
    return <DeprecatedRoleHome />;
  }

  switch (user.role) {
    case "master":
      return <AdminHome />;
    case "dono":
      return <OwnerHome />;
    case "jornalista":
      return null;
    default:
      return null;
  }
}
