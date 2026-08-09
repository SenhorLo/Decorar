export const CATEGORIES = [
  { slug: "sofas-e-poltronas", label: "Sofás e Poltronas" },
  { slug: "mesas-e-cadeiras", label: "Mesas e Cadeiras" },
  { slug: "camas-e-colchoes", label: "Camas e Colchões" },
  { slug: "armarios-e-estantes", label: "Armários e Estantes" },
  { slug: "iluminacao", label: "Iluminação" },
  { slug: "tapetes-e-texteis", label: "Tapetes e Têxteis" },
  { slug: "arte-e-quadros", label: "Arte e Quadros" },
  { slug: "espelhos", label: "Espelhos" },
  { slug: "vasos-e-objetos", label: "Vasos e Objetos" },
  { slug: "escritorio", label: "Escritório" },
  { slug: "area-externa", label: "Área Externa" },
  { slug: "vintage-e-garimpo", label: "Vintage e Garimpo" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as [string, ...string[]];

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export const CONDITIONS = [
  { value: "NOVO", label: "Novo", hint: "Nunca usado, com ou sem etiqueta" },
  { value: "SEMINOVO", label: "Seminovo", hint: "Pouco uso, sem marcas visíveis" },
  { value: "USADO", label: "Usado", hint: "Sinais naturais de uso" },
  { value: "RESTAURADO", label: "Restaurado", hint: "Recuperado por profissional" },
] as const;

export type ConditionValue = (typeof CONDITIONS)[number]["value"];
export const CONDITION_VALUES = CONDITIONS.map((c) => c.value) as [string, ...string[]];

export function conditionLabel(value: string): string {
  return CONDITIONS.find((c) => c.value === value)?.label ?? value;
}

export const LISTING_STATUS = [
  { value: "RASCUNHO", label: "Rascunho" },
  { value: "ATIVO", label: "Ativo" },
  { value: "PAUSADO", label: "Pausado" },
  { value: "VENDIDO", label: "Vendido" },
] as const;

export type ListingStatus = (typeof LISTING_STATUS)[number]["value"];
export const LISTING_STATUS_VALUES = LISTING_STATUS.map((s) => s.value) as [string, ...string[]];

export function statusLabel(value: string): string {
  return LISTING_STATUS.find((s) => s.value === value)?.label ?? value;
}

export const MATERIALS = [
  "Madeira maciça",
  "Madeira reflorestada",
  "MDF",
  "Metal",
  "Vidro",
  "Mármore",
  "Rattan / Palhinha",
  "Couro",
  "Linho",
  "Veludo",
  "Cerâmica",
  "Outro",
] as const;

export const UFS = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA",
  "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN",
  "RO", "RR", "RS", "SC", "SE", "SP", "TO",
] as const;

export const UF_VALUES = [...UFS] as unknown as [string, ...string[]];

export const SORT_OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "populares", label: "Mais vistos" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
