import type { Workshop, WorkshopCatalog } from "@/types/workshop";
import {
  getWorkshopCoverImage,
  getWorkshopGallery,
  getWorkshopTagline,
} from "@/data/workshop-media";

export const PRICE_DISCLAIMER =
  "Valores de referência sujeitos a alteração conforme veículo, disponibilidade de peças e condições de pagamento. Orçamento final após avaliação presencial.";

const defaultCatalog = (type: Workshop["type"]): WorkshopCatalog => {
  if (type === "estetica") {
    return {
      services: [
        { id: "es1", name: "Polimento técnico", priceFrom: 450, description: "Correção leve de pintura" },
        { id: "es2", name: "Vitrificação cerâmica", priceFrom: 1200 },
        { id: "es3", name: "Higienização interna completa", priceFrom: 280 },
      ],
      parts: [
        { id: "ep1", name: "Kit cera premium", priceFrom: 89 },
        { id: "ep2", name: "Restaurador de plásticos", priceFrom: 45 },
      ],
    };
  }
  return {
    services: [
      { id: "sv1", name: "Troca de óleo + filtros", priceFrom: 180 },
      { id: "sv2", name: "Alinhamento e balanceamento", priceFrom: 120 },
      { id: "sv3", name: "Revisão de freios", priceFrom: 250 },
    ],
    parts: [
      { id: "pt1", name: "Filtro de óleo", priceFrom: 35 },
      { id: "pt2", name: "Pastilha de freio (eixo)", priceFrom: 89 },
    ],
  };
};

const defaultRanking = [
  { name: "Pedro Oliveira", rating: 4.9, servicesCompleted: 186, specialty: "Motor e injeção" },
  { name: "Lucas Ferreira", rating: 4.7, servicesCompleted: 142, specialty: "Suspensão e freios" },
  { name: "Marcos Alves", rating: 4.6, servicesCompleted: 98, specialty: "Elétrica" },
];

export function enrichWorkshop<T extends Partial<Workshop> & Pick<Workshop, "id" | "phone" | "type" | "description">>(
  w: T
): Workshop {
  const whatsapp = w.whatsapp ?? w.phone;
  return {
    ...w,
    vertical: w.vertical ?? "automotive",
    category: w.category ?? null,
    whatsapp,
    tagline: w.tagline ?? getWorkshopTagline(w.id, w.description),
    coverImage: w.coverImage ?? getWorkshopCoverImage(w.id, w.type),
    gallery: w.gallery ?? getWorkshopGallery(w.id, w.type),
    hasAgenda: w.hasAgenda ?? true,
    paymentMethods: w.paymentMethods ?? ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"],
    catalog: w.catalog ?? defaultCatalog(w.type),
    mechanicRanking: w.mechanicRanking ?? (w.type !== "estetica" ? defaultRanking : undefined),
  } as Workshop;
}
