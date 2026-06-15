import { seedReviews, verifiedClientsByWorkshop } from "@/data/verified-clients";
import { normalizeCpf } from "@/lib/cpf";
import { isDatabaseReachable, prisma } from "@/lib/db/prisma";
import type { CompletedServiceRecord, ReviewStats, StarRating, VerifiedClient, WorkshopReview } from "@/types/review";

function mapReview(row: {
  id: string;
  workshopId: string;
  cpf: string;
  clientName: string;
  stars: number;
  comment: string;
  serviceLabel: string;
  createdAt: Date;
  updatedAt: Date;
}): WorkshopReview {
  return {
    id: row.id,
    workshopId: row.workshopId,
    cpf: row.cpf,
    clientName: row.clientName,
    stars: row.stars as StarRating,
    comment: row.comment,
    serviceLabel: row.serviceLabel,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function getVerifiedClientFromDb(
  workshopId: string,
  cpf: string
): Promise<VerifiedClient | null> {
  const client = await prisma.crmClient.findUnique({
    where: { workshopId_cpf: { workshopId, cpf } },
  });
  if (!client) return null;
  return {
    cpf: client.cpf,
    name: client.name,
    completedServices: client.completedServices as unknown as CompletedServiceRecord[],
  };
}

function getVerifiedClientStatic(workshopId: string, cpf: string): VerifiedClient | null {
  return verifiedClientsByWorkshop[workshopId]?.find((c) => c.cpf === cpf) ?? null;
}

export async function getVerifiedClient(
  workshopId: string,
  cpf: string
): Promise<VerifiedClient | null> {
  const normalized = normalizeCpf(cpf);
  if (await isDatabaseReachable()) {
    return getVerifiedClientFromDb(workshopId, normalized);
  }
  return getVerifiedClientStatic(workshopId, normalized);
}

export async function getReviewsForWorkshop(workshopId: string): Promise<WorkshopReview[]> {
  if (!(await isDatabaseReachable())) {
    return seedReviews
      .filter((r) => r.workshopId === workshopId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  const rows = await prisma.review.findMany({
    where: { workshopId, removed: false },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapReview);
}

export async function getAllReviewsForAdmin(): Promise<(WorkshopReview & { removed: boolean })[]> {
  if (!(await isDatabaseReachable())) {
    return seedReviews.map((r) => ({ ...r, removed: false }));
  }

  const rows = await prisma.review.findMany({ orderBy: { updatedAt: "desc" } });
  return rows.map((row) => ({ ...mapReview(row), removed: row.removed }));
}

export async function getReviewStats(
  workshopId: string,
  fallbackAverage = 0,
  fallbackCount = 0
): Promise<ReviewStats> {
  const reviews = await getReviewsForWorkshop(workshopId);
  if (reviews.length === 0) {
    return { average: fallbackAverage, count: fallbackCount };
  }
  const sum = reviews.reduce((acc, r) => acc + r.stars, 0);
  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}

export async function getReviewByCpf(
  workshopId: string,
  cpf: string
): Promise<WorkshopReview | null> {
  const normalized = normalizeCpf(cpf);
  if (!(await isDatabaseReachable())) {
    return (
      seedReviews.find((r) => r.workshopId === workshopId && r.cpf === normalized) ?? null
    );
  }

  const row = await prisma.review.findUnique({
    where: { workshopId_cpf: { workshopId, cpf: normalized } },
  });
  if (!row || row.removed) return null;
  return mapReview(row);
}

export async function upsertReview(input: {
  workshopId: string;
  cpf: string;
  stars: StarRating;
  comment: string;
}): Promise<{ ok: true; review: WorkshopReview } | { ok: false; error: string }> {
  const normalized = normalizeCpf(input.cpf);
  const client = await getVerifiedClient(input.workshopId, normalized);

  if (!client || client.completedServices.length === 0) {
    return {
      ok: false,
      error:
        "Só é possível avaliar após um serviço concluído neste estabelecimento. Informe o CPF usado no cadastro da oficina.",
    };
  }

  const latestService = [...client.completedServices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  if (!(await isDatabaseReachable())) {
    return {
      ok: false,
      error: "Banco de dados indisponível. Configure PostgreSQL para salvar avaliações.",
    };
  }

  const now = new Date();
  const row = await prisma.review.upsert({
    where: { workshopId_cpf: { workshopId: input.workshopId, cpf: normalized } },
    create: {
      id: `rev-${Date.now()}`,
      workshopId: input.workshopId,
      cpf: normalized,
      clientName: client.name,
      stars: input.stars,
      comment: input.comment.trim(),
      serviceLabel: latestService.service,
      removed: false,
      createdAt: now,
      updatedAt: now,
    },
    update: {
      stars: input.stars,
      comment: input.comment.trim(),
      serviceLabel: latestService.service,
      removed: false,
      updatedAt: now,
    },
  });

  return { ok: true, review: mapReview(row) };
}

export async function setReviewRemoved(reviewId: string, removed: boolean): Promise<void> {
  if (!(await isDatabaseReachable())) return;
  await prisma.review.updateMany({ where: { id: reviewId }, data: { removed } });
}
