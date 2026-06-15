"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { Icon } from "@/components/ui/Icon";
import { fetchWorkshopMedia, saveWorkshopMedia } from "@/lib/api/crm-client";
import type { WorkshopGalleryItem } from "@/types/workshop";

export default function MidiaPage() {
  const [coverImage, setCoverImage] = useState("");
  const [tagline, setTagline] = useState("");
  const [gallery, setGallery] = useState<WorkshopGalleryItem[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWorkshopMedia();
      setCoverImage(data.coverImage ?? "");
      setTagline(data.tagline ?? "");
      setGallery(data.gallery ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    await saveWorkshopMedia({
      coverImage: coverImage.trim(),
      tagline: tagline.trim(),
      gallery,
    });
    setMessage("Alterações salvas — visíveis no perfil público após recarregar a página.");
    await refresh();
  }

  function addGalleryItem() {
    const url = newUrl.trim();
    if (!url) return;
    setGallery((prev) => [
      ...prev,
      { id: `gal-${Date.now()}`, url, caption: newCaption.trim() || "Foto da oficina", kind: "ambiente" as const },
    ]);
    setNewUrl("");
    setNewCaption("");
  }

  function removeGalleryItem(id: string) {
    setGallery((prev) => prev.filter((g) => g.id !== id));
  }

  if (loading) {
    return (
      <PermissionGuard permissions={["owner.cadastro_servicos"]}>
        <PageHeader title="Mídia e galeria" description="Carregando..." />
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permissions={["owner.cadastro_servicos"]}>
      <PageHeader
        title="Mídia e galeria"
        description="Capa, frase de destaque e fotos do perfil público da oficina"
      />

      {message && (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          {message}
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <section className="card p-5">
          <h2 className="font-semibold text-foreground">Capa e destaque</h2>
          <p className="mt-1 text-sm text-muted">
            Use URLs de imagens (ex.: Unsplash). A capa aparece no topo do perfil público.
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">URL da capa</span>
              <input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="input-field mt-1.5"
                placeholder="https://images.unsplash.com/..."
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Frase de destaque (tagline)</span>
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="input-field mt-1.5"
                placeholder="Ex.: Especialistas em injeção eletrônica"
              />
            </label>
          </div>
          {coverImage && (
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage} alt="Prévia da capa" className="h-40 w-full object-cover" />
            </div>
          )}
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-foreground">Galeria de fotos</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="input-field min-w-[200px] flex-1"
              placeholder="URL da foto"
            />
            <input
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              className="input-field min-w-[160px] flex-1"
              placeholder="Legenda (opcional)"
            />
            <button
              type="button"
              onClick={addGalleryItem}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface-hover"
            >
              Adicionar foto
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((item) => (
              <figure key={item.id} className="group relative overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.caption ?? "Foto da oficina"} className="aspect-video w-full object-cover" />
                {item.caption && (
                  <figcaption className="border-t border-border px-3 py-2 text-xs text-muted">
                    {item.caption}
                  </figcaption>
                )}
                <button
                  type="button"
                  onClick={() => removeGalleryItem(item.id)}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remover foto"
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </figure>
            ))}
          </div>
          {gallery.length === 0 && (
            <p className="mt-4 text-sm text-muted">Nenhuma foto na galeria ainda.</p>
          )}
        </section>

        <button
          type="submit"
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Salvar alterações
        </button>
      </form>
    </PermissionGuard>
  );
}
