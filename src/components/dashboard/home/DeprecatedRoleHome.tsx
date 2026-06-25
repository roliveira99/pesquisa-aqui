"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { roleLabels } from "@/lib/permissions";

export function DeprecatedRoleHome() {
  const { user } = useAuth();
  const roleLabel = user ? roleLabels[user.role] : "Perfil";

  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <PageHeader
        title="Acesso descontinuado"
        description={`O perfil "${roleLabel}" não faz mais parte do sistema.`}
      />
      <p className="mt-4 text-sm text-muted">
        A plataforma agora usa perfis de <strong>site público</strong> (dono do negócio ou pessoa
        física), <strong>jornalistas</strong> e <strong>administrador master</strong>.
      </p>
      <p className="mt-3 text-sm text-muted">
        Entre em contato com o administrador para migrar sua conta ou criar um novo acesso de
        perfil no site.
      </p>
    </div>
  );
}
