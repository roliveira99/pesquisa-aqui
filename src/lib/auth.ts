import type { AuthUser, UserRole } from "@/types/auth";

const AUTH_KEY = "mp-oficinas-auth";

interface DemoAccount {
  email: string;
  password: string;
  user: AuthUser;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "admin@mpoficinas.com",
    password: "admin123",
    user: {
      email: "admin@mpoficinas.com",
      name: "Administrador Master",
      role: "master",
      workshopId: null,
      workshopName: null,
    },
  },
  {
    email: "dono@mpoficinas.com",
    password: "dono123",
    user: {
      email: "dono@mpoficinas.com",
      name: "João Silva",
      role: "dono",
      workshopId: "1",
      workshopName: "Auto Center Silva",
    },
  },
  {
    email: "gerencia@mpoficinas.com",
    password: "gerencia123",
    user: {
      email: "gerencia@mpoficinas.com",
      name: "Maria Santos",
      role: "gerencia",
      workshopId: "1",
      workshopName: "Auto Center Silva",
    },
  },
  {
    email: "mecanico@mpoficinas.com",
    password: "mecanico123",
    user: {
      email: "mecanico@mpoficinas.com",
      name: "Pedro Oliveira",
      role: "mecanico",
      workshopId: "1",
      workshopName: "Auto Center Silva",
    },
  },
];

const VALID_ROLES: UserRole[] = ["master", "dono", "gerencia", "mecanico"];

export function isValidAuthUser(user: unknown): user is AuthUser {
  if (!user || typeof user !== "object") return false;
  const u = user as AuthUser;
  return (
    typeof u.email === "string" &&
    typeof u.name === "string" &&
    VALID_ROLES.includes(u.role)
  );
}

export function login(email: string, password: string): AuthUser | null {
  const account = DEMO_ACCOUNTS.find(
    (a) => a.email === email && a.password === password
  );
  return account?.user ?? null;
}

export function saveSession(user: AuthUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
}

export function getSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isValidAuthUser(parsed)) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function getDemoAccountsByRole(): Record<UserRole, DemoAccount> {
  return {
    master: DEMO_ACCOUNTS[0],
    dono: DEMO_ACCOUNTS[1],
    gerencia: DEMO_ACCOUNTS[2],
    mecanico: DEMO_ACCOUNTS[3],
  };
}
