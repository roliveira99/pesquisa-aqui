"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ActionButton, DataTable } from "@/components/dashboard/DashboardUI";
import { ARTICLE_CATEGORIES } from "@/lib/article-categories";
import { CitySelectField } from "@/components/region/CitySelectField";
import { PLATFORM_CITIES } from "@/lib/cities";
import { articleHref, formatCategoryLabel } from "@/lib/article-slug";

interface ArticleRow {
  id: string;
  slug: string | null;
  title: string;
  summary: string;
  content: string;
  category: string;
  city: string | null;
  imageUrl: string | null;
  featured: boolean;
  active: boolean;
  authorName?: string | null;
}

interface JournalAdminPanelProps {
  onFeedback: (msg: string) => void;
  mode?: "master" | "jornalista";
  lockedCategory?: string;
}

function buildEmptyForm(category: string) {
  return {
    id: "",
    title: "",
    summary: "",
    content: "",
    category,
    city: PLATFORM_CITIES[0] as string,
    imageUrl: "",
    featured: false,
  };
}

export function JournalAdminPanel({
  onFeedback,
  mode = "master",
  lockedCategory,
}: JournalAdminPanelProps) {
  const isMaster = mode === "master";
  const defaultCategory = lockedCategory ?? "cidade";
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => buildEmptyForm(defaultCategory));

  const refresh = useCallback(async () => {
    const res = await fetch("/api/articles?admin=1", { credentials: "include" });
    if (res.ok) {
      const data = (await res.json()) as { articles: ArticleRow[] };
      setArticles(data.articles);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const tableHeaders = useMemo(() => {
    const headers = ["Título", "Editoria", "Cidade"];
    if (isMaster) headers.push("Autor", "Destaque");
    headers.push("Status", "Ações");
    return headers;
  }, [isMaster]);

  function openNewForm() {
    setForm(buildEmptyForm(defaultCategory));
    setShowForm(true);
  }

  function startEdit(article: ArticleRow) {
    setForm({
      id: article.id,
      title: article.title,
      summary: article.summary,
      content: article.content,
      category: isMaster ? article.category : defaultCategory,
      city: article.city ?? (PLATFORM_CITIES[0] as string),
      imageUrl: article.imageUrl ?? "",
      featured: article.featured,
    });
    setShowForm(true);
  }

  function resetForm() {
    setForm(buildEmptyForm(defaultCategory));
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const category = isMaster ? form.category : defaultCategory;
    const res = await fetch("/api/articles", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert",
        id: form.id || undefined,
        title: form.title,
        summary: form.summary,
        content: form.content,
        category,
        city: form.city.trim() || null,
        imageUrl: form.imageUrl || null,
        featured: isMaster ? form.featured : false,
      }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!data.ok) {
      onFeedback(data.error ?? "Erro ao salvar manchete.");
      return;
    }
    onFeedback(form.id ? "Manchete atualizada." : "Manchete publicada no jornal.");
    resetForm();
    await refresh();
  }

  async function toggleActive(article: ArticleRow) {
    const res = await fetch("/api/articles", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-active", id: article.id, active: !article.active }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!data.ok) {
      onFeedback(data.error ?? "Erro ao alterar status.");
      return;
    }
    onFeedback(article.active ? "Manchete desativada." : "Manchete reativada.");
    await refresh();
  }

  async function handleDelete(id: string) {
    const res = await fetch("/api/articles", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!data.ok) {
      onFeedback(data.error ?? "Erro ao excluir manchete.");
      return;
    }
    onFeedback("Manchete excluída.");
    await refresh();
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        {isMaster ? (
          <>
            Crie manchetes para o jornal no topo do site: escolha a editoria (cidade, esporte, negócios…),
            adicione imagem por URL e marque <strong>destaque no topo</strong> para aparecer maior na home do jornal.
          </>
        ) : (
          <>
            Publique manchetes na editoria <strong>{formatCategoryLabel(defaultCategory)}</strong>.
            A capa do jornal na home é definida pelo administrador master.
          </>
        )}
      </p>

      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <ActionButton
          label={showForm ? "Cancelar" : "+ Nova manchete"}
          variant="primary"
          onClick={() => (showForm ? resetForm() : openNewForm())}
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4 p-5">
          <h3 className="font-semibold">{form.id ? "Editar manchete" : "Nova manchete"}</h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field sm:col-span-2"
              placeholder="Título da manchete *"
            />
            {isMaster ? (
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
              >
                {ARTICLE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} — {c.description}
                  </option>
                ))}
              </select>
            ) : (
              <div className="input-field flex items-center bg-surface-hover text-sm text-muted">
                Editoria: {formatCategoryLabel(defaultCategory)}
              </div>
            )}
            <CitySelectField
              required
              value={form.city}
              onChange={(city) => setForm({ ...form, city })}
              placeholder="Cidade da matéria *"
            />
            <input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="input-field sm:col-span-2"
              placeholder="URL da imagem de capa (ex.: link Unsplash ou CDN)"
            />
          </div>

          <input
            required
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className="input-field"
            placeholder="Linha fina / resumo (aparece nas manchetes) *"
          />
          <textarea
            required
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="input-field min-h-[160px]"
            placeholder="Texto completo da matéria (parágrafos separados por linha em branco) *"
          />

          {isMaster && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="rounded border-border"
              />
              Destaque no topo do jornal (hero maior na home)
            </label>
          )}

          <button type="submit" className="btn btn-primary">
            {form.id ? "Salvar alterações" : "Publicar manchete"}
          </button>
        </form>
      )}

      <DataTable
        headers={tableHeaders}
        rows={articles.map((a) => {
          const cells: React.ReactNode[] = [
            a.title,
            formatCategoryLabel(a.category),
            a.city ?? "—",
          ];
          if (isMaster) {
            cells.push(a.authorName ?? "—", a.featured ? "Sim" : "—");
          }
          cells.push(
            a.active ? "Publicada" : "Inativa",
            <div key={a.id} className="flex flex-wrap gap-1">
              <ActionButton label="Editar" onClick={() => startEdit(a)} />
              <ActionButton
                label={a.active ? "Desativar" : "Ativar"}
                onClick={() => void toggleActive(a)}
              />
              {a.slug && a.active && (
                <a
                  href={articleHref(a)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-surface-hover"
                >
                  Ver
                </a>
              )}
              <ActionButton label="Excluir" variant="danger" onClick={() => void handleDelete(a.id)} />
            </div>
          );
          return cells;
        })}
      />
    </div>
  );
}
