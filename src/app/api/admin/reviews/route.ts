import { NextResponse } from "next/server";
import { getAllReviewsForAdmin } from "@/lib/db/reviews";
import { requirePermission } from "@/lib/db/request-auth";

export async function GET() {
  try {
    await requirePermission("admin.moderar_avaliacoes");
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const reviews = await getAllReviewsForAdmin();
  return NextResponse.json({ reviews });
}
