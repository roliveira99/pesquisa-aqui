"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButton, DataTable, PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import type { CatalogItemRecord } from "@/types/document-line";

export default function ServicosOperacionaisPage() {
  const [items, setItems] = useState<CatalogItemRecord[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/catalog-items?kind=servico");
    if (res.ok) {
      const data = (await res.json()) as { items: CatalogItemRecord[] };
      setItems(data.items.filter((i) => i.kind === "servico"));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/catalog-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "servico",
        name,
        unitPrice: Number(price),
        publicVisible: false,
      }),
    });
    setName("");
    setPrice("");
    setShowForm(false);
    await refresh();
  }

  return (
    <PermissionGuard permissions={["owner.cadastro_servicos", "gerencia.controle_servicos"]}>
      <PageHeader
        title="Serviços"
        description="Cadastre mão de obra, garantias e outros serviços avulsos para orçamentos e notas"
        actions={
          <ActionButton
            label={showForm ? "Fechar" : "+ Novo serviço"}
            variant="primary"
            onClick={() => setShowForm(!showForm)}
          />
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 grid gap-3 p-5 sm:grid-cols-3">
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field sm:col-span-2" placeholder="Ex.: Mão de obra, Garantia estendida" />
          <input required type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field" placeholder="Valor (R$)" />
          <button type="submit" className="btn btn-primary sm:col-span-3">Salvar serviço</button>
        </form>
      )}

      <DataTable
        headers={["Serviço", "Valor", "No catálogo público"]}
        rows={items.map((i) => [
          i.name,
          `R$ ${i.unitPrice.toFixed(2)}`,
          i.publicVisible ? "Sim" : "Só interno",
        ])}
      />
    </PermissionGuard>
  );
}
