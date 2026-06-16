"use client";

import type { AdminUserRow } from "@/lib/db/admin";
import type { Workshop } from "@/types/workshop";

export async function fetchAdminWorkshops(): Promise<{ workshops: Workshop[] }> {
  const res = await fetch("/api/admin/workshops");
  if (!res.ok) throw new Error("Falha ao carregar oficinas.");
  return res.json() as Promise<{ workshops: Workshop[] }>;
}

export async function apiCreateWorkshop(input: Record<string, unknown>) {
  const res = await fetch("/api/admin/workshops", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json() as Promise<
    { ok: true; workshop: Workshop; ownerEmail?: string } | { error: string }
  >;
}

export async function apiDeleteWorkshop(id: string) {
  const res = await fetch(`/api/admin/workshops?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  return res.json() as Promise<{ ok: true } | { error: string }>;
}

export async function fetchAdminUsers(): Promise<{ users: AdminUserRow[] }> {
  const res = await fetch("/api/admin/users");
  if (!res.ok) throw new Error("Falha ao carregar contas.");
  return res.json() as Promise<{ users: AdminUserRow[] }>;
}

export async function apiCreateUser(input: {
  name: string;
  email: string;
  password: string;
  role: "dono" | "gerencia" | "mecanico";
  workshopId: string;
}) {
  const res = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json() as Promise<{ ok: true; user: AdminUserRow } | { error: string }>;
}

export async function apiDeleteUser(id: string) {
  const res = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  return res.json() as Promise<{ ok: true } | { error: string }>;
}
