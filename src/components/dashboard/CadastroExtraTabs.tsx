"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButton, DataTable } from "@/components/dashboard/DashboardUI";
import type { CatalogItemRecord } from "@/types/document-line";
import type { Permission } from "@/types/auth";

interface StockRow {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  minQuantity: number;
  unitPrice: number | null;
  costPrice?: number | null;
  salePrice?: number | null;
  markupPercent?: number | null;
  publicVisible: boolean;
}

function calcSalePrice(cost: number, markup: number) {
  return Math.round(cost * (1 + markup / 100) * 100) / 100;
}

export function PecasCadastroTab() {
  const [items, setItems] = useState<StockRow[]>([]);
  const [editing, setEditing] = useState<StockRow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [costPrice, setCostPrice] = useState("");
  const [markupPercent, setMarkupPercent] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [priceMode, setPriceMode] = useState<"direct" | "markup">("markup");
  const [publicVisible, setPublicVisible] = useState(false);

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

  function openEdit(item: StockRow) {
    setEditing(item);
    setName(item.name);
    setSku(item.sku ?? "");
    setQuantity(String(item.quantity));
    setCostPrice(item.costPrice != null ? String(item.costPrice) : "");
    setMarkupPercent(item.markupPercent != null ? String(item.markupPercent) : "");
    setSalePrice(String(item.salePrice ?? item.unitPrice ?? ""));
    setPriceMode(item.markupPercent != null ? "markup" : "direct");
    setPublicVisible(item.publicVisible);
    setShowForm(true);
  }

  function resetForm() {
    setEditing(null);
    setShowForm(false);
    setName("");
    setSku("");
    setQuantity("0");
    setCostPrice("");
    setMarkupPercent("");
    setSalePrice("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cost = Number(costPrice) || 0;
    const finalSale =
      priceMode === "markup" && cost > 0
        ? calcSalePrice(cost, Number(markupPercent) || 0)
        : Number(salePrice) || 0;

    await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert",
        id: editing?.id,
        name,
        sku,
        quantity: Number(quantity),
        costPrice: cost || undefined,
        markupPercent: priceMode === "markup" ? Number(markupPercent) || undefined : undefined,
        salePrice: finalSale || undefined,
        unitPrice: finalSale || undefined,
        publicVisible,
        kind: "peca",
      }),
    });
    resetForm();
    await refresh();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <ActionButton
          label={showForm ? "Cancelar" : "+ Nova peça"}
          variant="primary"
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
        />
      </div>
      <p className="mb-4 text-sm text-muted">
        SKU é o código interno da peça (opcional) — ajuda a identificar itens no estoque, como um código de barras da oficina.
      </p>
      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-3 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Nome da peça *" />
            <input value={sku} onChange={(e) => setSku(e.target.value)} className="input-field" placeholder="SKU (opcional)" />
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input-field" placeholder="Quantidade" />
            <input type="number" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className="input-field" placeholder="Custo fornecedor (R$)" />
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" checked={priceMode === "markup"} onChange={() => setPriceMode("markup")} />
              Preço por margem (%)
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={priceMode === "direct"} onChange={() => setPriceMode("direct")} />
              Preço de venda direto
            </label>
          </div>
          {priceMode === "markup" ? (
            <input type="number" step="0.1" value={markupPercent} onChange={(e) => setMarkupPercent(e.target.value)} className="input-field max-w-xs" placeholder="Margem %" />
          ) : (
            <input type="number" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="input-field max-w-xs" placeholder="Preço de venda (R$)" />
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={publicVisible} onChange={(e) => setPublicVisible(e.target.checked)} />
            Exibir no catálogo público
          </label>
          <button type="submit" className="btn btn-primary">{editing ? "Salvar" : "Cadastrar peça"}</button>
        </form>
      )}
      <DataTable
        headers={["Peça", "SKU", "Custo", "Venda", "Qtd", "Catálogo", "Ações"]}
        rows={items.map((p) => [
          p.name,
          p.sku ?? "—",
          p.costPrice != null ? `R$ ${p.costPrice.toFixed(2)}` : "—",
          p.salePrice != null ? `R$ ${p.salePrice.toFixed(2)}` : p.unitPrice != null ? `R$ ${p.unitPrice.toFixed(2)}` : "—",
          p.quantity,
          p.publicVisible ? "Público" : "Interno",
          <ActionButton key={p.id} label="Editar" onClick={() => openEdit(p)} />,
        ])}
      />
    </div>
  );
}

export function ServicosCadastroTab() {
  const [items, setItems] = useState<CatalogItemRecord[]>([]);
  const [editing, setEditing] = useState<CatalogItemRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [publicVisible, setPublicVisible] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/catalog-items");
    if (res.ok) {
      const data = (await res.json()) as { items: CatalogItemRecord[] };
      setItems(data.items.filter((i) => i.kind === "servico"));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function openEdit(item: CatalogItemRecord) {
    setEditing(item);
    setName(item.name);
    setPrice(String(item.unitPrice));
    setPublicVisible(item.publicVisible);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/catalog-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing?.id,
        kind: "servico",
        name,
        unitPrice: Number(price),
        publicVisible,
      }),
    });
    setEditing(null);
    setShowForm(false);
    setName("");
    setPrice("");
    setPublicVisible(true);
    await refresh();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <ActionButton label={showForm ? "Cancelar" : "+ Novo serviço"} variant="primary" onClick={() => setShowForm(!showForm)} />
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 grid gap-3 p-5 sm:grid-cols-3">
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field sm:col-span-2" placeholder="Ex.: Mão de obra, Garantia estendida" />
          <input required type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field" placeholder="Valor (R$)" />
          <label className="flex items-center gap-2 text-sm sm:col-span-3">
            <input type="checkbox" checked={publicVisible} onChange={(e) => setPublicVisible(e.target.checked)} />
            Exibir no catálogo público
          </label>
          <button type="submit" className="btn btn-primary sm:col-span-3">{editing ? "Salvar" : "Cadastrar"}</button>
        </form>
      )}
      <DataTable
        headers={["Serviço", "Valor", "Catálogo público", "Ações"]}
        rows={items.map((i) => [
          i.name,
          `R$ ${i.unitPrice.toFixed(2)}`,
          i.publicVisible ? "Sim" : "Só interno",
          <ActionButton key={i.id} label="Editar" onClick={() => openEdit(i)} />,
        ])}
      />
    </div>
  );
}

