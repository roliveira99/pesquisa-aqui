"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { Icon, type IconName } from "@/components/ui/Icon";
import { fetchAdminUsers, fetchAdminWorkshops } from "@/lib/api/admin-client";
import { navigationByRole, roleLabels } from "@/lib/permissions";

const adminShortcuts = navigationByRole.master
  .filter((item) => item.href !== "/dashboard")
  .map((item) => ({
    href: item.href,
    label: item.label,
    icon: item.icon as IconName,
    description:
      item.label === "Negócios"
        ? "Cadastrar e gerenciar estabelecimentos"
        : item.label === "Contas e acessos"
          ? "Donos, gerência, mecânicos e jornalistas"
          : item.label === "Patrocínios"
            ? "Destaque de negócios no diretório"
            : item.label === "Assinaturas e planos"
              ? "Planos, MRR e inadimplência"
              : item.label.startsWith("Jornal")
                ? "Manchetes e capa do jornal"
                : item.label === "Jornalistas"
                  ? "Editorias e perfis de redação"
                  : item.label === "Classificados premium"
                    ? "Anúncios pagos na vitrine"
                    : item.label === "Banners e pop-ups"
                      ? "Comunicados no site público"
                      : item.label === "Moderação de avaliações"
                        ? "Aprovar ou remover reviews"
                        : item.label === "Relatórios globais"
                          ? "Indicadores da plataforma"
                          : "Chamados e atendimento",
  }));

export function AdminHome() {
  const [workshopCount, setWorkshopCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [workshopNames, setWorkshopNames] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const [w, u] = await Promise.all([fetchAdminWorkshops(), fetchAdminUsers()]);
      setWorkshopCount(w.workshops.length);
      setWorkshopNames(w.workshops.map((x) => x.name));
      setUserCount(u.users.filter((x) => x.role !== "master").length);
    }
    void load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard geral"
        description="Visão global da plataforma — negócios, conteúdo, assinaturas e suporte em um só lugar"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Negócios ativos" value={workshopCount} icon="building" />
        <StatCard label="Contas operacionais" value={userCount} icon="users" />
        <StatCard label="Gestão" value={adminShortcuts.length} icon="clipboard" trend="Áreas da plataforma" />
        <StatCard label="Acessos" value="→" icon="credit-card" trend="Criar gerência/mecânico" />
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Gestão da plataforma
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {adminShortcuts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card card-hover flex gap-3 p-4 transition"
            >
              <div className="dash-icon-box shrink-0">
                <Icon name={item.icon} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{item.label}</p>
                <p className="mt-0.5 text-sm text-muted">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Negócios na plataforma</h2>
            <Link href="/dashboard/admin/oficinas" className="dash-link text-sm font-medium">
              Gerenciar
            </Link>
          </div>
          {workshopNames.length === 0 ? (
            <p className="text-sm text-muted">Nenhum negócio cadastrado ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {workshopNames.map((name) => (
                <li key={name} className="py-3 text-sm font-medium text-foreground">
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Fluxo recomendado</h2>
            <Link href="/dashboard/admin/contas" className="dash-link text-sm font-medium">
              Contas
            </Link>
          </div>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted">
            <li>Cadastre o negócio (com ou sem dono)</li>
            <li>Crie contas de {roleLabels.gerencia} e {roleLabels.mecanico}</li>
            <li>Publique conteúdo no jornal e classificados</li>
            <li>Confira o perfil público em /negócios/slug</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
