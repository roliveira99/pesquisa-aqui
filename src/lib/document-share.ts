export function buildBudgetShareText(input: {
  workshopName: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  lineItems: { name: string; quantity: number; unitPrice: number; total: number }[];
  total: number;
  id: string;
}): string {
  const lines = input.lineItems.map(
    (l) => `• ${l.name} (${l.quantity}x) — R$ ${l.total.toFixed(2)}`
  );
  return [
    `Orçamento ${input.id}`,
    input.workshopName,
    input.vehiclePlate ? `Veículo: ${input.vehiclePlate}${input.vehicleModel ? ` — ${input.vehicleModel}` : ""}` : "",
    "",
    ...lines,
    "",
    `Total: R$ ${input.total.toFixed(2)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function shareViaWhatsApp(text: string, phone?: string) {
  const encoded = encodeURIComponent(text);
  const url = phone
    ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function shareViaEmail(subject: string, body: string, to?: string) {
  const url = `mailto:${to ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
}

export function printDocument(title: string, htmlBody: string) {
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>body{font-family:system-ui,sans-serif;padding:24px;max-width:720px;margin:0 auto}
    h1{font-size:1.25rem} table{width:100%;border-collapse:collapse;margin:16px 0}
    th,td{border:1px solid #ccc;padding:8px;text-align:left} th{background:#f5f5f5}
    .total{font-weight:bold;font-size:1.1rem;margin-top:16px}</style></head>
    <body>${htmlBody}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

export function buildBudgetPrintHtml(input: {
  workshopName: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  lineItems: { name: string; quantity: number; unitPrice: number; total: number }[];
  total: number;
  id: string;
}): string {
  const rows = input.lineItems
    .map(
      (l) =>
        `<tr><td>${l.name}</td><td>${l.quantity}</td><td>R$ ${l.unitPrice.toFixed(2)}</td><td>R$ ${l.total.toFixed(2)}</td></tr>`
    )
    .join("");
  return `
    <h1>Orçamento ${input.id}</h1>
    <p><strong>${input.workshopName}</strong></p>
    ${input.vehiclePlate ? `<p>Veículo: ${input.vehiclePlate}${input.vehicleModel ? ` — ${input.vehicleModel}` : ""}</p>` : ""}
    <table><thead><tr><th>Item</th><th>Qtd</th><th>Unit.</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
    <p class="total">Total: R$ ${input.total.toFixed(2)}</p>`;
}
