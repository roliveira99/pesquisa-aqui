import { NextResponse } from "next/server";
import {
  getAllReviewsForAdmin,
  getReviewByCpf,
  getReviewsForWorkshop,
  getReviewStats,
  getVerifiedClient,
  upsertReview,
} from "@/lib/db/reviews";
import { getWorkshopBySlug } from "@/lib/db/workshops";
import { requirePermission } from "@/lib/db/request-auth";
import type { StarRating } from "@/types/review";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const workshop = await getWorkshopBySlug(slug);
  if (!workshop) {
    return NextResponse.json({ error: "Oficina não encontrada." }, { status: 404 });
  }

  const reviews = await getReviewsForWorkshop(workshop.id);
  const stats = await getReviewStats(workshop.id, workshop.rating, workshop.reviewCount);

  return NextResponse.json({ reviews, stats, workshopId: workshop.id });
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const workshop = await getWorkshopBySlug(slug);
  if (!workshop) {
    return NextResponse.json({ error: "Oficina não encontrada." }, { status: 404 });
  }

  const body = (await request.json()) as {
    cpf?: string;
    stars?: number;
    comment?: string;
    action?: "verify";
  };

  if (body.action === "verify") {
    if (!body.cpf) {
      return NextResponse.json({ error: "CPF obrigatório." }, { status: 400 });
    }
    const client = await getVerifiedClient(workshop.id, body.cpf);
    const existing = client ? await getReviewByCpf(workshop.id, body.cpf) : null;
    return NextResponse.json({ client, existingReview: existing });
  }

  if (!body.cpf || !body.stars || body.stars < 1 || body.stars > 5) {
    return NextResponse.json({ error: "CPF e nota (1–5) são obrigatórios." }, { status: 400 });
  }

  const result = await upsertReview({
    workshopId: workshop.id,
    cpf: body.cpf,
    stars: body.stars as StarRating,
    comment: body.comment ?? "",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  const stats = await getReviewStats(workshop.id, workshop.rating, workshop.reviewCount);
  return NextResponse.json({ review: result.review, stats });
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requirePermission("admin.moderar_avaliacoes");
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = (await request.json()) as {
    action?: "remove" | "restore" | "list";
    reviewId?: string;
    cpf?: string;
  };

  if (body.action === "list") {
    const reviews = await getAllReviewsForAdmin();
    return NextResponse.json({ reviews });
  }

  const { slug } = await context.params;
  const workshop = await getWorkshopBySlug(slug);

  if (body.cpf && workshop) {
    const review = await getReviewByCpf(workshop.id, body.cpf);
    return NextResponse.json({ review });
  }

  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}
