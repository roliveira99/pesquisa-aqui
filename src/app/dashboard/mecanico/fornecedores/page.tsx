"use client";

import { useCallback, useEffect, useState } from "react";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { Icon } from "@/components/ui/Icon";
import { apiAddSupplier, apiRemoveSupplier, fetchSuppliers } from "@/lib/api/crm-client";
import type { SupplierContact } from "@/types/workshop";

export default function FornecedoresPage() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<SupplierContact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const refresh = useCallback(async () => {
    const data = await fetchSuppliers();
    setSuppliers(data.suppliers);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, user?.workshopId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const data = await apiAddSupplier({
      name: name.trim(),
      phone: phone.trim(),
      notes: notes.trim() || undefined,
    });
    setSuppliers(data.suppliers);
    setName("");
    setPhone("");
    setNotes("");
  }

  async function handleRemove(id: string) {
    const data = await apiRemoveSupplier(id);
    setSuppliers(data.suppliers);
  }

  function handleCall(phone: string) {
    window.location.href = `tel:${phone.replace(/\D/g, "")}`;
  }

  return (
    <PermissionGuard permissions={["mecanico.fornecedores"]}>
      <PageHeader
        title="Contatos de fornecedores"
        description="Agenda rápida de quem você liga no dia a dia. Nome e telefone — sem burocracia."
      />

      <form onSubmit={handleAdd} className="card mb-6 p-5">
        <h2 className="text-sm font-semibold text-foreground">Novo fornecedor</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Nome / loja"
          />
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
            placeholder="Telefone"
          />
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field"
            placeholder="Observação (opcional)"
          />
        </div>
        <button
          type="submit"
          className="mt-4 btn btn-primary hover:opacity-90"
        >
          Adicionar contato
        </button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <article key={supplier.id} className="card flex flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground">{supplier.name}</h3>
                <p className="mt-1 text-lg font-medium text-foreground">{supplier.phone}</p>
                {supplier.notes && (
                  <p className="mt-2 text-xs text-muted">{supplier.notes}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(supplier.id)}
                className="rounded p-1 text-muted hover:bg-surface-hover hover:text-foreground"
                aria-label={`Remover ${supplier.name}`}
              >
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleCall(supplier.phone)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium hover:bg-surface-hover"
            >
              Ligar agora
            </button>
          </article>
        ))}
      </div>

      {suppliers.length === 0 && (
        <p className="text-center text-sm text-muted">Nenhum fornecedor cadastrado ainda.</p>
      )}
    </PermissionGuard>
  );
}
