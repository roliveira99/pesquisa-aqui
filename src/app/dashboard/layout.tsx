import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { DashboardRouteGuard } from "@/components/dashboard/DashboardRouteGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <DashboardShell>
        <DashboardRouteGuard>{children}</DashboardRouteGuard>
      </DashboardShell>
    </DashboardGuard>
  );
}
