import Link from "next/link";
import {
  articleHref,
  formatArticleDate,
  formatArticleDateShort,
  formatCategoryLabel,
} from "@/lib/article-slug";
import { articleHasCustomImage } from "@/lib/article-media";
import type { SiteArticleRecord } from "@/lib/db/articles";
import { ArticleImage } from "@/components/news/ArticleImage";
import { NewspaperBackLink } from "@/components/news/NewspaperMasthead";

function ArticleParagraphs({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/).filter(Boolean);
  return (
    <div className="newspaper-body space-y-5">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-base leading-[1.85] text-foreground sm:text-lg">
          {p}
        </p>
      ))}
    </div>
  );
}

export function NewspaperArticlePage({
  article,
  related,
}: {
  article: SiteArticleRecord;
  related: SiteArticleRecord[];
}) {
  const hasCustomPhoto = articleHasCustomImage(article);

  return (
    <article>
      <div className="mx-auto max-w-3xl">
        <NewspaperBackLink category={article.category} />

        <header className="border-b border-border pb-6 sm:pb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider text-muted">
            <span className="rounded-sm bg-accent-soft px-2 py-0.5 font-semibold text-accent">
              {formatCategoryLabel(article.category)}
            </span>
            {article.city && <span>{article.city}</span>}
            <time dateTime={article.createdAt}>{formatArticleDate(article.createdAt)}</time>
          </div>
          <h1 className="newspaper-headline text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            {article.title}
          </h1>
          <p className="newspaper-deck mt-4 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {article.summary}
          </p>
        </header>
      </div>

      <figure className="relative my-8 overflow-hidden border-y border-border bg-surface sm:rounded-sm sm:border sm:shadow-md">
        <ArticleImage
          article={article}
          priority
          className="aspect-[16/9] w-full object-cover"
          sizes="100vw"
        />
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-4 pb-4 pt-16 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            {formatCategoryLabel(article.category)}
            {article.city ? ` · ${article.city}` : ""}
          </p>
          {!hasCustomPhoto && (
            <p className="mt-1 text-[11px] text-white/65">Ilustração editorial</p>
          )}
        </figcaption>
      </figure>

      <div className="mx-auto max-w-3xl py-2 sm:py-4">
        <ArticleParagraphs content={article.content} />
      </div>

      {related.length > 0 && (
        <aside className="mx-auto mt-10 max-w-3xl border-t-2 border-foreground pt-8">
          <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-muted">
            Leia também
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={articleHref(r)} className="group flex gap-3 overflow-hidden rounded-sm border border-border bg-surface p-3 transition hover:shadow-md">
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-sm">
                    <ArticleImage
                      article={r}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      sizes="112px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                      {formatCategoryLabel(r.category)}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm font-semibold leading-snug text-foreground group-hover:text-accent">
                      {r.title}
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      {formatArticleDateShort(r.createdAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
}
