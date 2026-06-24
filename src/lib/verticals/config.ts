import type { BusinessVertical, VerticalConfig } from "@/types/vertical";

export const VERTICALS: Record<BusinessVertical, VerticalConfig> = {
  automotive: {
    id: "automotive",
    name: "Automotivo",
    businessPlural: "oficinas e estéticas",
    businessSingular: "oficina",
    directoryTitle: "Oficinas e estéticas automotivas",
    directoryDescription:
      "Fotos reais, avaliações verificadas, status aberto agora e contato direto — sem criar conta.",
    searchPlaceholder: "Cidade, bairro ou nome da oficina...",
    heroTitle: "Encontre oficinas e estéticas automotivas perto de você",
    heroSubtitle:
      "Compare perfis, veja fotos, catálogo de serviços e fale no WhatsApp — tudo em um só lugar.",
    defaultEmoji: "🔧",
    usesAutomotiveTypes: true,
    categories: [
      { value: "carros", label: "Carros" },
      { value: "motos", label: "Motos" },
      { value: "mista", label: "Carros e motos" },
      { value: "estetica", label: "Estética automotiva" },
    ],
  },
  beauty: {
    id: "beauty",
    name: "Beleza e bem-estar",
    businessPlural: "salões e clínicas",
    businessSingular: "salão",
    directoryTitle: "Salões, barbearias e estética",
    directoryDescription: "Encontre profissionais perto de você com avaliações e contato direto.",
    searchPlaceholder: "Cidade, bairro ou nome do estabelecimento...",
    heroTitle: "Beleza e bem-estar perto de você",
    heroSubtitle: "Salões, barbearias, spas e clínicas de estética — compare e agende sem cadastro.",
    defaultEmoji: "💇",
    usesAutomotiveTypes: false,
    categories: [
      { value: "salao", label: "Salão de beleza" },
      { value: "barbearia", label: "Barbearia" },
      { value: "estetica", label: "Clínica de estética" },
      { value: "spa", label: "Spa / massagem" },
    ],
  },
  food: {
    id: "food",
    name: "Alimentação",
    businessPlural: "restaurantes e lanchonetes",
    businessSingular: "restaurante",
    directoryTitle: "Restaurantes, lanchonetes e padarias",
    directoryDescription: "Descubra opções na sua região com cardápio, horários e contato.",
    searchPlaceholder: "Cidade, bairro ou nome do local...",
    heroTitle: "Onde comer perto de você",
    heroSubtitle: "Restaurantes, lanchonetes, padarias e delivery — encontre e fale direto.",
    defaultEmoji: "🍽️",
    usesAutomotiveTypes: false,
    categories: [
      { value: "restaurante", label: "Restaurante" },
      { value: "lanchonete", label: "Lanchonete" },
      { value: "padaria", label: "Padaria / confeitaria" },
      { value: "delivery", label: "Delivery / dark kitchen" },
    ],
  },
  retail: {
    id: "retail",
    name: "Comércio",
    businessPlural: "lojas",
    businessSingular: "loja",
    directoryTitle: "Lojas e comércios locais",
    directoryDescription: "Produtos, horários e contato de lojas da sua região.",
    searchPlaceholder: "Cidade, bairro ou nome da loja...",
    heroTitle: "Comércios locais perto de você",
    heroSubtitle: "Lojas de bairro, varejo e atacado — catálogo, WhatsApp e avaliações.",
    defaultEmoji: "🛍️",
    usesAutomotiveTypes: false,
    categories: [
      { value: "moda", label: "Moda e vestuário" },
      { value: "eletronicos", label: "Eletrônicos" },
      { value: "casa", label: "Casa e decoração" },
      { value: "geral", label: "Comércio geral" },
    ],
  },
  health: {
    id: "health",
    name: "Saúde",
    businessPlural: "clínicas e consultórios",
    businessSingular: "clínica",
    directoryTitle: "Clínicas, consultórios e saúde",
    directoryDescription: "Profissionais e estabelecimentos de saúde na sua região.",
    searchPlaceholder: "Cidade, especialidade ou nome...",
    heroTitle: "Saúde perto de você",
    heroSubtitle: "Clínicas, consultórios, laboratórios e bem-estar — encontre e entre em contato.",
    defaultEmoji: "🏥",
    usesAutomotiveTypes: false,
    categories: [
      { value: "clinica", label: "Clínica" },
      { value: "consultorio", label: "Consultório" },
      { value: "laboratorio", label: "Laboratório" },
      { value: "fisioterapia", label: "Fisioterapia" },
    ],
  },
  services: {
    id: "services",
    name: "Serviços",
    businessPlural: "prestadores de serviço",
    businessSingular: "prestador",
    directoryTitle: "Prestadores de serviços",
    directoryDescription: "Manutenção, reformas, limpeza e serviços profissionais na sua região.",
    searchPlaceholder: "Cidade, serviço ou nome...",
    heroTitle: "Serviços profissionais perto de você",
    heroSubtitle: "Encanadores, eletricistas, reformas, limpeza e muito mais.",
    defaultEmoji: "🛠️",
    usesAutomotiveTypes: false,
    categories: [
      { value: "reforma", label: "Reforma / construção" },
      { value: "limpeza", label: "Limpeza" },
      { value: "tecnologia", label: "Tecnologia / informática" },
      { value: "geral", label: "Serviços gerais" },
    ],
  },
  education: {
    id: "education",
    name: "Educação",
    businessPlural: "escolas e cursos",
    businessSingular: "escola",
    directoryTitle: "Escolas, cursos e treinamentos",
    directoryDescription: "Instituições de ensino e cursos na sua região.",
    searchPlaceholder: "Cidade, curso ou nome...",
    heroTitle: "Educação e cursos perto de você",
    heroSubtitle: "Escolas, cursos livres, idiomas e capacitação profissional.",
    defaultEmoji: "📚",
    usesAutomotiveTypes: false,
    categories: [
      { value: "escola", label: "Escola / colégio" },
      { value: "curso", label: "Curso livre" },
      { value: "idiomas", label: "Idiomas" },
      { value: "tecnico", label: "Curso técnico" },
    ],
  },
  pets: {
    id: "pets",
    name: "Pets",
    businessPlural: "pet shops e clínicas vet",
    businessSingular: "pet shop",
    directoryTitle: "Pet shops, clínicas veterinárias e pets",
    directoryDescription: "Cuidado animal, produtos e serviços para seu pet.",
    searchPlaceholder: "Cidade, bairro ou nome...",
    heroTitle: "Tudo para pets perto de você",
    heroSubtitle: "Pet shops, veterinários, banho e tosa — encontre e agende.",
    defaultEmoji: "🐾",
    usesAutomotiveTypes: false,
    categories: [
      { value: "petshop", label: "Pet shop" },
      { value: "veterinario", label: "Clínica veterinária" },
      { value: "banho", label: "Banho e tosa" },
      { value: "adocao", label: "Adoção / ONG" },
    ],
  },
  other: {
    id: "other",
    name: "Outros",
    businessPlural: "negócios",
    businessSingular: "negócio",
    directoryTitle: "Negócios e empreendimentos",
    directoryDescription: "Empresas e comércios de todos os segmentos.",
    searchPlaceholder: "Cidade, bairro ou nome do negócio...",
    heroTitle: "Encontre negócios perto de você",
    heroSubtitle: "Qualquer empreendimento pode ter perfil, catálogo e contato na plataforma.",
    defaultEmoji: "🏢",
    usesAutomotiveTypes: false,
    categories: [
      { value: "geral", label: "Geral" },
      { value: "associacao", label: "Associação / cooperativa" },
      { value: "industria", label: "Indústria" },
    ],
  },
};

export const VERTICAL_LIST = Object.values(VERTICALS);

export function getVerticalConfig(vertical: BusinessVertical | string | null | undefined): VerticalConfig {
  const key = (vertical ?? "automotive") as BusinessVertical;
  return VERTICALS[key] ?? VERTICALS.other;
}

export function getCategoryLabel(vertical: BusinessVertical, category: string | null | undefined): string {
  if (!category) return getVerticalConfig(vertical).name;
  const found = getVerticalConfig(vertical).categories.find((c) => c.value === category);
  return found?.label ?? category;
}
