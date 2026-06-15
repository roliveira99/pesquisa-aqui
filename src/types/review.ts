export type StarRating = 1 | 2 | 3 | 4 | 5;

export interface WorkshopReview {
  id: string;
  workshopId: string;
  cpf: string;
  clientName: string;
  stars: StarRating;
  comment: string;
  serviceLabel: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompletedServiceRecord {
  orderId: string;
  service: string;
  date: string;
  vehicle?: string;
}

export interface VerifiedClient {
  cpf: string;
  name: string;
  completedServices: CompletedServiceRecord[];
}

export interface ReviewStats {
  average: number;
  count: number;
}
