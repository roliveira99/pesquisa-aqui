"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButton, DataTable } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import {
  apiAddAnnouncement,
  apiDeleteAnnouncement,
  apiFetchAllAnnouncements,
  apiToggleAnnouncement,
} from "@/lib/api/platform-client";
import type { AnnouncementPlacement, AnnouncementStyle, SiteAnnouncement } from "@/types/platform-admin";

const placements: { value: AnnouncementPlacement; label: string }[] = [
  { value: "site_geral", label: "Site inteiro (banner)" },
  { value: "home_topo", label: "Home — topo" },
  { value: "home_meio", label: "Home — meio" },
  { value: "oficinas_topo", label: "Diretório de oficinas" },
];

const styles: { value: AnnouncementStyle; label: string }[] = [
  { value: "info", label: "Informativo" },
  { value: "promo", label: "Promoção" },
  { value: "alerta", label: "Alerta" },
];

export default function AdminAnunciosPage() {
  const [items, setItems] = useState<SiteAnnouncement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [placement, setPlacement] = useState<AnnouncementPlacement>("site_geral");
  const [style, setStyle] = useState<AnnouncementStyle>("info");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [feedback, setFeedback] = useState("");

  const refresh = useCallback(async () => {
    setItems(await apiFetchAllAnnouncements());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await apiAddAnnouncement({ title, message, placement, style, linkUrl, linkLabel });
    setTitle("");
    setMessage("");
    setLinkUrl("");
    setLinkLabel("");
    setShowForm(false);
    setFeedback("Anúncio publicado no site.");
    await refresh();
  }

  return (
    <PermissionGuard permissions={["admin.gerenciar_anuncios"]}>
      <PageHeader
        title="Anúncios e avisos"
        description="Banners e comunicados exibidos na home, diretório de oficinas ou em todo o site"
        actions={
          <ActionButton
            label={showForm ? "Cancelar" : "+ Novo anúncio"}
            variant="primary"
            onClick={() => setShowForm(!showForm)}
          />
        }
      />

      {feedback && (
        <p className="mb-4 rounded-lg border border-border bg-surface-hover px-4 py-3 text-sm">{feedback}</p>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 space-y-4 p-5">
          <h3 className="font-semibold">Criar anúncio / aviso</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="Título"
            />
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value as AnnouncementPlacement)}
              className="input-field"
            >
              {placements.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input-field min-h-[80px]"
            placeholder="Mensagem exibida ao visitante"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as AnnouncementStyle)}
              className="input-field"
            >
              {styles.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="input-field"
              placeholder="Link (opcional)"
            />
            <input
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              className="input-field"
              placeholder="Texto do link"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Publicar
          </button>
        </form>
      )}

      <DataTable
        headers={["Título", "Local", "Estilo", "Status", "Ações"]}
        rows={items.map((a) => [
          a.title,
          placements.find((p) => p.value === a.placement)?.label ?? a.placement,
          styles.find((s) => s.value === a.style)?.label ?? a.style,
          a.active ? "Ativo" : "Inativo",
          <div key={a.id} className="flex flex-wrap gap-2">
            <ActionButton
              label={a.active ? "Desativar" : "Ativar"}
              onClick={() => {
                void apiToggleAnnouncement(a.id, !a.active).then(refresh);
              }}
            />
            <ActionButton
              label="Excluir"
              variant="danger"
              onClick={() => {
                void apiDeleteAnnouncement(a.id).then(refresh);
              }}
            />
          </div>,
        ])}
      />
    </PermissionGuard>
  );
}
