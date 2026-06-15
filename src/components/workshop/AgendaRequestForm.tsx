"use client";

import { useState } from "react";
import type { Workshop } from "@/types/workshop";

interface AgendaRequestFormProps {
  workshop: Workshop;
}

export function AgendaRequestForm({ workshop }: AgendaRequestFormProps) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [service, setService] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!workshop.hasAgenda) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          workshopId: workshop.id,
          clientName,
          clientPhone,
          vehicle: vehicle || undefined,
          preferredDate,
          preferredTime,
          service,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar a solicitação.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <section className="mt-10 rounded-lg border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/30">
        <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
          Solicitação enviada
        </h2>
        <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
          A {workshop.name} receberá seu pedido de horário para {preferredDate} às {preferredTime}.
          Você será avisado por WhatsApp quando a data for aprovada — sem necessidade de login.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-lg border border-border bg-surface-hover/30 p-6">
      <h2 className="text-lg font-semibold tracking-tight">Solicitar horário na agenda</h2>
      <p className="mt-1 text-sm text-muted">
        Escolha uma data preferencial. A oficina aprova ou sugere outro horário — você não precisa criar conta.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Seu nome" required>
          <input
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="input-field"
            placeholder="Como podemos te chamar?"
          />
        </Field>
        <Field label="WhatsApp / telefone" required>
          <input
            required
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="input-field"
            placeholder="(11) 99999-9999"
          />
        </Field>
        <Field label="Veículo (opcional)">
          <input
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            className="input-field"
            placeholder="Ex.: Honda Civic 2020"
          />
        </Field>
        <Field label="Serviço desejado" required>
          <select
            required
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="input-field"
          >
            <option value="">Selecione...</option>
            {workshop.catalog.services.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
            {workshop.services
              .filter((s) => !workshop.catalog.services.some((c) => c.name === s))
              .map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Data preferencial" required>
          <input
            required
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="input-field"
            min={new Date().toISOString().split("T")[0]}
          />
        </Field>
        <Field label="Horário preferencial" required>
          <input
            required
            type="time"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className="input-field"
          />
        </Field>
        {error && (
          <p className="sm:col-span-2 text-sm text-danger">{error}</p>
        )}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar solicitação de aprovação"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-foreground">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
