"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButton, DataTable } from "@/components/dashboard/DashboardUI";
import { formatCpf, formatCpfInput, isValidCpfFormat } from "@/lib/cpf";
import {
  apiAddClient,
  apiAddVehicle,
  fetchCrm,
} from "@/lib/api/crm-client";
import type { WorkshopClient, WorkshopVehicle } from "@/types/client";

interface ClientesTabProps {
  workshopId: string;
}

export function ClientesTab({ workshopId }: ClientesTabProps) {
  const [clients, setClients] = useState<WorkshopClient[]>([]);
  const [vehicles, setVehicles] = useState<WorkshopVehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const data = await fetchCrm();
    setClients(data.clients);
    setVehicles(data.vehicles);
  }, [workshopId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isValidCpfFormat(cpf)) {
      setError("Informe um CPF válido.");
      return;
    }

    const result = await apiAddClient({ name, phone, cpf });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setName("");
    setPhone("");
    setCpf("");
    setShowForm(false);
    await refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          O CPF cadastrado aqui é usado para liberar avaliações no perfil público após serviço concluído.
        </p>
        <ActionButton
          label={showForm ? "Cancelar" : "+ Novo cliente"}
          variant={showForm ? "secondary" : "primary"}
          onClick={() => {
            setShowForm(!showForm);
            setError("");
          }}
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4 p-5">
          <h3 className="font-semibold text-foreground">Cadastrar cliente</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Nome completo"
            />
            <input
              required
              value={cpf}
              onChange={(e) => setCpf(formatCpfInput(e.target.value))}
              className="input-field"
              placeholder="CPF"
              maxLength={14}
            />
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="Telefone / WhatsApp"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
          >
            Salvar cliente
          </button>
        </form>
      )}

      <DataTable
        headers={["Nome", "CPF", "Telefone", "Veículos", "Avaliação", "Ações"]}
        rows={clients.map((c) => [
          c.name,
          formatCpf(c.cpf),
          c.phone || "—",
          vehicles.filter((v) => v.clientId === c.id).length,
          c.completedServices.length > 0 ? (
            <span
              key={`rev-${c.id}`}
              className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
            >
              Pode avaliar ({c.completedServices.length} serviço{c.completedServices.length > 1 ? "s" : ""})
            </span>
          ) : (
            <span key={`wait-${c.id}`} className="text-xs text-muted">
              Aguardando 1º serviço concluído
            </span>
          ),
          <ActionButton key={`edit-${c.id}`} label="Editar" />,
        ])}
      />
    </div>
  );
}

interface VeiculosTabProps {
  workshopId: string;
}

export function VeiculosTab({ workshopId }: VeiculosTabProps) {
  const [vehicles, setVehicles] = useState<WorkshopVehicle[]>([]);
  const [clients, setClients] = useState<WorkshopClient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [clientId, setClientId] = useState("");
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const data = await fetchCrm();
    setVehicles(data.vehicles);
    setClients(data.clients);
  }, [workshopId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = await apiAddVehicle({ clientId, plate, model });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setClientId("");
    setPlate("");
    setModel("");
    setShowForm(false);
    await refresh();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <ActionButton
          label={showForm ? "Cancelar" : "+ Novo veículo"}
          variant={showForm ? "secondary" : "primary"}
          onClick={() => {
            setShowForm(!showForm);
            setError("");
          }}
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4 p-5">
          <h3 className="font-semibold">Cadastrar veículo</h3>
          {clients.length === 0 ? (
            <p className="text-sm text-muted">Cadastre um cliente antes de vincular um veículo.</p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="input-field"
                >
                  <option value="">Cliente (CPF)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {formatCpf(c.cpf)}
                    </option>
                  ))}
                </select>
                <input
                  required
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  className="input-field"
                  placeholder="Placa"
                />
                <input
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="input-field"
                  placeholder="Modelo / ano"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
              >
                Salvar veículo
              </button>
            </>
          )}
        </form>
      )}

      <DataTable
        headers={["Placa", "Modelo", "Cliente", "CPF", "Ações"]}
        rows={vehicles.map((v) => {
          const client = clients.find((c) => c.id === v.clientId);
          return [
            v.plate,
            v.model,
            client?.name ?? "—",
            client ? formatCpf(client.cpf) : "—",
            <ActionButton key={v.id} label="Editar" />,
          ];
        })}
      />
    </div>
  );
}
