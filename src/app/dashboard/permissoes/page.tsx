"use client";

import { useCallback, useEffect, useState } from "react";
import { DataTable, PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import type { Permission } from "@/types/auth";

const PERM_LABELS: Partial<Record<Permission, string>> = {
  "owner.fluxo_caixa": "Visualizar financeiro geral",
  "owner.contas_pagar": "Gerenciar contas a pagar",
  "owner.contas_receber": "Gerenciar contas a receber",
  "owner.estoque": "Editar estoque",
  "owner.salarios": "Visualizar RH / salários",
  "owner.comissoes": "Editar comissões e pagamentos",
};

export default function PermissoesGerenciaPage() {
  const [managers, setManagers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [grants, setGrants] = useState<{ userId: string; permission: Permission; granted: boolean }[]>([]);
  const [grantable, setGrantable] = useState<Permission[]>([]);
  const [selectedManager, setSelectedManager] = useState("");

  const refresh = useCallback(async () => {
    const res = await fetch("/api/manager-permissions");
    if (res.ok) {
      const data = (await res.json()) as {
        managers: typeof managers;
        grants: typeof grants;
        grantablePermissions: Permission[];
      };
      setManagers(data.managers);
      setGrants(data.grants);
      setGrantable(data.grantablePermissions);
      if (!selectedManager && data.managers[0]) setSelectedManager(data.managers[0].id);
    }
  }, [selectedManager]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function toggle(userId: string, permission: Permission, granted: boolean) {
    await fetch("/api/manager-permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, permission, granted }),
    });
    await refresh();
  }

  const manager = managers.find((m) => m.id === selectedManager);

  return (
    <PermissionGuard permissions={["owner.cadastro_funcionarios"]}>
      <PageHeader
        title="Permissões da gerência"
        description="Defina o que cada gerente pode ver e editar (financeiro, RH, estoque)"
      />

      {managers.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma conta de gerência cadastrada nesta oficina.</p>
      ) : (
        <div className="space-y-4">
          <select
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
            className="input-field max-w-md"
          >
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>

          {manager && (
            <DataTable
              headers={["Permissão", "Status", "Ação"]}
              rows={grantable.map((p) => {
                const active = grants.some((g) => g.userId === manager.id && g.permission === p && g.granted);
                return [
                  PERM_LABELS[p] ?? p,
                  active ? "Liberado" : "Bloqueado",
                  <button
                    key={p}
                    type="button"
                    className="dash-link text-sm"
                    onClick={() => void toggle(manager.id, p, !active)}
                  >
                    {active ? "Revogar" : "Conceder"}
                  </button>,
                ];
              })}
            />
          )}
        </div>
      )}
    </PermissionGuard>
  );
}
