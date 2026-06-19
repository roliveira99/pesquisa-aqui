"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButton, DataTable } from "@/components/dashboard/DashboardUI";
import { formatCpf } from "@/lib/cpf";
import { apiAddVehicle, fetchCrm } from "@/lib/api/crm-client";
import type { WorkshopClient, WorkshopVehicle } from "@/types/client";

export function ClientesTab({ workshopId }: { workshopId: string }) {
  const [clients, setClients] = useState<WorkshopClient[]>([]);

  const refresh = useCallback(async () => {
    const data = await fetchCrm();
    setClients(data.clients);
  }, [workshopId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        Perfil do cliente serve apenas para avaliar a oficina e agendar horário — não fica vinculado a veículos.
        Clientes aparecem aqui quando se cadastram na avaliação (CPF, nome e data de nascimento).
      </p>

      {clients.length === 0 ? (
        <p className="text-sm text-muted">Nenhum cliente registrado via avaliação ainda.</p>
      ) : (
        <DataTable
          headers={["Nome", "CPF", "Telefone", "Avaliou no app", "Serviços concluídos"]}
          rows={clients.map((c) => [
            c.name,
            formatCpf(c.cpf),
            c.phone || "—",
            c.completedServices.length > 0 ? (
              <span key={`rev-${c.id}`} className="dash-badge">Sim</span>
            ) : (
              <span key={`wait-${c.id}`} className="text-xs text-muted">Aguardando serviço</span>
            ),
            c.completedServices.length,
          ])}
        />
      )}
    </div>
  );
}

export function VeiculosTab({ workshopId }: { workshopId: string }) {
  const [vehicles, setVehicles] = useState<WorkshopVehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const data = await fetchCrm();
    setVehicles(data.vehicles);
  }, [workshopId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = await apiAddVehicle({ plate, model, year: year || undefined });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPlate("");
    setModel("");
    setYear("");
    setShowForm(false);
    await refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Cadastre placa, modelo e ano. Consulte o histórico de serviços por veículo.
        </p>
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
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              required
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              className="input-field"
              placeholder="Placa *"
            />
            <input
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="input-field"
              placeholder="Modelo *"
            />
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="input-field"
              placeholder="Ano"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" className="btn btn-primary">
            Salvar veículo
          </button>
        </form>
      )}

      {vehicles.length === 0 ? (
        <p className="text-sm text-muted">Nenhum veículo cadastrado.</p>
      ) : (
        <DataTable
          headers={["Placa", "Modelo", "Ano", "Histórico (serviços)"]}
          rows={vehicles.map((v) => [
            v.plate,
            v.model,
            v.year ?? "—",
            (v.completedServices?.length ?? 0) > 0 ? (
              <span key={`hist-${v.id}`} className="dash-badge">
                {v.completedServices!.length} serviço{v.completedServices!.length > 1 ? "s" : ""}
              </span>
            ) : (
              <span key={`none-${v.id}`} className="text-xs text-muted">Sem histórico ainda</span>
            ),
          ])}
        />
      )}
    </div>
  );
}
