"use client";

import { useRef } from "react";
import type {
  CustomerQuotePayload,
  DocumentIssuer,
  QuoteLineItem,
  QuoteTemplateSettings,
} from "@/types/quote-document";
import {
  formatCnpj,
  formatMoney,
  lineItemTotal,
  quoteTotal,
} from "@/types/quote-document";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { buildQuoteWhatsAppText } from "@/lib/quote-document-storage";

interface CustomerQuotePrintViewProps {
  payload: CustomerQuotePayload;
  issuer: DocumentIssuer;
  template: QuoteTemplateSettings;
}

export function CustomerQuotePrintView({ payload, issuer, template }: CustomerQuotePrintViewProps) {
  const validUntil = new Date(payload.issuedAt);
  validUntil.setDate(validUntil.getDate() + template.validityDays);
  const total = quoteTotal(payload.items);

  return (
    <div className="quote-print-root mx-auto max-w-2xl bg-white p-8 text-sm text-gray-900 print:p-6">
      <header className="border-b border-gray-300 pb-4">
        <p className="text-xs uppercase tracking-wide text-gray-500">{template.documentTitle}</p>
        <h1 className="mt-1 text-2xl font-bold">{issuer.tradeName}</h1>
        <p className="text-gray-600">{issuer.legalName}</p>
        <p className="mt-2 text-gray-700">CNPJ: {formatCnpj(issuer.cnpj)}</p>
        <p className="text-gray-700">
          {issuer.address} — {issuer.city}/{issuer.state}
        </p>
        <p className="text-gray-700">
          {issuer.phone}
          {issuer.email ? ` · ${issuer.email}` : ""}
        </p>
      </header>

      {template.headerNote && (
        <p className="mt-4 rounded bg-gray-50 p-3 text-gray-700">{template.headerNote}</p>
      )}

      <section className="mt-6 grid gap-1 text-gray-800">
        <p>
          <strong>Cliente:</strong> {payload.clientName}
        </p>
        {payload.clientCpf && (
          <p>
            <strong>CPF:</strong> {payload.clientCpf}
          </p>
        )}
        {payload.vehicle && (
          <p>
            <strong>Veículo:</strong> {payload.vehicle}
            {payload.vehiclePlate ? ` · Placa ${payload.vehiclePlate}` : ""}
          </p>
        )}
        <p>
          <strong>Referência:</strong> {payload.orderId}
        </p>
        <p>
          <strong>Data:</strong>{" "}
          {new Date(payload.issuedAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p>
          <strong>Validade:</strong> {validUntil.toLocaleDateString("pt-BR")} ({template.validityDays}{" "}
          dias)
        </p>
      </section>

      <table className="mt-6 w-full border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-gray-800 text-xs uppercase">
            <th className="py-2 pr-2">Serviço / peça</th>
            <th className="py-2 px-2 text-center">Qtd</th>
            <th className="py-2 px-2 text-right">Unit.</th>
            <th className="py-2 pl-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {payload.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-200">
              <td className="py-2.5 pr-2">{item.description}</td>
              <td className="py-2.5 px-2 text-center">{item.quantity}</td>
              <td className="py-2.5 px-2 text-right">{formatMoney(item.unitPrice)}</td>
              <td className="py-2.5 pl-2 text-right font-medium">{formatMoney(lineItemTotal(item))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="pt-4 text-right font-bold">
              Total
            </td>
            <td className="pt-4 pl-2 text-right text-lg font-bold">{formatMoney(total)}</td>
          </tr>
        </tfoot>
      </table>

      <section className="mt-6 space-y-2 text-gray-700">
        <p>
          <strong>Formas de pagamento:</strong> {template.paymentTerms}
        </p>
        {template.footerNote && <p className="text-xs">{template.footerNote}</p>}
      </section>
    </div>
  );
}

interface QuoteDocumentActionsProps {
  payload: CustomerQuotePayload;
  issuer: DocumentIssuer;
  template: QuoteTemplateSettings;
  onClose?: () => void;
}

export function QuoteDocumentActions({ payload, issuer, template, onClose }: QuoteDocumentActionsProps) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>${template.documentTitle} — ${payload.orderId}</title>
      <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; color: #111; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; }
        @media print { body { padding: 0; } }
      </style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  function handleWhatsApp() {
    const text = buildQuoteWhatsAppText(payload, issuer, template);
    const phone = payload.clientPhone || issuer.phone;
    window.open(buildWhatsAppUrl(phone, text), "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="btn btn-primary"
        >
          Imprimir / PDF
        </button>
        <button
          type="button"
          onClick={handleWhatsApp}
          className="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
        >
          Enviar WhatsApp
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
          >
            Fechar
          </button>
        )}
      </div>
      <div ref={printRef}>
        <CustomerQuotePrintView payload={payload} issuer={issuer} template={template} />
      </div>
    </div>
  );
}

export function QuoteLineItemsEditor({
  items,
  onChange,
}: {
  items: QuoteLineItem[];
  onChange: (items: QuoteLineItem[]) => void;
}) {
  function update(index: number, patch: Partial<QuoteLineItem>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addLine() {
    onChange([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-12">
          <input
            required
            value={item.description}
            onChange={(e) => update(index, { description: e.target.value })}
            className="input-field sm:col-span-6"
            placeholder="Descrição do serviço ou peça"
          />
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => update(index, { quantity: Number(e.target.value) })}
            className="input-field sm:col-span-2"
            placeholder="Qtd"
          />
          <input
            type="number"
            min={0}
            step={0.01}
            value={item.unitPrice}
            onChange={(e) => update(index, { unitPrice: Number(e.target.value) })}
            className="input-field sm:col-span-3"
            placeholder="Valor unit."
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-sm text-red-600 sm:col-span-1"
            disabled={items.length <= 1}
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={addLine} className="text-sm font-medium text-accent">
        + Adicionar linha
      </button>
      <p className="text-sm font-semibold">Total: {formatMoney(quoteTotal(items))}</p>
    </div>
  );
}
