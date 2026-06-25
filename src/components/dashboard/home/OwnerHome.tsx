"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { businessProfilePath } from "@/lib/platform-routes";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { Icon } from "@/components/ui/Icon";
import { fetchAllAgenda } from "@/lib/api/crm-client";

export function OwnerHome() {
  const { user } = useAuth();
  const [pendingAgenda, setPendingAgenda] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const { requests } = await fetchAllAgenda();
      const pending = requests.filter(
        (r) => r.status === "pendente" || r.status === "alteracao_pendente"
      ).length;
      setPendingAgenda(pending);
    } catch {
      setPendingAgenda(0);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const publicHref = user?.workshopSlug ? businessProfilePath(user.workshopSlug) : null;

  return (
    <div>
      <PageHeader
        title="Meu perfil no site"
        description={`Olá, ${user?.name} — configure sua página pública e receba clientes.`}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Agendamentos pendentes" value={pendingAgenda} />
        <StatCard label="Negócio" value={user?.workshopName ?? "—"} />
        <StatCard label="Perfil" value="Ativo no site" />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-foreground">Configure seu site</h2>
          <p className="mt-2 text-sm text-muted">
            Personalize fotos, descrição e informações de contato. Sua página fica visível para
            clientes na vitrine pública.
          </p>
          <ul className="mt-4 space-y-2">
            <QuickLink href="/dashboard/perfil" icon="sparkles" label="Editar perfil e mídia" />
            <QuickLink href="/dashboard/classificados" icon="package" label="Publicar classificados" />
            <QuickLink href="/dashboard/agenda" icon="calendar" label="Gerenciar agenda" />
          </ul>
        </section>

        <section className="card flex flex-col justify-between p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Página pública</h2>
            <p className="mt-2 text-sm text-muted">
              Este é o endereço que clientes veem ao encontrar seu negócio na plataforma.
            </p>
          </div>
          {publicHref ? (
            <Link
              href={publicHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
            >
              Ver meu perfil no site
              <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Complete os dados do perfil para publicar sua página.
            </p>
          )}
        </section>
      </div>

      {pendingAgenda > 0 && (
        <div className="dash-alert mb-6">
          Você tem {pendingAgenda} solicitação{pendingAgenda > 1 ? "ões" : ""} de agenda aguardando
          resposta.{" "}
          <Link href="/dashboard/agenda" className="font-semibold text-accent hover:underline">
            Ver agenda
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="dash-stat">
      <p className="text-lg font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: "sparkles" | "package" | "calendar";
  label: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
      >
        <Icon name={icon} className="h-4 w-4" />
        {label}
      </Link>
    </li>
  );
}
