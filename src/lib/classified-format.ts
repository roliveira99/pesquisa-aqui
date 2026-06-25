/** Formatação de preços e parcelas no estilo vitrine marketplace. */
export function formatClassifiedPrice(price: number): { whole: string; cents: string } {
  const formatted = price.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [whole, cents = "00"] = formatted.split(",");
  return { whole: `R$ ${whole}`, cents };
}

export function formatClassifiedInstallments(price: number, count = 10): string {
  const installment = price / count;
  const formatted = installment.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${count}x R$ ${formatted} sem juros`;
}

export function formatClassifiedInstallmentValue(price: number, count = 10): string {
  const installment = price / count;
  return installment.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function isRecentClassified(iso: string, days = 7): boolean {
  const created = new Date(iso).getTime();
  return Date.now() - created < days * 86_400_000;
}
