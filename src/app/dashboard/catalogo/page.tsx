"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/dashboard/DashboardUI";
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
    setCatalog(next);
    await saveCatalog(next);
    try {
      const data = await fetchCatalog();
      setCatalog(data.catalog ?? next);
      setPublicCatalog(data.publicCatalog ?? next);
      setSlug(data.slug ?? slug);
    } catch {
      setPublicCatalog(next);
    }
  }

  function addItem(type: "services" | "parts", name: string, price: number) {
    if (!name.trim() || price <= 0) return;
    persist({
      ...catalog,
      [type]: [...catalog[type], newCatalogItem(name.trim(), price)],
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

  const profileHref = slug ? businessProfilePath(slug) : null;
  const publicServiceCount = publicCatalog.services.length;
  const publicPartCount = publicCatalog.parts.length;

  return (
    <PermissionGuard permissions={["owner.cadastro_servicos"]}>
      <PageHeader
        title="Catálogo do perfil público"
        description="Serviços e peças exibidos no seu perfil — como um cardápio do negócio. Preços são referência e podem mudar no orçamento."
      />

      <p className="dash-alert mb-6">{PRICE_DISCLAIMER}</p>

      <p className="mb-2 text-sm text-muted">
        No perfil público hoje:{" "}
        <strong>
          {publicServiceCount} serviço{publicServiceCount === 1 ? "" : "s"} e {publicPartCount} peça
          {publicPartCount === 1 ? "" : "s"}/produto{publicPartCount === 1 ? "" : "s"}
        </strong>
        . Itens cadastrados em <strong>Cadastros → Serviços</strong> com &quot;Exibir no catálogo público&quot; também
        entram aqui automaticamente.
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
      />

      <CatalogEditor
        title="Peças e produtos"
        type="parts"
        items={catalog.parts}
        onAdd={addItem}
        onRemove={removeItem}
        onUpdatePrice={updatePrice}
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
  className,
}: {
  title: string;
  type: "services" | "parts";
  items: CatalogItem[];
  onAdd: (type: "services" | "parts", name: string, price: number) => void;
  onRemove: (type: "services" | "parts", id: string) => void;
  onUpdatePrice: (type: "services" | "parts", id: string, price: number) => void;
  className?: string;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  return (
    <section className={`card p-5 ${className ?? ""}`}>
      <h2 className="font-semibold text-foreground">{title}</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAdd(type, name, Number(price));
          setName("");
          setPrice("");
        }}
        className="mt-4 flex flex-wrap gap-3"
      >
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
        <button type="submit" className="btn btn-primary">
          Adicionar
        </button>
      </form>

      <ul className="mt-4 divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center gap-3 py-3">
            <span className="min-w-[140px] flex-1 font-medium">{item.name}</span>
            <label className="flex items-center gap-2 text-sm text-muted">
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
