export function phoneToWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phoneToWhatsApp(phone)}?text=${encoded}`;
}
