import { enrichWorkshop } from "@/lib/workshop-profile";
import type { ServiceOrder, Workshop } from "@/types/workshop";

type WorkshopSeed = Omit<
  Workshop,
  "whatsapp" | "hasAgenda" | "paymentMethods" | "catalog" | "mechanicRanking"
> &
  Partial<Pick<Workshop, "whatsapp" | "hasAgenda" | "paymentMethods" | "catalog" | "mechanicRanking">>;

const workshopSeeds: WorkshopSeed[] = [
  {
    id: "1",
    name: "Auto Center Silva",
    slug: "auto-center-silva",
    type: "carros",
    description:
      "Oficina especializada em manutenção preventiva e corretiva de veículos leves e utilitários. Mais de 15 anos de experiência no mercado automotivo.",
    address: "Rua das Oficinas, 245",
    city: "São Paulo",
    state: "SP",
    phone: "(11) 3456-7890",
    email: "contato@autocentersilva.com.br",
    rating: 4.8,
    reviewCount: 127,
    services: [
      "Troca de óleo",
      "Alinhamento e balanceamento",
      "Freios",
      "Suspensão",
      "Diagnóstico eletrônico",
    ],
    openingHours: "Seg–Sex 8h–18h | Sáb 8h–13h",
    image: "🚗",
    specialties: ["Veículos nacionais", "Manutenção preventiva"],
    hasAgenda: true,
    catalog: {
      services: [
        { id: "acs-s1", name: "Troca de óleo + filtros", priceFrom: 189, description: "Óleo sintético incluso" },
        { id: "acs-s2", name: "Alinhamento e balanceamento", priceFrom: 129 },
        { id: "acs-s3", name: "Revisão de freios (eixo)", priceFrom: 280 },
        { id: "acs-s4", name: "Diagnóstico eletrônico", priceFrom: 150 },
      ],
      parts: [
        { id: "acs-p1", name: "Filtro de óleo", priceFrom: 32 },
        { id: "acs-p2", name: "Pastilha de freio dianteira", priceFrom: 95 },
        { id: "acs-p3", name: "Vela de ignição (unidade)", priceFrom: 28 },
      ],
    },
  },
  {
    id: "2",
    name: "Moto Tech Pro",
    slug: "moto-tech-pro",
    type: "motos",
    description:
      "Oficina dedicada exclusivamente a motocicletas. Equipe certificada para marcas premium e customizações de performance.",
    address: "Av. dos Motociclistas, 88",
    city: "Curitiba",
    state: "PR",
    phone: "(41) 3344-5566",
    email: "atendimento@mototechpro.com.br",
    rating: 4.9,
    reviewCount: 89,
    services: [
      "Revisão completa",
      "Troca de correia",
      "Suspensão",
      "Escape esportivo",
      "Customização",
    ],
    openingHours: "Seg–Sáb 9h–19h",
    image: "🏍️",
    specialties: ["Motos esportivas", "Customização"],
  },
  {
    id: "3",
    name: "Garage Mix Santos",
    slug: "garage-mix-santos",
    type: "mista",
    description:
      "Atendemos carros e motos com a mesma qualidade. Ideal para famílias com diferentes tipos de veículos em um só lugar.",
    address: "Rua do Porto, 512",
    city: "Santos",
    state: "SP",
    phone: "(13) 3232-1010",
    email: "garagemix@santos.com.br",
    rating: 4.6,
    reviewCount: 203,
    services: [
      "Manutenção geral",
      "Funilaria e pintura",
      "Ar-condicionado",
      "Elétrica automotiva",
      "Revisão de motos",
    ],
    openingHours: "Seg–Sex 7h30–19h | Sáb 8h–14h",
    image: "🔧",
    specialties: ["Carros e motos", "Funilaria"],
  },
  {
    id: "4",
    name: "Premium Auto BH",
    slug: "premium-auto-bh",
    type: "carros",
    description:
      "Oficina premium para veículos importados e nacionais de alta performance. Diagnóstico computadorizado de última geração.",
    address: "Av. Raja Gabaglia, 1200",
    city: "Belo Horizonte",
    state: "MG",
    phone: "(31) 3567-8901",
    email: "premium@autobh.com.br",
    rating: 4.7,
    reviewCount: 64,
    services: [
      "Diagnóstico avançado",
      "Injeção eletrônica",
      "Câmbio automático",
      "Turbo e performance",
      "Detailing",
    ],
    openingHours: "Seg–Sex 8h–18h",
    image: "🏎️",
    specialties: ["Importados", "Alta performance"],
  },
  {
    id: "5",
    name: "Rota Livre Motos",
    slug: "rota-livre-motos",
    type: "motos",
    description:
      "Especialistas em motos urbanas e trail. Atendimento rápido com peças originais e garantia em todos os serviços.",
    address: "Rua Central, 33",
    city: "Recife",
    state: "PE",
    phone: "(81) 3123-4567",
    email: "contato@rotalivre.com.br",
    rating: 4.5,
    reviewCount: 156,
    services: [
      "Revisão 10.000 km",
      "Freios ABS",
      "Pneus",
      "Bateria",
      "Seguro e documentação",
    ],
    openingHours: "Seg–Sáb 8h–18h",
    image: "🛵",
    specialties: ["Motos urbanas", "Trail e off-road"],
  },
  {
    id: "6",
    name: "Oficina do Zé — Mista",
    slug: "oficina-do-ze",
    type: "mista",
    description:
      "Tradição de três gerações. Atendemos desde o Fusca do avô até a moto do neto, sempre com preço justo e honestidade.",
    address: "Estrada Velha, km 5",
    city: "Campinas",
    state: "SP",
    phone: "(19) 3234-5678",
    email: "ze@oficinadoze.com.br",
    rating: 4.9,
    reviewCount: 312,
    services: [
      "Manutenção clássicos",
      "Restauração",
      "Motor e câmbio",
      "Motos antigas",
      "Preparação de motor",
    ],
    openingHours: "Seg–Sex 7h–17h | Sáb 7h–12h",
    image: "⚙️",
    specialties: ["Veículos clássicos", "Restauração"],
  },
  {
    id: "7",
    name: "Shine Detailing Studio",
    slug: "shine-detailing-studio",
    type: "estetica",
    description:
      "Estética automotiva premium: polimento técnico, vitrificação, higienização interna, proteção de pintura e restauração de faróis.",
    address: "Rua das Palmeiras, 890",
    city: "Rio de Janeiro",
    state: "RJ",
    phone: "(21) 3567-1234",
    email: "contato@shinedetailing.com.br",
    rating: 4.9,
    reviewCount: 178,
    services: [
      "Polimento e cristalização",
      "Vitrificação cerâmica",
      "Higienização interna",
      "Restauração de faróis",
      "Proteção de pintura (PPF)",
      "Detailing completo",
    ],
    openingHours: "Seg–Sáb 9h–19h",
    image: "✨",
    specialties: ["Detailing premium", "Proteção cerâmica"],
    hasAgenda: true,
    catalog: {
      services: [
        { id: "sh-s1", name: "Polimento técnico (1 etapa)", priceFrom: 480, description: "Correção leve de micro-riscos" },
        { id: "sh-s2", name: "Vitrificação cerâmica 9H", priceFrom: 1490 },
        { id: "sh-s3", name: "Higienização interna completa", priceFrom: 320 },
        { id: "sh-s4", name: "Restauração de faróis", priceFrom: 180 },
        { id: "sh-s5", name: "Detailing completo", priceFrom: 890 },
      ],
      parts: [
        { id: "sh-p1", name: "Kit cera premium", priceFrom: 89 },
        { id: "sh-p2", name: "Coating cerâmico (500ml)", priceFrom: 420 },
      ],
    },
    mechanicRanking: [
      { name: "Rafael Costa", rating: 4.95, servicesCompleted: 210, specialty: "Polimento e PPF" },
      { name: "Bruno Mendes", rating: 4.8, servicesCompleted: 165, specialty: "Higienização" },
    ],
  },
];

