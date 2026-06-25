import { NextResponse } from "next/server";
import { getWorkshopMedia, updateWorkshopMedia } from "@/lib/db/workshop-media";
import { getRequestUser, userHasPermission } from "@/lib/db/request-auth";
import type { WorkshopGalleryItem } from "@/types/workshop";

export async function GET() {
  const user = await getRequestUser();
  if (!user?.workshopId || !userHasPermission(user, "owner.perfil")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const media = await getWorkshopMedia(user.workshopId);
  return NextResponse.json(media);
}

export async function PUT(request: Request) {
  const user = await getRequestUser();
  if (!user?.workshopId || !userHasPermission(user, "owner.perfil")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = (await request.json()) as {
    coverImage?: string;
    tagline?: string;
    slogan?: string;
    gallery?: WorkshopGalleryItem[];
    profileVideos?: string[];
    profileHighlights?: { title: string; body: string }[];
    businessOpportunities?: { title: string; body: string }[];
  };

  await updateWorkshopMedia(user.workshopId, body);
  const media = await getWorkshopMedia(user.workshopId);
  return NextResponse.json(media);
}
