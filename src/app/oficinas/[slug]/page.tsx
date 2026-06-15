import { notFound } from "next/navigation";
import { WorkshopProfileSite } from "@/components/workshop/WorkshopProfileSite";
import { getSponsorshipTier } from "@/lib/db/platform";
import { getWorkshopBySlug, listWorkshopSlugs } from "@/lib/db/workshops";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await listWorkshopSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const workshop = await getWorkshopBySlug(slug);
  if (!workshop) return { title: "Oficina não encontrada" };
  return {
    title: `${workshop.name} — ${workshop.city}/${workshop.state}`,
    description: `${workshop.description} Avaliações, catálogo e contato.`,
  };
}

export default async function OficinaProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const workshop = await getWorkshopBySlug(slug);
  if (!workshop) notFound();

  const sponsorshipTier = await getSponsorshipTier(workshop.id);

  return <WorkshopProfileSite workshop={workshop} sponsorshipTier={sponsorshipTier} />;
}
