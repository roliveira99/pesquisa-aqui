"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { AdminHome } from "@/components/dashboard/home/AdminHome";
import { OwnerHome } from "@/components/dashboard/home/OwnerHome";
import { ManagerHome } from "@/components/dashboard/home/ManagerHome";
import { MechanicHome } from "@/components/dashboard/home/MechanicHome";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "master":
      return <AdminHome />;
    case "dono":
      return <OwnerHome />;
    case "gerencia":
      return <ManagerHome />;
    case "mecanico":
      return <MechanicHome />;
    default:
      return null;
  }
}