const PERM_LABELS: Partial<Record<Permission, string>> = {
  "owner.fluxo_caixa": "Financeiro geral",
  "owner.contas_pagar": "Contas a pagar",
  "owner.contas_receber": "Contas a receber",
  "owner.estoque": "Estoque",
  "owner.salarios": "RH / salários",
  "owner.comissoes": "Comissões",
  "gerencia.estoque": "Estoque (gerência)",
  "gerencia.emissao_notas": "Emitir notas",
};

export function FuncionariosTab() {
  const [members, setMembers] = useState<{ id: string; name: string; email: string; role: string }[]>([]);
  const [grants, setGrants] = useState<{ userId: string; permission: Permission; granted: boolean }[]>([]);
  const [grantable, setGrantable] = useState<Permission[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedManager, setSelectedManager] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"mecanico" | "gerencia">("mecanico");
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    const [teamRes, permRes] = await Promise.all([
      fetch("/api/workshop/team"),
      fetch("/api/manager-permissions"),
    ]);
    if (teamRes.ok) {
      const data = (await teamRes.json()) as { members: typeof members };
      setMembers(data.members);
    }
    if (permRes.ok) {
      const data = (await permRes.json()) as {
        grants: typeof grants;
        grantablePermissions: Permission[];
        managers: { id: string }[];
      };
      setGrants(data.grants);
      setGrantable(data.grantablePermissions);
      if (!selectedManager && data.managers[0]) setSelectedManager(data.managers[0].id);
    }
  }, [selectedManager]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/workshop/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", name, email, password, role }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!data.ok) {
      setMessage(data.error ?? "Erro ao cadastrar.");
      return;
    }
    setMessage("Funcionário cadastrado. Informe e-mail e senha temporária ao colaborador.");
    setShowForm(false);
    setName("");
    setEmail("");
    setPassword("");
    await refresh();
  }

  async function removeMember(userId: string) {
    if (!confirm("Remover este funcionário? Ele perderá o acesso.")) return;
    await fetch("/api/workshop/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", userId }),
    });
    await refresh();
  }

  async function resetPassword(userId: string) {
    const pwd = prompt("Nova senha (mín. 6 caracteres):");
    if (!pwd) return;
    await fetch("/api/workshop/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset-password", userId, password: pwd }),
    });
    setMessage("Senha redefinida. Informe o colaborador.");
  }

  async function toggleGrant(permission: Permission, granted: boolean) {
    await fetch("/api/workshop/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "grant", userId: selectedManager, permission, granted }),
    });
    await refresh();
  }

  const managers = members.filter((m) => m.role === "gerencia");
  const roleLabel = (r: string) => (r === "gerencia" ? "Gerência" : r === "mecanico" ? "Mecânico" : r);

  return (
    <div className="space-y-8">
      {message && <p className="dash-alert">{message}</p>}
      <div className="flex justify-end">
        <ActionButton label={showForm ? "Cancelar" : "+ Adicionar funcionário"} variant="primary" onClick={() => setShowForm(!showForm)} />
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="card grid gap-3 p-5 sm:grid-cols-2">
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Nome *" />
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="E-mail *" />
          <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Senha temporária *" />
          <select value={role} onChange={(e) => setRole(e.target.value as "mecanico" | "gerencia")} className="input-field">
            <option value="mecanico">Mecânico</option>
            <option value="gerencia">Gerência</option>
          </select>
          <button type="submit" className="btn btn-primary sm:col-span-2">Cadastrar</button>
          <p className="text-xs text-muted sm:col-span-2">Por enquanto a senha é definida aqui; em breve o colaborador poderá redefinir sozinho.</p>
        </form>
      )}
      <DataTable
        headers={["Nome", "E-mail", "Perfil", "Ações"]}
        rows={members.map((m) => [
          m.name,
          m.email,
          roleLabel(m.role),
          <div key={m.id} className="flex flex-wrap gap-1">
            <ActionButton label="Redefinir senha" onClick={() => void resetPassword(m.id)} />
            {m.role !== "dono" && (
              <ActionButton label="Remover" onClick={() => void removeMember(m.id)} />
            )}
          </div>,
        ])}
      />
      {managers.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold">Permissões da gerência</h3>
          <select value={selectedManager} onChange={(e) => setSelectedManager(e.target.value)} className="input-field mb-4 max-w-md">
            {managers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <DataTable
            headers={["Permissão", "Ativa", "Ação"]}
            rows={grantable.map((p) => {
              const active = grants.some((g) => g.userId === selectedManager && g.permission === p && g.granted);
              return [
                PERM_LABELS[p] ?? p,
                active ? "Sim" : "Não",
                <ActionButton
                  key={p}
                  label={active ? "Revogar" : "Conceder"}
                  onClick={() => void toggleGrant(p, !active)}
                />,
              ];
            })}
          />
        </div>
      )}
    </div>
  );
}
