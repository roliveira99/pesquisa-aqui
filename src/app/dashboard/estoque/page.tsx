"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButton, DataTable, PageHeader, TabPanel } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { hasPermission } from "@/lib/permissions";
import type { Permission } from "@/types/auth";

interface StockRow {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  minQuantity: number;
  unitPrice: number | null;
  publicVisible: boolean;
}

export default function EstoquePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("consulta");
  const [items, setItems] = useState<StockRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minQuantity, setMinQuantity] = useState("5");
  const [unitPrice, setUnitPrice] = useState("");
  const [publicVisible, setPublicVisible] = useState(false);
  const [adjustId, setAdjustId] = useState("");
  const [adjustDelta, setAdjustDelta] = useState("");

  const refresh = useCallback(async () => {
    const res = await fetch("/api/stock");
    if (res.ok) {
      const data = (await res.json()) as { items: StockRow[] };
      setItems(data.items);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert",
        name,
        sku,
        quantity: Number(quantity),
        minQuantity: Number(minQuantity),
        unitPrice: unitPrice ? Number(unitPrice) : undefined,
        publicVisible,
        kind: "peca",
      }),
    });
    setShowForm(false);
    setName("");
    setSku("");
    setQuantity("");
    await refresh();
  }

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "adjust",
        stockId: adjustId,
        delta: Number(adjustDelta),
      }),
    });
    setAdjustId("");
    setAdjustDelta("");
    await refresh();
  }

  const permissions: Permission[] =
    user?.role === "dono"
      ? ["owner.estoque"]
      : ["gerencia.estoque", "gerencia.entrada_pecas", "gerencia.saida_pecas"];

  const tabs = [
    {
      id: "consulta",
      label: "Consulta",
      content: (
        <DataTable
          headers={["Peça", "SKU", "Qtd", "Mín.", "Valor", "Catálogo público", "Status"]}
          rows={items.map((p) => [
            p.name,
            p.sku ?? "—",
            p.quantity,
            p.minQuantity,
            p.unitPrice != null ? `R$ ${p.unitPrice.toFixed(2)}` : "—",
            p.publicVisible ? "Sim" : "Só interno",
            p.quantity < p.minQuantity ? (
              <span className="text-danger">Estoque baixo</span>
            ) : (
              <span className="dash-badge">OK</span>
            ),
          ])}
        />
      ),
    },
    {
      id: "entrada",
      label: "Cadastro / entrada",
      content: (
        <div className="space-y-6">
          <ActionButton
            label={showForm ? "Cancelar" : "+ Nova peça"}
            variant="primary"
            onClick={() => setShowForm(!showForm)}
          />
          {showForm && (
            <form onSubmit={handleCreate} className="card space-y-3 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Nome da peça *" />
                <input value={sku} onChange={(e) => setSku(e.target.value)} className="input-field" placeholder="SKU" />
                <input required type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input-field" placeholder="Quantidade *" />
                <input type="number" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} className="input-field" placeholder="Estoque mínimo" />
                <input type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} className="input-field" placeholder="Preço ref." />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={publicVisible} onChange={(e) => setPublicVisible(e.target.checked)} />
                  Exibir no catálogo público
                </label>
              </div>
              <button type="submit" className="btn btn-primary">Salvar peça</button>
            </form>
          )}
        </div>
      ),
    },
    {
      id: "ajuste",
      label: "Entrada / saída",
      content: (
        <form onSubmit={handleAdjust} className="card max-w-lg space-y-3 p-5">
          <select required value={adjustId} onChange={(e) => setAdjustId(e.target.value)} className="input-field">
            <option value="">Selecione a peça</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} (atual: {i.quantity})
              </option>
            ))}
          </select>
          <input
            required
            type="number"
            value={adjustDelta}
            onChange={(e) => setAdjustDelta(e.target.value)}
            className="input-field"
            placeholder="Quantidade (+ entrada / − saída)"
          />
          <button type="submit" className="btn btn-primary">Aplicar movimentação</button>
          <p className="text-xs text-muted">Ao emitir nota de serviço com peças do catálogo, a saída é automática.</p>
        </form>
      ),
    },
  ];

  return (
    <PermissionGuard permissions={permissions}>
      <PageHeader
        title="Estoque"
        description="Peças internas ou públicas — usadas em orçamentos e notas"
        actions={
          user && hasPermission(user.role, "owner.cadastro_pecas") ? (
            <ActionButton label="+ Nova peça" variant="primary" onClick={() => setShowForm(true)} />
          ) : undefined
        }
      />
      <TabPanel tabs={tabs} activeTab={tab} onTabChange={setTab} />
    </PermissionGuard>
  );
}
