import type { AgendaRequest } from "@/types/workshop";
import { isDatabaseReachable, prisma } from "@/lib/db/prisma";

function mapAgenda(row: {
  id: string;
  workshopId: string;
  clientName: string;
  clientPhone: string;
  vehicle: string | null;
  preferredDate: string;
  preferredTime: string;
  service: string;
  status: string;
  createdAt: Date;
}): AgendaRequest {
  return {
    id: row.id,
    workshopId: row.workshopId,
    clientName: row.clientName,
    clientPhone: row.clientPhone,
    vehicle: row.vehicle ?? undefined,
    preferredDate: row.preferredDate,
    preferredTime: row.preferredTime,
    service: row.service,
    status: row.status as AgendaRequest["status"],
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createAgendaRequest(
  input: Omit<AgendaRequest, "id" | "status" | "createdAt">
): Promise<AgendaRequest> {
  if (!(await isDatabaseReachable())) {
    throw new Error("Banco de dados indisponível");
  }

  const row = await prisma.agendaRequest.create({
    data: {
      id: `ag-${Date.now()}`,
      workshopId: input.workshopId,
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      vehicle: input.vehicle ?? null,
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      service: input.service,
      status: "pendente",
    },
  });

  return mapAgenda(row);
}

export async function getAgendaRequests(workshopId?: string): Promise<AgendaRequest[]> {
  if (!(await isDatabaseReachable())) return [];

  const rows = await prisma.agendaRequest.findMany({
    where: workshopId ? { workshopId } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return rows.map(mapAgenda);
}

export async function updateAgendaStatus(
  id: string,
  status: AgendaRequest["status"]
): Promise<void> {
  if (!(await isDatabaseReachable())) return;
  await prisma.agendaRequest.updateMany({ where: { id }, data: { status } });
}
