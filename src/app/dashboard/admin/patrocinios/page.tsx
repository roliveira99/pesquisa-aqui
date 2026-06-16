"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButton } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { apiSetWorkshopSponsorship, fetchPlatformSettings } from "@/lib/api/platform-client";
import { workshops } from "@/data/workshops";
import {
  sponsorshipTierLabels,
  type SponsorshipTier,
} from "@/types/platform-admin";

const tiers: SponsorshipTier[] = ["none", "bronze", "prata", "ouro", "diamante"];

export default function AdminPatrociniosPage() {
  const [message, setMessage] = useState("");
  const [tierMap, setTierMap] = useState<Record<string, SponsorshipTier>>({});
  const [version, setVersion] = useState(0);

  const refresh = useCallback(async () => {
    const settings = await fetchPlatformSettings();
    const map: Record<string, SponsorshipTier> = {};
    for (const w of workshops) map[w.id] = "none";
    for (const s of settings.sponsorships) map[s.workshopId] = s.tier;
    setTierMap(map);
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSave(workshopId: string, tier: SponsorshipTier, monthlyValue: string) {
    await apiSetWorkshopSponsorship({
      workshopId,
      tier,
      monthlyValue: monthlyValue ? Number(monthlyValue) : undefined,
    });
    setMessage(`Patrocínio de ${workshops.find((w) => w.id === workshopId)?.name} atualizado.`);
    await refresh();
  }

  return (
    <PermissionGuard permissions={["admin.gerenciar_patrocinios"]}>
      <PageHeader
        title="Patrocínios e destaque"
        description="Oficinas que pagam mais aparecem primeiro na home e no diretório — badge Patrocinado no card"
      />

      {message && (
        <p className="dash-alert">{message}</p>
      )}

      <p className="mb-6 text-sm text-muted">
        Ordem de exibição: <strong>Diamante</strong> → Ouro → Prata → Bronze → demais (por avaliação).
      </p>

      <div className="space-y-4">
        {workshops.map((w) => (
          <SponsorshipRow
            key={`${w.id}-${version}`}
            workshopId={w.id}
            name={w.name}
            city={`${w.city}/${w.state}`}
            initialTier={tierMap[w.id] ?? "none"}
            onSave={handleSave}
          />
        ))}
      </div>
    </PermissionGuard>
  );
}

function SponsorshipRow({
  workshopId,
  name,
  city,
  initialTier,
  onSave,
}: {
  workshopId: string;
  name: string;
  city: string;
  initialTier: SponsorshipTier;
  onSave: (id: string, tier: SponsorshipTier, value: string) => void;
}) {
  const [tier, setTier] = useState<SponsorshipTier>(initialTier);
  const [value, setValue] = useState("");

  useEffect(() => {
    setTier(initialTier);
  }, [initialTier]);

  return (
    <div className="card flex flex-wrap items-end gap-3 p-4">
      <div className="min-w-[180px] flex-1">
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted">{city}</p>
      </div>
      <select
        value={tier}
        onChange={(e) => setTier(e.target.value as SponsorshipTier)}
        className="input-field w-40"
      >
        {tiers.map((t) => (
          <option key={t} value={t}>
            {sponsorshipTierLabels[t]}
          </option>
        ))}
      </select>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input-field w-32"
        placeholder="R$/mês"
      />
      <ActionButton label="Salvar" variant="primary" onClick={() => onSave(workshopId, tier, value)} />
    </div>
  );
}
