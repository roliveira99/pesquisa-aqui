"use client";

import { useState } from "react";
import { ActionButton } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";

export default function MecanicoOrcamentosPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <PermissionGuard permissions={["mecanico.criar_orcamento", "mecanico.solicitar_alteracao"]}>
      <PageHeader
        title="Criar orçamento"
        description="Monte um orçamento para o cliente — aguardará aprovação da gerência ou dono"
      />

      {submitted ? (
        <div className="card p-6 text-center">
          <p className="text-lg font-semibold text-foreground">Orçamento enviado para aprovação!</p>
          <p className="mt-2 text-sm text-muted">A gerência será notificada para revisar e aprovar.</p>
          <ActionButton label="Criar outro" variant="primary" onClick={() => setSubmitted(false)} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border border-border bg-surface p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Cliente</label>
              <select className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm" required>
                <option value="">Selecione...</option>
                <option>Carlos Mendes</option>
                <option>Ana Paula R.</option>
                <option>Roberto Lima</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Veículo</label>
              <select className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm" required>
                <option value="">Selecione...</option>
                <option>Honda Civic 2020</option>
                <option>Toyota Corolla 2019</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Serviços</label>
            <textarea
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm"
              rows={3}
              placeholder="Descreva os serviços necessários..."
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Peças utilizadas</label>
            <textarea
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm"
              rows={2}
              placeholder="Liste as peças (consulta apenas — alteração de estoque não permitida)"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Valor estimado (R$)</label>
              <input type="number" className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm" placeholder="0,00" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Fotos do veículo</label>
              <input type="file" accept="image/*" multiple className="w-full text-sm text-muted" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <ActionButton label="Enviar para aprovação" variant="primary" />
            <ActionButton label="Solicitar alteração" />
          </div>

          <p className="text-xs text-muted">
            ❌ Você não pode aprovar orçamentos, alterar estoque ou valores de tabela.
          </p>
        </form>
      )}
    </PermissionGuard>
  );
}
