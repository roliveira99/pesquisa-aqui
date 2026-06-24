"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButton, DataTable } from "@/components/dashboard/DashboardUI";
import { ARTICLE_CATEGORIES } from "@/lib/article-categories";
import {
  apiCreateJournalist,
  apiDeleteJournalist,
  apiUpdateJournalist,
  fetchAdminJournalists,
} from "@/lib/api/admin-client";
import type { JournalistRow } from "@/lib/db/admin";
import { formatCategoryLabel } from "@/lib/article-slug";

const emptyForm = {
  id: "",
  name: "",
  email: "",
  password: "",
  journalNiche: "cidade",
};

export function JournalistsAdminPanel({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [journalists, setJournalists] = useState<JournalistRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchAdminJournalists();
      setJournalists(data.journalists);
    } catch (err) {
      onFeedback(err instanceof Error ? err.message : "Erro ao carregar jornalistas.");
    }
  }, [onFeedback]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function startEdit(j: JournalistRow) {
    setForm({
      id: j.id,
      name: j.name,
      email: j.email,
      password: "",
      journalNiche: j.journalNiche ?? "geral",
    });
    setShowForm(true);
  }

  function resetForm() {
    setForm(emptyForm);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.id) {
      const result = await apiUpdateJournalist({
        id: form.id,
        name: form.name,
        journalNiche: form.journalNiche,
        password: form.password || undefined,
      });
      if ("error" in result && result.error) {
        onFeedback(result.error);
        return;
      }
      onFeedback("Perfil do jornalista atualizado.");
    } else {
      const result = await apiCreateJournalist({
        name: form.name,
        email: form.email,
        password: form.password,
        journalNiche: form.journalNiche,
      });
      if ("error" in result && result.error) {
        onFeedback(result.error);
        return;
      }
      onFeedback("Jornalista cadastrado. Envie o acesso por e-mail.");
    }

    resetForm();
    await refresh();
  }

  async function handleDelete(id: string) {
    const result = await apiDeleteJournalist(id);
    if ("error" in result && result.error) {
      onFeedback(result.error);
      return;
    }
    onFeedback("Jornalista removido.");
    await refresh();
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        Cadastre jornalistas e defina qual editoria cada um comanda. Eles publicam manchetes apenas no
        nicho atribuído; capa da home e classificados premium continuam sob controle do administrador master.
      </p>

      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <ActionButton
          label={showForm ? "Cancelar" : "+ Novo jornalista"}
          variant="primary"
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4 p-5">
          <h3 className="font-semibold">{form.id ? "Editar jornalista" : "Novo jornalista"}</h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="Nome completo *"
            />
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              placeholder="E-mail de acesso *"
              disabled={!!form.id}
            />
            <input
              required={!form.id}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
              placeholder={form.id ? "Nova senha (opcional)" : "Senha inicial *"}
            />
            <select
              value={form.journalNiche}
              onChange={(e) => setForm({ ...form, journalNiche: e.target.value })}
              className="input-field"
            >
              {ARTICLE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label} — {c.description}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            {form.id ? "Salvar alterações" : "Cadastrar jornalista"}
          </button>
        </form>
      )}

      <DataTable
        headers={["Nome", "E-mail", "Editoria", "Ações"]}
        rows={journalists.map((j) => [
          j.name,
          j.email,
          formatCategoryLabel(j.journalNiche ?? "geral"),
          <div key={j.id} className="flex flex-wrap gap-1">
            <ActionButton label="Editar" onClick={() => startEdit(j)} />
            <ActionButton label="Remover" variant="danger" onClick={() => void handleDelete(j.id)} />
          </div>,
        ])}
      />
    </div>
  );
}
