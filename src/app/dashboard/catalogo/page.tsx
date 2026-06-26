"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { ImageFilePicker } from "@/components/ui/ImageFilePicker";
import { fetchCatalog, saveCatalog } from "@/lib/api/crm-client";
import { businessProfilePath } from "@/lib/platform-routes";
import { formatCatalogPrice, newCatalogItem } from "@/lib/workshop-storage";
import { PRICE_DISCLAIMER } from "@/lib/workshop-profile";
import type { CatalogItem, WorkshopCatalog } from "@/types/workshop";

const emptyCatalog: WorkshopCatalog = { services: [], parts: [] };

export default function CatalogoPublicoPage() {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<WorkshopCatalog>(emptyCatalog);
  const [publicCatalog, setPublicCatalog] = useState<WorkshopCatalog>(emptyCatalog);
  const [slug, setSlug] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCatalog();
        setCatalog(data.catalog ?? emptyCatalog);
        setPublicCatalog(data.publicCatalog ?? data.catalog ?? emptyCatalog);
        setSlug(data.slug ?? null);
      } catch {
        setCatalog(emptyCatalog);
        setPublicCatalog(emptyCatalog);
      }
    }
    void load();
  }, [user?.workshopId]);

  async function persist(next: WorkshopCatalog) {
    setError("");
    setCatalog(next);
    try {
      await saveCatalog(next);
      const data = await fetchCatalog();
      setCatalog(data.catalog ?? next);
      setPublicCatalog(data.publicCatalog ?? next);
      setSlug(data.slug ?? slug);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar catálogo.");
      setPublicCatalog(next);
    }
  }

  function addItem(type: "services" | "parts", name: string, price: number, imageUrl?: string) {
    if (!name.trim() || price <= 0) return;
    persist({
      ...catalog,
      [type]: [...catalog[type], newCatalogItem(name.trim(), price, imageUrl)],
    });
  }

  function removeItem(type: "services" | "parts", id: string) {
    persist({
      ...catalog,
      [type]: catalog[type].filter((i) => i.id !== id),
    });
  }

  function updatePrice(type: "services" | "parts", id: string, priceFrom: number) {
    persist({
      ...catalog,
      [type]: catalog[type].map((i) => (i.id === id ? { ...i, priceFrom } : i)),
    });
  }

  function updateImage(type: "services" | "parts", id: string, imageUrl: string) {
    persist({
      ...catalog,
      [type]: catalog[type].map((i) =>
        i.id === id ? { ...i, imageUrl: imageUrl || undefined } : i
      ),
    });
  }

  const profileHref = slug ? businessProfilePath(slug) : null;
  const publicServiceCount = publicCatalog.services.length;
  const publicPartCount = publicCatalog.parts.length;

  return (
    <PermissionGuard permissions={["owner.catalogo"]}>
      <PageHeader
        title="Catálogo do perfil público"
        description="Serviços e produtos exibidos no seu perfil — como um cardápio do negócio. Adicione foto de cada item."
      />

      {error && <p className="dash-alert dash-alert-error mb-4">{error}</p>}

      <p className="dash-alert mb-6">{PRICE_DISCLAIMER}</p>

      <p className="mb-2 text-sm text-muted">
        No perfil público hoje:{" "}
        <strong>
          {publicServiceCount} serviço{publicServiceCount === 1 ? "" : "s"} e {publicPartCount} peça
          {publicPartCount === 1 ? "" : "s"}/produto{publicPartCount === 1 ? "" : "s"}
        </strong>
        .
      </p>

      {profileHref ? (
        <p className="mb-6 text-sm text-muted">
          Visualize como o cliente vê:{" "}
          <Link href={profileHref} className="dash-link font-medium" target="_blank">
            {user?.workshopName ?? "Perfil público"}
          </Link>
        </p>
      ) : null}

      <CatalogEditor
        title="Serviços"
        type="services"
        items={catalog.services}
        onAdd={addItem}
        onRemove={removeItem}
        onUpdatePrice={updatePrice}
        onUpdateImage={updateImage}
      />

      <CatalogEditor
        title="Peças e produtos"
        type="parts"
        items={catalog.parts}
        onAdd={addItem}
        onRemove={removeItem}
        onUpdatePrice={updatePrice}
        onUpdateImage={updateImage}
        className="mt-8"
      />
    </PermissionGuard>
  );
}

function CatalogEditor({
  title,
  type,
  items,
  onAdd,
  onRemove,
  onUpdatePrice,
  onUpdateImage,
  className,
}: {
  title: string;
  type: "services" | "parts";
  items: CatalogItem[];
  onAdd: (type: "services" | "parts", name: string, price: number, imageUrl?: string) => void;
  onRemove: (type: "services" | "parts", id: string) => void;
  onUpdatePrice: (type: "services" | "parts", id: string, price: number) => void;
  onUpdateImage: (type: "services" | "parts", id: string, imageUrl: string) => void;
  className?: string;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  return (
    <section className={`card p-5 ${className ?? ""}`}>
      <h2 className="font-semibold text-foreground">{title}</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAdd(type, name, Number(price), imageUrl || undefined);
          setName("");
          setPrice("");
          setImageUrl("");
        }}
        className="mt-4 space-y-4"
      >
        <div className="flex flex-wrap gap-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field min-w-[200px] flex-1"
            placeholder="Nome do item"
          />
          <input
            required
            type="number"
            min={1}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input-field w-32"
            placeholder="Preço (R$)"
          />
        </div>

        <ImageFilePicker
          label="Foto do item (opcional)"
          hint="Escolha uma imagem da galeria do dispositivo."
          value={imageUrl}
          onChange={setImageUrl}
          onClear={() => setImageUrl("")}
          buttonLabel="Escolher foto"
          previewClassName="h-28 w-28 rounded-lg object-cover"
        />

        <button type="submit" className="btn btn-primary">
          Adicionar ao catálogo
        </button>
      </form>

      <ul className="mt-6 divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-start gap-4 py-4">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt=""
                className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-surface-hover text-xs text-muted">
                Sem foto
              </div>
            )}

            <div className="min-w-[140px] flex-1">
              <p className="font-medium text-foreground">{item.name}</p>
              <label className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                a partir de R$
                <input
                  type="number"
                  min={1}
                  step={0.01}
                  value={item.priceFrom}
                  onChange={(e) => onUpdatePrice(type, item.id, Number(e.target.value))}
                  className="input-field w-24 py-1"
                />
                <span className="text-xs">({formatCatalogPrice(item.priceFrom)})</span>
              </label>
              <div className="mt-3 max-w-xs">
                <ImageFilePicker
                  label=""
                  value={item.imageUrl ?? ""}
                  onChange={(url) => onUpdateImage(type, item.id, url)}
                  onClear={() => onUpdateImage(type, item.id, "")}
                  buttonLabel={item.imageUrl ? "Trocar foto" : "Adicionar foto"}
                  previewClassName="hidden"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => onRemove(type, item.id)}
              className="dash-link text-sm text-danger"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
