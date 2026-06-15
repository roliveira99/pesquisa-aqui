export interface DocumentIssuer {
  id: string;
  workshopId: string;
  /** Rótulo interno — ex.: "Matriz", "Estética CNPJ 2" */
  label: string;
  tradeName: string;
  legalName: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email?: string;
  isDefault: boolean;
}

export interface QuoteLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface QuoteTemplateSettings {
  workshopId: string;
  documentTitle: string;
  headerNote: string;
  footerNote: string;
  validityDays: number;
  paymentTerms: string;
}

export interface CustomerQuotePayload {
  orderId: string;
  issuerId: string;
  clientName: string;
  clientPhone: string;
  clientCpf?: string;
  vehicle?: string;
  vehiclePlate?: string;
  items: QuoteLineItem[];
  issuedAt: string;
}

export function formatCnpj(cnpj: string): string {
  const d = cnpj.replace(/\D/g, "").slice(0, 14);
  if (d.length !== 14) return cnpj;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function formatCnpjInput(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return formatCnpj(d);
}

export function lineItemTotal(item: QuoteLineItem): number {
  return item.quantity * item.unitPrice;
}

export function quoteTotal(items: QuoteLineItem[]): number {
  return items.reduce((sum, i) => sum + lineItemTotal(i), 0);
}

export function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
