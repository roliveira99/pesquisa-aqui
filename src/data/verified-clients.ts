import type { VerifiedClient, WorkshopReview } from "@/types/review";

/** Clientes com serviço concluído — base para validar quem pode avaliar (demo). */
export const verifiedClientsByWorkshop: Record<string, VerifiedClient[]> = {
  "1": [
    {
      cpf: "11144477735",
      name: "Carlos Mendes",
      completedServices: [
        { orderId: "OS-001", service: "Troca de óleo + filtros", date: "2026-05-10", vehicle: "Honda Civic 2020" },
        { orderId: "OS-010", service: "Alinhamento e balanceamento", date: "2026-06-01", vehicle: "Honda Civic 2020" },
      ],
    },
    {
      cpf: "39053344705",
      name: "Ana Paula Ribeiro",
      completedServices: [
        { orderId: "OS-002", service: "Alinhamento e balanceamento", date: "2026-06-08", vehicle: "Toyota Corolla 2019" },
      ],
    },
    {
      cpf: "52998224725",
      name: "Roberto Lima",
      completedServices: [
        { orderId: "OS-003", service: "Revisão dos freios", date: "2026-06-12", vehicle: "VW Gol 2018" },
      ],
    },
  ],
  "7": [
    {
      cpf: "52998224725",
      name: "Fernanda Costa",
      completedServices: [
        { orderId: "SD-101", service: "Polimento técnico", date: "2026-05-20", vehicle: "BMW 320i 2021" },
      ],
    },
    {
      cpf: "86853251089",
      name: "João Pedro Silva",
      completedServices: [
        { orderId: "SD-102", service: "Vitrificação cerâmica", date: "2026-06-05", vehicle: "Mercedes C180 2020" },
      ],
    },
  ],
};

export const seedReviews: WorkshopReview[] = [
  {
    id: "rev-seed-1",
    workshopId: "1",
    cpf: "39053344705",
    clientName: "Mariana Alves",
    stars: 5,
    comment: "Atendimento impecável, explicaram tudo antes de começar. Recomendo demais!",
    serviceLabel: "Diagnóstico eletrônico",
    createdAt: "2026-05-15T10:00:00.000Z",
    updatedAt: "2026-05-15T10:00:00.000Z",
  },
  {
    id: "rev-seed-2",
    workshopId: "1",
    cpf: "70656789012",
    clientName: "Paulo Henrique",
    stars: 4,
    comment: "Bom serviço e preço justo. Só demorou um pouco mais que o previsto.",
    serviceLabel: "Revisão de freios",
    createdAt: "2026-06-01T14:30:00.000Z",
    updatedAt: "2026-06-01T14:30:00.000Z",
  },
  {
    id: "rev-seed-3",
    workshopId: "1",
    cpf: "86853251089",
    clientName: "Juliana Martins",
    stars: 5,
    comment: "Confio na oficina há anos. Sempre transparentes no orçamento.",
    serviceLabel: "Troca de óleo + filtros",
    createdAt: "2026-06-10T09:15:00.000Z",
    updatedAt: "2026-06-10T09:15:00.000Z",
  },
  {
    id: "rev-seed-4",
    workshopId: "7",
    cpf: "15350946056",
    clientName: "Lucas Ferreira",
    stars: 5,
    comment: "Carro saiu como novo. O polimento ficou espelhado!",
    serviceLabel: "Detailing completo",
    createdAt: "2026-06-02T16:00:00.000Z",
    updatedAt: "2026-06-02T16:00:00.000Z",
  },
];
