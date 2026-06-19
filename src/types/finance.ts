export interface FinanceInstallment {
  number: number;
  amount: number;
  dueAt: string;
  paid: boolean;
  paidAt?: string | null;
  anticipated?: boolean;
  anticipatedAt?: string | null;
}

export interface FinancialEntryRecord {
  id: string;
  kind: "receber" | "pagar";
  name: string;
  amount: number;
  dueAt: string | null;
  paid: boolean;
  paidAt: string | null;
  serviceNoteId: string | null;
  installments?: FinanceInstallment[] | null;
  isRecurring?: boolean;
  recurringActive?: boolean;
  reminderDayBefore?: boolean;
  reminderSameDay?: boolean;
}
