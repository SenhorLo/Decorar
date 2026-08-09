/** Concatena classes condicionalmente (substitui clsx sem dependencia). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Faixa Unicode dos diacriticos combinantes (acentos soltos apos NFD). */
const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

/** Remove acentos e normaliza para busca/slug. */
export function normalize(value: string): string {
  return value.normalize("NFD").replace(COMBINING_MARKS, "").toLowerCase().trim();
}

export function slugify(value: string): string {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Centavos -> "R$ 1.290,00" */
export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/** Centavos -> "1.290" (para inputs) */
export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

/** "1.290,00" | "1290.00" | "R$ 1.290" -> centavos. Retorna null se invalido. */
export function parseBRLToCents(raw: string): number | null {
  const cleaned = raw.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return null;

  let normalized = cleaned;
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  if (lastComma > lastDot) {
    // formato pt-BR: 1.290,00
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    // formato en-US: 1,290.00
    normalized = cleaned.replace(/,/g, "");
  } else {
    normalized = cleaned.replace(/[.,]/g, "");
  }

  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

export function formatRelativeDate(date: Date): string {
  const diff = Date.now() - date.getTime();
  const day = 86_400_000;

  if (diff < 3_600_000) {
    const min = Math.max(1, Math.floor(diff / 60_000));
    return `há ${min} min`;
  }
  if (diff < day) return `há ${Math.floor(diff / 3_600_000)} h`;

  if (diff < day * 30) {
    const days = Math.floor(diff / day);
    return `há ${days} ${days === 1 ? "dia" : "dias"}`;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Desconto percentual entre preco original e atual. */
export function discountPercent(
  priceCents: number,
  originalPriceCents?: number | null,
): number | null {
  if (!originalPriceCents || originalPriceCents <= priceCents) return null;
  return Math.round((1 - priceCents / originalPriceCents) * 100);
}

/**
 * Impede open redirect: so aceita caminhos internos.
 * "/painel" -> ok | "//evil.com" ou "https://evil.com" -> "/"
 */
export function safeRedirectPath(value: string | null | undefined, fallback = "/"): string {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
