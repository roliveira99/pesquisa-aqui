"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ActionButton } from "@/components/dashboard/DashboardUI";
import { PageHeader } from "@/components/dashboard/DashboardUI";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  addDocumentIssuer,
  getDocumentIssuers,
  getQuoteTemplate,
  removeDocumentIssuer,
  saveQuoteTemplate,
  setDefaultIssuer,
} from "@/lib/quote-document-storage";
import type { DocumentIssuer } from "@/types/quote-document";
import { formatCnpj, formatCnpjInput } from "@/types/quote-document";

export default function EmitentesNotasPage() {
  const { user } = useAuth();
  const workshopId = user?.workshopId ?? "1";
  const [issuers, setIssuers] = useState<DocumentIssuer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [template, setTemplate] = useState(getQuoteTemplate(workshopId));
  const [saved, setSaved] = useState("");

  const [label, setLabel] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const refresh = useCallback(() => {
    setIssuers(getDocumentIssuers(workshopId));
    setTemplate(getQuoteTemplate(workshopId));
  }, [workshopId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleAddIssuer(e: React.FormEvent) {
    e.preventDefault();
    addDocumentIssuer(workshopId, {
      label,
      tradeName,
      legalName,
      cnpj,
      address,
      city,
      state,
      phone,
      email,
    });
    setLabel("");
    setTradeName("");
    setLegalName("");
    setCnpj("");
    setAddress("");
    setCity("");
    setState("");
    setPhone("");
    setEmail("");
    setShowForm(false);
    setSaved("Emitente cadastrado.");
    refresh();
  }

  function handleSaveTemplate(e: React.FormEvent) {
    e.preventDefault();
    saveQuoteTemplate(workshopId, template);
    setSaved("Modelo padrão da nota salvo.");
  }

  return (
    <PermissionGuard permissions={["owner.configurar_notas"]}>
      <PageHeader
        title="Emitentes e modelo da nota"
        description="Cadastre vários CNPJs e nomes — escolha qual usar ao enviar a nota ao cliente"
        actions={
          <Link href="/dashboard/notas" className="dash-link text-sm font-medium">
            ← Voltar às notas
          </Link>
        }
      />

      {saved && (
        <p className="dash-alert">{saved}</p>
      )}

      <section className="card mb-8 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">CNPJs / razões sociais</h2>
          <ActionButton
            label={showForm ? "Cancelar" : "+ Novo emitente"}
            variant={showForm ? "secondary" : "primary"}
            onClick={() => setShowForm(!showForm)}
          />
        </div>

        {showForm && (
          <form onSubmit={handleAddIssuer} className="mb-6 grid gap-3 sm:grid-cols-2">
            <input required value={label} onChange={(e) => setLabel(e.target.value)} className="input-field" placeholder="Rótulo (ex.: Matriz)" />
            <input required value={tradeName} onChange={(e) => setTradeName(e.target.value)} className="input-field" placeholder="Nome fantasia" />
            <input required value={legalName} onChange={(e) => setLegalName(e.target.value)} className="input-field sm:col-span-2" placeholder="Razão social" />
            <input required value={cnpj} onChange={(e) => setCnpj(formatCnpjInput(e.target.value))} className="input-field" placeholder="CNPJ" maxLength={18} />
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="Telefone" />
            <input required value={address} onChange={(e) => setAddress(e.target.value)} className="input-field sm:col-span-2" placeholder="Endereço" />
            <input required value={city} onChange={(e) => setCity(e.target.value)} className="input-field" placeholder="Cidade" />
            <input required value={state} onChange={(e) => setState(e.target.value)} className="input-field" placeholder="UF" maxLength={2} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="input-field sm:col-span-2" placeholder="E-mail (opcional)" />
            <button type="submit" className="btn btn-primary sm:col-span-2">
              Salvar emitente
            </button>
          </form>
        )}

        <ul className="divide-y divide-border">
          {issuers.map((i) => (
            <li key={i.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
              <div>
                <p className="font-semibold">
                  {i.label} {i.isDefault && <span className="dash-badge text-xs">(padrão)</span>}
                </p>
                <p className="text-sm">{i.tradeName}</p>
                <p className="text-xs text-muted">{i.legalName}</p>
                <p className="mt-1 text-sm">CNPJ {formatCnpj(i.cnpj)}</p>
              </div>
              <div className="flex gap-2">
                {!i.isDefault && (
                  <ActionButton label="Tornar padrão" onClick={() => { setDefaultIssuer(workshopId, i.id); refresh(); }} />
                )}
                <ActionButton label="Remover" variant="danger" onClick={() => { removeDocumentIssuer(workshopId, i.id); refresh(); }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="mb-4 font-semibold">Modelo padrão da nota</h2>
        <form onSubmit={handleSaveTemplate} className="space-y-4">
          <input
            value={template.documentTitle}
            onChange={(e) => setTemplate({ ...template, documentTitle: e.target.value })}
            className="input-field"
            placeholder="Título do documento"
          />
          <textarea
            value={template.headerNote}
            onChange={(e) => setTemplate({ ...template, headerNote: e.target.value })}
            className="input-field min-h-[80px]"
            placeholder="Informações gerais no topo (aparece abaixo do cabeçalho)"
          />
          <textarea
            value={template.paymentTerms}
            onChange={(e) => setTemplate({ ...template, paymentTerms: e.target.value })}
            className="input-field"
            placeholder="Formas de pagamento"
          />
          <textarea
            value={template.footerNote}
            onChange={(e) => setTemplate({ ...template, footerNote: e.target.value })}
            className="input-field min-h-[60px]"
            placeholder="Rodapé (garantia, observações)"
          />
          <label className="flex items-center gap-2 text-sm">
            Validade (dias):
            <input
              type="number"
              min={1}
              value={template.validityDays}
              onChange={(e) => setTemplate({ ...template, validityDays: Number(e.target.value) })}
              className="input-field w-24"
            />
          </label>
          <button type="submit" className="btn btn-primary">
            Salvar modelo
          </button>
        </form>
      </section>
    </PermissionGuard>
  );
}
