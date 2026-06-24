"use client";

import { useState } from "react";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { JournalAdminPanel } from "@/components/admin/JournalAdminPanel";
import { useAuth } from "@/components/auth/AuthProvider";
import { getCategoryLabel } from "@/lib/article-categories";

export default function JournalDashboardPage() {
  const { user } = useAuth();
  const niche = user?.journalNiche ?? "geral";
  const [feedback, setFeedback] = useState("");

  return (
    <PermissionGuard permissions={["jornalista.gerenciar_manchetes"]}>
      <PageHeader
        title="Minha editoria"
        description={`Publique manchetes em ${getCategoryLabel(niche)}.`}
      />
      {feedback && <p className="mb-4 text-sm text-green-700 dark:text-green-400">{feedback}</p>}
      <JournalAdminPanel mode="jornalista" lockedCategory={niche} onFeedback={setFeedback} />
    </PermissionGuard>
  );
}
