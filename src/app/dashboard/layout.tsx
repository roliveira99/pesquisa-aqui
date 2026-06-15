import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="dashboard-shell flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-6 sm:p-8">{children}</div>
        </div>
      </div>
    </DashboardGuard>
  );
}
