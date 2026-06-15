"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButton, DataTable } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { apiRemoveReview, apiRestoreReview } from "@/lib/api/platform-client";
import { fetchAdminReviews, formatReviewDate } from "@/lib/api/reviews-client";
import { maskCpf } from "@/lib/cpf";
import { workshops } from "@/data/workshops";
import type { WorkshopReview } from "@/types/review";
import { StarDisplay } from "@/components/workshop/StarRating";

function workshopName(id: string) {
  return workshops.find((w) => w.id === id)?.name ?? `Oficina #${id}`;
}

export default function AdminAvaliacoesPage() {
  const [reviews, setReviews] = useState<(WorkshopReview & { removed: boolean })[]>([]);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    setReviews(await fetchAdminReviews());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleRemove(id: string) {
    await apiRemoveReview(id);
    setMessage("Avaliação removida do site público.");
    await refresh();
  }

  async function handleRestore(id: string) {
    await apiRestoreReview(id);
    setMessage("Avaliação restaurada.");
    await refresh();
  }

  return (
    <PermissionGuard permissions={["admin.moderar_avaliacoes"]}>
      <PageHeader
        title="Moderação de avaliações"
        description="Remova comentários e notas inadequadas — a média da oficina recalcula automaticamente no perfil"
      />

      {message && (
        <p className="mb-4 rounded-lg border border-border bg-surface-hover px-4 py-3 text-sm text-muted-foreground">
          {message}
        </p>
      )}

      <DataTable
        headers={["Oficina", "Cliente", "CPF", "Nota", "Comentário", "Data", "Status", "Ações"]}
        rows={reviews.map((r) => [
          workshopName(r.workshopId),
          r.clientName,
          maskCpf(r.cpf),
          <StarDisplay key={`${r.id}-stars`} value={r.stars} size="sm" />,
          r.comment.length > 60 ? `${r.comment.slice(0, 60)}…` : r.comment,
          formatReviewDate(r.updatedAt),
          r.removed ? "Removida" : "Publicada",
          r.removed ? (
            <ActionButton key={`${r.id}-restore`} label="Restaurar" onClick={() => handleRestore(r.id)} />
          ) : (
            <ActionButton
              key={`${r.id}-remove`}
              label="Remover"
              variant="danger"
              onClick={() => handleRemove(r.id)}
            />
          ),
        ])}
      />
    </PermissionGuard>
  );
}
