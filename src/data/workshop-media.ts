import type { WorkshopGalleryItem, WorkshopType } from "@/types/workshop";

const coversByType: Record<WorkshopType, string> = {
  carros: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
  motos: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80",
  mista: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80",
  estetica: "https://images.unsplash.com/photo-1601362840469-51e4d8d229cc?w=800&q=80",
};

const customCovers: Record<string, string> = {
  "1": "https://images.unsplash.com/photo-1487754180451-c456719719a9?w=1200&q=80",
  "7": "https://images.unsplash.com/photo-1607860108858-6817733040ca?w=1200&q=80",
};

const customTaglines: Record<string, string> = {
  "1": "Manutenção honesta há mais de 15 anos em São Paulo",
  "7": "Estética automotiva premium — brilho que impressiona",
};

const galleries: Record<string, WorkshopGalleryItem[]> = {
  "1": [
    {
      id: "g1-1",
      url: "https://images.unsplash.com/photo-1487754180451-c456719719a9?w=600&q=80",
      caption: "Recepção e boxes de atendimento",
      kind: "ambiente",
    },
    {
      id: "g1-2",
      url: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=600&q=80",
      caption: "Equipe em revisão de motor",
      kind: "equipe",
    },
    {
      id: "g1-3",
      url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80",
      caption: "Diagnóstico computadorizado",
      kind: "ambiente",
    },
  ],
  "7": [
    {
      id: "g7-1",
      url: "https://images.unsplash.com/photo-1607860108858-6817733040ca?w=600&q=80",
      caption: "Studio de detailing",
      kind: "ambiente",
    },
    {
      id: "g7-2",
      url: "https://images.unsplash.com/photo-1601362840469-51e4d8d229cc?w=600&q=80",
      caption: "Antes — pintura opaca",
      kind: "antes",
    },
    {
      id: "g7-3",
      url: "https://images.unsplash.com/photo-1619642751034-765df43d7749?w=600&q=80",
      caption: "Depois — polimento espelhado",
      kind: "depois",
    },
  ],
};

export function getWorkshopCoverImage(workshopId: string, type: WorkshopType): string {
  return customCovers[workshopId] ?? coversByType[type];
}

export function getWorkshopTagline(workshopId: string, description: string): string | undefined {
  return customTaglines[workshopId];
}

export function getWorkshopGallery(workshopId: string, type: WorkshopType): WorkshopGalleryItem[] {
  if (galleries[workshopId]) return galleries[workshopId];
  return [
    {
      id: `${workshopId}-g1`,
      url: getWorkshopCoverImage(workshopId, type),
      caption: "Ambiente da oficina",
      kind: "ambiente",
    },
  ];
}
