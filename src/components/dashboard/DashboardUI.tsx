export { PageHeader } from "@/components/ui/SectionHeader";

import { ActionButton } from "@/components/ui/Button";

export { ActionButton };

export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="dash-table-head border-b border-border text-left">
              {headers.map((h) => (
                <th key={h} className="px-4 py-2.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-surface-hover/80">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2.5 text-foreground/90">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TabPanel({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-0 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-[var(--dash-sidebar-active-border)] text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.find((t) => t.id === activeTab)?.content}
    </div>
  );
}

export function FeatureList({
  allowed,
  restricted,
}: {
  allowed: string[];
  restricted?: string[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Permissões do perfil
        </h3>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {allowed.map((item) => (
            <li key={item} className="flex items-start gap-2 border-b border-border/60 py-1.5 last:border-0">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-border-strong" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      {restricted && restricted.length > 0 && (
        <div className="card p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Restrições
          </h3>
          <ul className="space-y-1.5 text-sm text-muted">
            {restricted.map((item) => (
              <li key={item} className="flex items-start gap-2 border-b border-border/60 py-1.5 last:border-0">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-border" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
