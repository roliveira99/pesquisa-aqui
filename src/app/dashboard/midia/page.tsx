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
  const [slogan, setSlogan] = useState("");
  const [gallery, setGallery] = useState<WorkshopGalleryItem[]>([]);
  const [profileVideos, setProfileVideos] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<{ title: string; body: string }[]>([]);
  const [opportunities, setOpportunities] = useState<{ title: string; body: string }[]>([]);
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
      setSlogan(data.slogan ?? "");
      setGallery(data.gallery ?? []);
      setProfileVideos(data.profileVideos ?? []);
      setHighlights(data.profileHighlights ?? []);
      setOpportunities(data.businessOpportunities ?? []);
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
      slogan: slogan.trim(),
      gallery,
      profileVideos,
      profileHighlights: highlights,
      businessOpportunities: opportunities,
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
      <PermissionGuard permissions={["owner.perfil"]}>
        <PageHeader title="Meu perfil no site" description="Carregando..." />
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permissions={["owner.perfil"]}>
      <PageHeader
        title="Meu perfil no site"
        description="Fotos, vídeos, slogans e informações exibidas na sua página pública"
      />

      {message && (
        <p className="dash-alert">{message}</p>
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
              <span className="font-medium">Slogan</span>
              <input
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="input-field mt-1.5"
                placeholder="Ex.: Qualidade que você confia"
              />
            </label>
            <label className="block text-sm lg:col-span-2">
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
          <h2 className="font-semibold text-foreground">Vídeos (URLs YouTube/Vimeo)</h2>
          <div className="mt-4 flex gap-2">
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="input-field flex-1"
              placeholder="https://youtube.com/..."
            />
            <button
              type="button"
              onClick={() => {
                if (!newUrl.trim()) return;
                setProfileVideos((p) => [...p, newUrl.trim()]);
                setNewUrl("");
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm"
            >
              Adicionar vídeo
            </button>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            {profileVideos.map((v, i) => (
              <li key={v} className="flex justify-between gap-2">
                <span className="truncate">{v}</span>
                <button type="button" className="text-danger" onClick={() => setProfileVideos((p) => p.filter((_, j) => j !== i))}>
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-foreground">Destaques e oportunidades</h2>
          <ProfileBlockEditor
            label="Informações relevantes"
            items={highlights}
            onChange={setHighlights}
          />
          <div className="mt-6">
            <ProfileBlockEditor
              label="Oportunidades de negócio"
              items={opportunities}
              onChange={setOpportunities}
            />
          </div>
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
          className="btn btn-primary"
        >
          Salvar alterações
        </button>
      </form>
    </PermissionGuard>
  );
}

function ProfileBlockEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: { title: string; body: string }[];
  onChange: (items: { title: string; body: string }[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Título" />
        <input value={body} onChange={(e) => setBody(e.target.value)} className="input-field" placeholder="Descrição" />
      </div>
      <button
        type="button"
        className="mt-2 text-sm text-accent"
        onClick={() => {
          if (!title.trim()) return;
          onChange([...items, { title: title.trim(), body: body.trim() }]);
          setTitle("");
          setBody("");
        }}
      >
        + Adicionar bloco
      </button>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((item, i) => (
          <li key={`${item.title}-${i}`} className="rounded border border-border p-3">
            <strong>{item.title}</strong>
            <p className="text-muted">{item.body}</p>
            <button type="button" className="mt-1 text-xs text-danger" onClick={() => onChange(items.filter((_, j) => j !== i))}>
              Remover
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
