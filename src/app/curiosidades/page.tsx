import { CuriosityCard } from "@/components/curiosities/CuriosityCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { curiosities } from "@/data/curiosities";

export const metadata = {
  title: "Conteúdo — MP Oficinas",
  description: "Artigos e orientações sobre manutenção automotiva e gestão de oficinas.",
};

export default function CuriosidadesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Conteúdo educativo"
        title="Conhecimento automotivo"
        description="Orientações práticas para clientes e gestores sobre manutenção, escolha de serviços e boas práticas do setor."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {curiosities.map((curiosity) => (
          <CuriosityCard key={curiosity.id} curiosity={curiosity} expanded />
        ))}
      </div>
    </div>
  );
}
