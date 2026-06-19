"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DocumentLineItem } from "@/types/document-line";
import type { CatalogItemRecord } from "@/types/document-line";

function lineId() {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface DocumentLineBuilderProps {
  lineItems: DocumentLineItem[];
  onChange: (items: DocumentLineItem[]) => void;
  paymentMethods?: string[];
  onPaymentMethodsChange?: (methods: string[]) => void;
  showPaymentMethods?: boolean;
}

const PAYMENT_OPTIONS = ["Dinheiro", "PIX", "Cartão débito", "Cartão crédito", "Boleto", "Transferência"];

export function DocumentLineBuilder({
  lineItems,
  onChange,
  paymentMethods = [],
  onPaymentMethodsChange,
  showPaymentMethods = true,
}: DocumentLineBuilderProps) {
  const [search, setSearch] = useState("");
  const [catalog, setCatalog] = useState<CatalogItemRecord[]>([]);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customKind, setCustomKind] = useState<"servico" | "peca">("servico");

  const loadCatalog = useCallback(async () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    const res = await fetch(`/api/catalog-items?${params}`);
    if (res.ok) {
      const data = (await res.json()) as { items: CatalogItemRecord[] };
      setCatalog(data.items);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => void loadCatalog(), 250);
    return () => clearTimeout(t);
  }, [loadCatalog]);

  const total = useMemo(
    () => lineItems.reduce((s, l) => s + l.total, 0),
    [lineItems]
  );

  function addFromCatalog(item: CatalogItemRecord) {
    onChange([
      ...lineItems,
      {
        id: lineId(),
        catalogItemId: item.id,
        name: item.name,
        kind: item.kind,
        quantity: 1,
        unitPrice: item.unitPrice,
        total: item.unitPrice,
      },
    ]);
    setSearch("");
  }

  function addCustom() {
    const price = Number(customPrice);
    if (!customName.trim() || !price) return;
    onChange([
      ...lineItems,
      {
        id: lineId(),
        name: customName.trim(),
        kind: customKind,
        quantity: 1,
        unitPrice: price,
        total: price,
      },
    ]);
    setCustomName("");
    setCustomPrice("");
  }

  function updateLine(id: string, patch: Partial<DocumentLineItem>) {
    onChange(
      lineItems.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l, ...patch };
        next.total = (next.quantity || 0) * (next.unitPrice || 0);
        return next;
      })
    );
  }

  function removeLine(id: string) {
    onChange(lineItems.filter((l) => l.id !== id));
  }

  function togglePayment(method: string) {
    if (!onPaymentMethodsChange) return;
    if (paymentMethods.includes(method)) {
      onPaymentMethodsChange(paymentMethods.filter((m) => m !== method));
    } else {
      onPaymentMethodsChange([...paymentMethods, method]);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="mb-3 font-semibold">Adicionar serviço ou peça</h3>
        <div className="relative mb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
            placeholder="Buscar no catálogo..."
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">🔍</span>
        </div>
        {search && catalog.length > 0 && (
          <ul className="mb-4 max-h-48 overflow-y-auto rounded-lg border border-border">
            {catalog.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-hover"
                  onClick={() => addFromCatalog(item)}
                >
                  <span>
                    {item.name}{" "}
                    <span className="text-xs text-muted">({item.kind === "servico" ? "Serviço" : "Peça"})</span>
                  </span>
                  <span className="font-medium">R$ {item.unitPrice.toFixed(2)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-2 sm:grid-cols-4">
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="input-field sm:col-span-2"
            placeholder="Item avulso (não está no catálogo)"
          />
          <select
            value={customKind}
            onChange={(e) => setCustomKind(e.target.value as "servico" | "peca")}
            className="input-field"
          >
            <option value="servico">Serviço</option>
            <option value="peca">Peça</option>
          </select>
          <div className="flex gap-2">
            <input
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="input-field"
              placeholder="Valor"
              type="number"
              min="0"
              step="0.01"
            />
            <button type="button" className="btn btn-secondary shrink-0" onClick={addCustom}>
              +
            </button>
          </div>
        </div>
      </div>

      {lineItems.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="dash-table-head border-b border-border text-left">
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Qtd</th>
                <th className="px-4 py-3">Valor unit.</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lineItems.map((line) => (
                <tr key={line.id}>
                  <td className="px-4 py-2">{line.name}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="1"
                      className="input-field w-20"
                      value={line.quantity}
                      onChange={(e) => updateLine(line.id, { quantity: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input-field w-28"
                      value={line.unitPrice}
                      onChange={(e) => updateLine(line.id, { unitPrice: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-4 py-2 font-medium">R$ {line.total.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <button type="button" className="text-xs text-danger" onClick={() => removeLine(line.id)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-border bg-surface-hover px-4 py-3 text-right font-semibold">
            Total: R$ {total.toFixed(2)}
          </div>
        </div>
      )}

      {showPaymentMethods && onPaymentMethodsChange && (
        <div className="card p-5">
          <h3 className="mb-3 font-semibold">Formas de pagamento</h3>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_OPTIONS.map((method) => (
              <button
                key={method}
                type="button"
                className={
                  paymentMethods.includes(method) ? "dash-metric-tab dash-metric-tab--active" : "dash-metric-tab"
                }
                onClick={() => togglePayment(method)}
              >
                {method}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
