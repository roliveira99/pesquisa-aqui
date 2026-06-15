"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { RoleBadge } from "@/components/dashboard/RoleBadge";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { DEMO_ACCOUNTS, apiLogin } from "@/lib/auth-client";
import { roleLabels } from "@/lib/permissions";

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  if (user) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const result = await apiLogin(email, password);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setUser(result.user);
    router.push("/dashboard");
  }

  async function loginAsDemo(demoEmail: string, demoPassword: string) {
    setError("");
    const result = await apiLogin(demoEmail, demoPassword);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setUser(result.user);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-sidebar p-10 text-white lg:flex xl:p-14">
          <Logo variant="light" />
          <div>
            <h1 className="text-3xl font-semibold leading-tight">
              Gestão profissional para oficinas automotivas
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-sidebar-text">
              Acesse o painel conforme seu perfil. Cada usuário visualiza apenas
              o que tem permissão — financeiro, operação ou execução técnica.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-sidebar-text">
              <li className="flex items-center gap-2">
                <Icon name="dashboard" className="h-4 w-4 text-accent" />
                Dashboards por perfil de acesso
              </li>
              <li className="flex items-center gap-2">
                <Icon name="chart" className="h-4 w-4 text-accent" />
                Relatórios e indicadores em tempo real
              </li>
              <li className="flex items-center gap-2">
                <Icon name="users" className="h-4 w-4 text-accent" />
                Controle de equipe e permissões
              </li>
            </ul>
          </div>
          <p className="text-xs text-sidebar-text">
            © MP Oficinas — Plataforma de gestão automotiva
          </p>
        </div>

        <div className="flex flex-col justify-center px-4 py-12 sm:px-8">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">Entrar</h2>
            <p className="mt-1 text-sm text-muted">
              Use suas credenciais ou selecione um perfil de demonstração.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                  {error}
                </p>
              )}

              <Button type="submit" variant="primary" className="w-full">
                Entrar no painel
              </Button>
            </form>

            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Demonstração — acesso direto
              </p>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => loginAsDemo(account.email, account.password)}
                    className="card card-hover flex w-full items-center justify-between p-3.5 text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {roleLabels[account.user.role]}
                      </p>
                      <p className="text-xs text-muted">{account.email}</p>
                    </div>
                    <RoleBadge role={account.user.role} />
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-muted">
              <Link href="/" className="font-medium text-accent hover:text-accent-hover">
                ← Voltar ao site
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
