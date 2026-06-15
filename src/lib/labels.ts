export const workshopTypeLabels: Record<import("@/types/workshop").WorkshopType, string> = {
  carros: "Carros",
  motos: "Motos",
  mista: "Carros e Motos",
  estetica: "Estética automotiva",
};

export const workshopTypeColors: Record<import("@/types/workshop").WorkshopType, string> = {
  carros:
    "bg-blue-50 text-blue-700 border-blue-200 [data-theme=dark]:bg-blue-950/40 [data-theme=dark]:text-blue-300 [data-theme=dark]:border-blue-800",
  motos:
    "bg-amber-50 text-amber-800 border-amber-200 [data-theme=dark]:bg-amber-950/40 [data-theme=dark]:text-amber-300 [data-theme=dark]:border-amber-800",
  mista:
    "bg-emerald-50 text-emerald-800 border-emerald-200 [data-theme=dark]:bg-emerald-950/40 [data-theme=dark]:text-emerald-300 [data-theme=dark]:border-emerald-800",
  estetica:
    "bg-violet-50 text-violet-800 border-violet-200 [data-theme=dark]:bg-violet-950/40 [data-theme=dark]:text-violet-300 [data-theme=dark]:border-violet-800",
};

export const orderStatusLabels = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
} as const;

export const orderStatusColors = {
  pendente: "bg-warning-soft text-warning",
  em_andamento: "bg-accent-soft text-accent",
  concluido: "bg-success-soft text-success",
  cancelado: "bg-danger-soft text-danger",
} as const;
