"use client";

import { ActionButton, DataTable } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { RoleBadge } from "@/components/dashboard/RoleBadge";
import { platformAccounts } from "@/data/admin";

export default function AdminContasPage() {
  return (
    <PermissionGuard permissions={["admin.criar_contas"]}>
      <PageHeader
        title="Contas e acessos"
        description="Criar e gerenciar contas de donos, gerência e mecânicos"
        actions={<ActionButton label="+ Nova conta" variant="primary" />}
      />

      <DataTable
        headers={["Nome", "E-mail", "Perfil", "Oficina", "Status", "Ações"]}
        rows={platformAccounts.map((a) => [
          a.name,
          a.email,
          <RoleBadge key={a.id} role={a.role} />,
          a.workshop,
          a.active ? (
            <span className="text-emerald-400">Ativo</span>
          ) : (
            <span className="text-red-400">Inativo</span>
          ),
          <div key={`act-${a.id}`} className="flex gap-2">
            <ActionButton label="Editar" />
            <ActionButton label={a.active ? "Desativar" : "Ativar"} variant={a.active ? "danger" : "success"} />
          </div>,
        ])}
      />

      <p className="mt-6 rounded-lg border border-border bg-surface p-4 text-sm text-muted">
        Como Administrador Master, você pode criar contas para donos de oficina, gerentes e mecânicos,
        definindo o perfil de acesso de cada um. Dados operacionais das oficinas só podem ser alterados
        pelos próprios gestores autorizados.
      </p>
    </PermissionGuard>
  );
}
