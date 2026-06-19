export interface FinancialEntryRecord {
  id: string;
  kind: "receber" | "pagar";
  name: string;
  amount: number;
  dueAt: string | null;
  paid: boolean;
  paidAt: string | null;
  serviceNoteId: string | null;
}
