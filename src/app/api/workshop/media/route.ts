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

  const tooLarge = [
    body.coverImage,
    ...(body.gallery?.map((g) => g.url) ?? []),
  ].some((url) => typeof url === "string" && url.length > 2_500_000);

  if (tooLarge) {
    return NextResponse.json(
      { error: "Uma ou mais imagens são muito grandes. Tente fotos menores." },
      { status: 413 }
    );
  }

  await updateWorkshopMedia(user.workshopId, body);
  const media = await getWorkshopMedia(user.workshopId);
  return NextResponse.json(media);
}
