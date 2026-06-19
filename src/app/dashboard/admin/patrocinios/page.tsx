"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButton } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { fetchAdminWorkshops } from "@/lib/api/admin-client";
import { apiSetWorkshopSponsorship, fetchPlatformSettings } from "@/lib/api/platform-client";
import {
  sponsorshipTierLabels,
  type SponsorshipTier,
} from "@/types/platform-admin";
import type { Workshop } from "@/types/workshop";

const tiers: SponsorshipTier[] = ["none", "bronze", "prata", "ouro", "diamante"];

export default function AdminPatrociniosPage() {
  const [message, setMessage] = useState("");
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [tierMap, setTierMap] = useState<Record<string, SponsorshipTier>>({});
  const [version, setVersion] = useState(0);

  const refresh = useCallback(async () => {
    const [data, settings] = await Promise.all([
      fetchAdminWorkshops(),
      fetchPlatformSettings(),
    ]);
    setWorkshops(data.workshops);
    const map: Record<string, SponsorshipTier> = {};
    for (const w of data.workshops) map[w.id] = "none";
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
        description="Somente oficinas cadastradas no sistema — patrocinadas aparecem primeiro na home"
      />

      {message && <p className="dash-alert">{message}</p>}

      {workshops.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma oficina cadastrada ainda.</p>
      ) : (
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
      )}
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
      <select value={tier} onChange={(e) => setTier(e.target.value as SponsorshipTier)} className="input-field w-40">
        {tiers.map((t) => (
          <option key={t} value={t}>{sponsorshipTierLabels[t]}</option>
        ))}
      </select>
      <input type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} className="input-field w-32" placeholder="R$/mês" />
      <ActionButton label="Salvar" variant="primary" onClick={() => onSave(workshopId, tier, value)} />
    </div>
  );
}
