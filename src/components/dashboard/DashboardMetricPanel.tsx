"use client";

import { useCallback, useEffect, useState } from "react";
import type { IconName } from "@/components/ui/Icon";
import { Icon } from "@/components/ui/Icon";
import type { DashboardPeriod, DashboardStats } from "@/types/document-line";

type MetricMode = "count" | "currency";

interface DashboardMetricPanelProps {
  title: string;
  subtitle: string;
  icon: IconName;
  mode: MetricMode;
  valueKey: "clientsServed" | "revenue";
  previousKey: "previousClientsServed" | "previousRevenue";
  breakdownKey: "value" | "amount";
}

const periodLabels: Record<DashboardPeriod, string> = {
  day: "Hoje",
  week: "Semana",
  month: "Mês",
  custom: "Período",
};

function formatValue(mode: MetricMode, n: number) {
  if (mode === "currency") {
    return `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return String(n);
}

function trendLabel(current: number, previous: number | undefined) {
  if (previous === undefined || previous === 0) return null;
  const diff = ((current - previous) / previous) * 100;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${diff.toFixed(0)}% vs período anterior`;
}

export function DashboardMetricPanel({
  title,
  subtitle,
  icon,
  mode,
  valueKey,
  previousKey,
  breakdownKey,
}: DashboardMetricPanelProps) {
  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (period === "custom" && from && to) {
        params.set("from", from);
        params.set("to", to);
      }
      const res = await fetch(`/api/dashboard/stats?${params}`);
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
    }
  }, [period, from, to]);

  useEffect(() => {
    if (period === "custom" && (!from || !to)) return;
    void load();
  }, [load, period, from, to]);

  const mainValue = stats ? stats[valueKey] : 0;
  const previous = stats ? stats[previousKey] : undefined;
  const trend = stats ? trendLabel(mainValue, previous) : null;
  const trendUp = previous !== undefined && mainValue >= previous;

  const maxBreakdown = Math.max(...(stats?.breakdown.map((b) => b[breakdownKey] ?? 0) ?? [1]), 1);

  return (
    <section className="dash-metric-panel">
      <div className="dash-metric-panel__head">
        <div className="flex items-start gap-3">
          <div className="dash-icon-box">
            <Icon name={icon} className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted">{subtitle}</p>
          </div>
        </div>
        <div className="dash-metric-tabs">
          {(["day", "week", "month", "custom"] as DashboardPeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              className={period === p ? "dash-metric-tab dash-metric-tab--active" : "dash-metric-tab"}
              onClick={() => setPeriod(p)}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {period === "custom" && (
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="input-field text-sm"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="input-field text-sm"
          />
        </div>
      )}

      <div className="dash-metric-panel__value-row">
        <p className="dash-metric-panel__value">
          {loading ? "—" : formatValue(mode, mainValue)}
        </p>
        {trend && (
          <span className={trendUp ? "dash-metric-trend dash-metric-trend--up" : "dash-metric-trend"}>
            {trend}
          </span>
        )}
      </div>

      {stats && stats.breakdown.length > 0 && (
        <div className="dash-metric-breakdown">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Consolidado</p>
          <div className="space-y-2">
            {stats.breakdown.map((point) => {
              const val = point[breakdownKey] ?? 0;
              const pct = maxBreakdown > 0 ? (val / maxBreakdown) * 100 : 0;
              return (
                <div key={point.label} className="dash-metric-bar-row">
                  <span className="dash-metric-bar-label">{point.label}</span>
                  <div className="dash-metric-bar-track">
                    <div className="dash-metric-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="dash-metric-bar-value">
                    {mode === "currency" ? formatValue("currency", val) : val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
