import type { Curiosity } from "@/data/curiosities";

interface CuriosityCardProps {
  curiosity: Curiosity;
  expanded?: boolean;
}

export function CuriosityCard({ curiosity, expanded = false }: CuriosityCardProps) {
  return (
    <article className="card flex h-full flex-col p-6">
      <span className="mb-3 inline-flex w-fit rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
        {curiosity.category}
      </span>
      <h3 className="text-lg font-semibold leading-snug text-foreground">
        {curiosity.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
        {curiosity.summary}
      </p>
      {expanded && (
        <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
          {curiosity.content}
        </p>
      )}
    </article>
  );
}
