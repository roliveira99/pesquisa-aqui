"use client";

import { useState } from "react";
import { PageHeader, TabPanel } from "@/components/dashboard/DashboardUI";
import { ClientesTab, VeiculosTab } from "@/components/dashboard/CadastrosTabs";
import {
  FuncionariosTab,
  PecasCadastroTab,
  ServicosCadastroTab,
} from "@/components/dashboard/CadastroExtraTabs";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import type { Permission } from "@/types/auth";
import { useAuth } from "@/components/auth/AuthProvider";

export default function CadastrosPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("veiculos");
  const isOwner = user?.role === "dono";
  const workshopId = user?.workshopId ?? "1";

  const tabs = [
    {
      id: "veiculos",
      label: "Veículos",
      content: <VeiculosTab workshopId={workshopId} />,
    },
    {
      id: "clientes",
      label: "Clientes (avaliações)",
      content: <ClientesTab workshopId={workshopId} />,
    },
    ...(isOwner
      ? [
          { id: "pecas", label: "Peças", content: <PecasCadastroTab /> },
          { id: "servicos", label: "Serviços", content: <ServicosCadastroTab /> },
          { id: "funcionarios", label: "Funcionários", content: <FuncionariosTab /> },
        ]
      : []),
  ];

  const permissions: Permission[] = isOwner
    ? [
        "owner.cadastro_clientes",
        "owner.cadastro_veiculos",
        "owner.cadastro_pecas",
        "owner.cadastro_servicos",
        "owner.cadastro_funcionarios",
      ]
    : ["gerencia.cadastro_clientes", "gerencia.cadastro_veiculos"];

  return (
    <PermissionGuard permissions={permissions}>
      <PageHeader
        title={isOwner ? "Cadastros" : "Veículos e clientes"}
        description={
          isOwner
            ? "Veículos, clientes (avaliação), peças, serviços e equipe com acesso ao sistema"
            : "Cadastro operacional de veículos"
        }
      />
      <TabPanel tabs={tabs} activeTab={tab} onTabChange={setTab} />
    </PermissionGuard>
  );
}
