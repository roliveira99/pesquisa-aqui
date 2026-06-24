import Image from "next/image";
import { getArticleImageUrl } from "@/lib/article-media";
import type { SiteArticleRecord } from "@/lib/db/articles";

interface ArticleImageProps {
  article: Pick<SiteArticleRecord, "title" | "category" | "imageUrl">;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function ArticleImage({
  article,
  className,
  priority,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px",
}: ArticleImageProps) {
  return (
    <Image
      src={getArticleImageUrl(article)}
      alt={article.title}
      width={1200}
      height={675}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
