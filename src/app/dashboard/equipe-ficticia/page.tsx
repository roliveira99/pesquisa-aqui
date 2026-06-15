"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButton, DataTable, TabPanel } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { MechanicKindBadge } from "@/components/dashboard/MechanicAssigneeSelect";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  apiAddFictionalMechanic,
  apiSetFictionalActive,
  fetchCrm,
} from "@/lib/api/crm-client";
import type { FictionalMechanic, MechanicProductivity } from "@/types/client";

export default function EquipeFicticiaPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("perfis");
  const [mechanics, setMechanics] = useState<FictionalMechanic[]>([]);
  const [productivity, setProductivity] = useState<MechanicProductivity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const data = await fetchCrm();
    setMechanics(data.fictionalMechanics);
    setProductivity(data.productivity);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, user?.workshopId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = await apiAddFictionalMechanic({ name, specialty, notes });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setSpecialty("");
    setNotes("");
    setShowForm(false);
    await refresh();
  }

  const tabs = [
    {
      id: "perfis",
      label: "Perfis fictícios",
      content: (
        <div>
          <p className="mb-4 text-sm text-muted">
            Funcionários sem e-mail ou sem acesso ao sistema. Gerência e dono lançam orçamentos e serviços
            em nome deles para acompanhar a produção individual.
          </p>

          <div className="mb-4 flex justify-end">
            <ActionButton
              label={showForm ? "Cancelar" : "+ Novo perfil fictício"}
              variant={showForm ? "secondary" : "primary"}
              onClick={() => {
                setShowForm(!showForm);
                setError("");
              }}
            />
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="card mb-6 space-y-4 p-5">
              <h3 className="font-semibold">Criar mecânico fictício</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Nome completo"
                />
                <input
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="input-field"
                  placeholder="Especialidade (opcional)"
                />
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  placeholder="Observação (opcional)"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
                Salvar perfil
              </button>
            </form>
          )}

          <DataTable
            headers={["Nome", "Especialidade", "Observação", "Status", "Ações"]}
            rows={mechanics.map((m) => [
              m.name,
              m.specialty ?? "—",
              m.notes ?? "—",
              m.active ? (
                <span key={`st-${m.id}`} className="text-xs font-medium text-emerald-600">
                  Ativo
                </span>
              ) : (
                <span key={`st-${m.id}`} className="text-xs text-muted">
                  Inativo
                </span>
              ),
              <ActionButton
                key={`act-${m.id}`}
                label={m.active ? "Desativar" : "Reativar"}
                onClick={() => {
                  void apiSetFictionalActive(m.id, !m.active).then(() => refresh());
                }}
              />,
            ])}
          />
        </div>
      ),
    },
    {
      id: "produtividade",
      label: "Produtividade",
      content: (
        <div>
          <p className="mb-4 text-sm text-muted">
            Resumo de orçamentos e serviços por funcionário — inclui perfis fictícios e quem tem login.
          </p>
          <DataTable
            headers={["Funcionário", "Tipo", "OS total", "Concluídas", "Em aberto", "Valor concluído", "Valor total"]}
            rows={productivity.map((p) => [
              p.assignee.name,
              <MechanicKindBadge key={`k-${p.assignee.id}`} kind={p.assignee.kind} />,
              p.totalOrders,
              p.completedOrders,
              p.inProgressOrders,
              p.completedValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
              p.totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
            ])}
          />
        </div>
      ),
    },
  ];

  return (
    <PermissionGuard permissions={["owner.mecanicos_ficticios", "gerencia.mecanicos_ficticios"]}>
      <PageHeader
        title="Equipe sem acesso"
        description="Perfis fictícios para funcionários sem login — gerência e dono lançam a produção em nome deles"
      />
      <TabPanel tabs={tabs} activeTab={tab} onTabChange={setTab} />
    </PermissionGuard>
  );
}
