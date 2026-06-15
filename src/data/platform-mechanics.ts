/** Mecânicos com login na plataforma (por oficina). */
export const platformMechanicsByWorkshop: Record<
  string,
  { id: string; name: string; specialty?: string }[]
> = {
  "1": [{ id: "platform-pedro", name: "Pedro Oliveira", specialty: "Motor e injeção" }],
};
