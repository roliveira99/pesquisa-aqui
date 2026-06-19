import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { listClassifieds } from "@/lib/db/classifieds";

export default async function ClassificadosPage() {
  const ads = await listClassifieds({ activeOnly: true });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Classificados"
        title="Vendas e divulgações"
        description="Anúncios de oficinas parceiras e oportunidades da comunidade automotiva"
      />

      {ads.length === 0 ? (
        <p className="text-muted">Nenhum classificado publicado ainda.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ads.map((ad) => (
            <article key={ad.id} className="card flex flex-col overflow-hidden transition hover:shadow-lg">
              <div className="border-b border-border bg-surface-hover/50 px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent">{ad.category}</span>
                {ad.workshopName && (
                  <p className="text-xs text-muted">{ad.workshopName}</p>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-semibold text-foreground">{ad.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-4">{ad.body}</p>
                {ad.price != null && (
                  <p className="mt-3 text-lg font-semibold text-foreground">R$ {ad.price.toLocaleString("pt-BR")}</p>
                )}
                {ad.contact && (
                  <a
                    href={`https://wa.me/${ad.contact.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex text-sm font-medium text-accent hover:underline"
                  >
                    Entrar em contato
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="mt-10 text-center text-sm text-muted">
        É dono de oficina?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Publique seus classificados no painel
        </Link>
      </p>
    </div>
  );
}
