"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { workshopTypeLabels } from "@/lib/labels";
import type { WorkshopType } from "@/types/workshop";

const popularCities = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Santos"];

const typeOptions: { value: WorkshopType | ""; label: string }[] = [
  { value: "", label: "Todos os tipos" },
  { value: "carros", label: workshopTypeLabels.carros },
  { value: "motos", label: workshopTypeLabels.motos },
  { value: "mista", label: workshopTypeLabels.mista },
  { value: "estetica", label: workshopTypeLabels.estetica },
];

export function PublicHomeHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<WorkshopType | "">("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (type) params.set("tipo", type);
    router.push(`/oficinas${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-10"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1600&q=80)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-surface/95 to-surface" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-eyebrow mb-4">Sem cadastro · Contato direto · Avaliações reais</p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Encontre a oficina ou estética ideal perto de você
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Compare perfis, veja fotos, catálogo de serviços e fale no WhatsApp — como um guia
            automotivo feito para o motorista brasileiro.
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl border border-border bg-surface/90 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:p-2"
          >
            <div className="relative flex-1">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cidade, bairro ou nome da oficina..."
                className="input-field w-full !border-0 !bg-transparent !pl-10 !shadow-none"
              />
            </div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as WorkshopType | "")}
              className="input-field sm:max-w-[180px]"
            >
              {typeOptions.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
            >
              Buscar
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-muted">Populares:</span>
            {popularCities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => router.push(`/oficinas?q=${encodeURIComponent(city)}`)}
                className="rounded-full border border-border bg-surface px-3 py-1 text-muted-foreground transition hover:border-accent hover:text-accent"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PublicTrustBar() {
  const items = [
    { icon: "star" as const, title: "Avaliações verificadas", desc: "Só quem fez serviço avalia" },
    { icon: "calendar" as const, title: "Agenda online", desc: "Solicite horário sem login" },
    { icon: "sparkles" as const, title: "Estética e mecânica", desc: "Carros, motos e mistas" },
    { icon: "credit-card" as const, title: "Preços de referência", desc: "Catálogo transparente" },
  ];

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {items.map((item) => (
          <div key={item.title} className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Icon name={item.icon} className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-sm text-muted">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PublicHowItWorks() {
  const steps = [
    { n: "1", title: "Busque", desc: "Filtre por cidade, tipo ou serviço." },
    { n: "2", title: "Compare", desc: "Veja fotos, notas, catálogo e horários." },
    { n: "3", title: "Contato", desc: "WhatsApp, agenda ou ligação — sem criar conta." },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-center text-2xl font-semibold">Como funciona para você</h2>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.n} className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
              {step.n}
            </div>
            <h3 className="mt-4 font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