export const workshops: Workshop[] = workshopSeeds.map(enrichWorkshop);

export const demoOrders: ServiceOrder[] = [
  {
    id: "OS-001",
    clientName: "Carlos Mendes",
    vehicle: "Honda Civic 2020",
    service: "Troca de óleo + filtros",
    status: "concluido",
    date: "2026-06-15",
    value: 280,
  },
  {
    id: "OS-002",
    clientName: "Ana Paula R.",
    vehicle: "Toyota Corolla 2019",
    service: "Alinhamento e balanceamento",
    status: "em_andamento",
    date: "2026-06-15",
    value: 150,
  },
  {
    id: "OS-003",
    clientName: "Roberto Lima",
    vehicle: "VW Gol 2018",
    service: "Revisão dos freios",
    status: "pendente",
    date: "2026-06-15",
    value: 420,
  },
  {
    id: "OS-004",
    clientName: "Fernanda Costa",
    vehicle: "Hyundai HB20 2021",
    service: "Diagnóstico eletrônico",
    status: "pendente",
    date: "2026-06-14",
    value: 180,
  },
  {
    id: "OS-005",
    clientName: "João Pedro S.",
    vehicle: "Fiat Argo 2022",
    service: "Ar-condicionado",
    status: "concluido",
    date: "2026-06-14",
    value: 350,
  },
];

export function getWorkshopById(id: string): Workshop | undefined {
  return workshops.find((w) => w.id === id);
}

export function getWorkshopBySlug(slug: string): Workshop | undefined {
  return workshops.find((w) => w.slug === slug);
}
