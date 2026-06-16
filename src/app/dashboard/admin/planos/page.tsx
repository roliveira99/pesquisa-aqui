"use client";

import { ActionButton } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { plans } from "@/data/admin";

export default function AdminPlanosPage() {
  return (
    <PermissionGuard permissions={["admin.definir_planos"]}>
      <PageHeader
        title="Planos e recursos"
        description="Defina planos de assinatura e recursos disponíveis para cada oficina"
        actions={<ActionButton label="+ Novo plano" variant="primary" />}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card p-6 ${
              plan.id === "profissional" ? "ring-1 ring-border-strong" : ""
            }`}
          >
            {plan.id === "profissional" && (
              <span className="dash-badge mb-2 inline-block">Mais popular</span>
            )}
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="mt-2">
              <span className="text-3xl font-bold">R$ {plan.price}</span>
              <span className="text-muted">/mês</span>
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted">
                  <span className="text-muted">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-2">
              <ActionButton label="Editar" />
              <ActionButton label="Recursos" variant="primary" />
            </div>
          </div>
        ))}
      </div>
    </PermissionGuard>
  );
}
