export type OpenStatus = "open" | "closed" | "unknown";

/** Heurística demo: Seg–Sex 8h–18h, Sáb 8h–13h quando presente no texto. */
export function getWorkshopOpenStatus(openingHours: string, now = new Date()): OpenStatus {
  const text = openingHours.toLowerCase();
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;

  const isSaturday = day === 6;
  const isSunday = day === 0;
  const isWeekday = day >= 1 && day <= 5;

  if (isSunday && !text.includes("dom")) return "closed";

  if (isSaturday) {
    if (text.includes("sáb") || text.includes("sab")) {
      const satOpen = parseHour(text, "sáb") ?? parseHour(text, "sab") ?? 8;
      const satClose = parseCloseHour(text, "sáb") ?? parseCloseHour(text, "sab") ?? 13;
      return hour >= satOpen && hour < satClose ? "open" : "closed";
    }
    return text.includes("seg–sáb") || text.includes("seg-sab") ? "unknown" : "closed";
  }

  if (isWeekday) {
    const open = parseHour(text, "seg") ?? 8;
    const close = parseCloseHour(text, "seg") ?? 18;
    return hour >= open && hour < close ? "open" : "closed";
  }

  return "unknown";
}

function parseHour(text: string, marker: string): number | null {
  const idx = text.indexOf(marker);
  if (idx === -1) return null;
  const slice = text.slice(idx, idx + 30);
  const match = slice.match(/(\d{1,2})h/);
  return match ? Number(match[1]) : null;
}

function parseCloseHour(text: string, marker: string): number | null {
  const idx = text.indexOf(marker);
  if (idx === -1) return null;
  const slice = text.slice(idx);
  const parts = slice.split(/–|-/);
  if (parts.length < 2) return null;
  const match = parts[1].match(/(\d{1,2})h/);
  return match ? Number(match[1]) : null;
}

export function openStatusLabel(status: OpenStatus): string {
  if (status === "open") return "Aberto agora";
  if (status === "closed") return "Fechado";
  return "Consulte horário";
}

export function buildMapsUrl(address: string, city: string, state: string): string {
  const query = encodeURIComponent(`${address}, ${city} - ${state}, Brasil`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
