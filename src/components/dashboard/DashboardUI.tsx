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
            <tr className="border-b border-border bg-surface-hover/80 text-left">
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-surface-hover/50">
                {row.map((cell, j) => (
                  <td key={j} className="px-5 py-3.5 text-muted-foreground">
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
      <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-accent text-accent"
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
      <div className="card p-5">
        <h3 className="mb-3 text-sm font-semibold text-success">Permissões do perfil</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {allowed.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      {restricted && restricted.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Restrições</h3>
          <ul className="space-y-2 text-sm text-muted">
            {restricted.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border-strong" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
