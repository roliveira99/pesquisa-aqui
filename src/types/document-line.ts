export interface CatalogItemRecord {
  id: string;
  workshopId: string;
  kind: "servico" | "peca";
  name: string;
  description?: string;
  unitPrice: number;
  publicVisible: boolean;
  active: boolean;
  stockQuantity?: number;
}

export interface DocumentLineItem {
  id: string;
  catalogItemId?: string;
  name: string;
  kind: "servico" | "peca";
  quantity: number;
  unitPrice: number;
  total: number;
}

export type DashboardPeriod = "day" | "week" | "month" | "custom";

export interface DashboardBreakdownPoint {
  label: string;
  value: number;
  amount?: number;
}

export interface DashboardStats {
  period: DashboardPeriod;
  from: string;
  to: string;
  clientsServed: number;
  revenue: number;
  ordersCompleted: number;
  breakdown: DashboardBreakdownPoint[];
  previousClientsServed?: number;
  previousRevenue?: number;
}
