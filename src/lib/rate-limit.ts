import "server-only";

import { headers } from "next/headers";

/**
 * Rate limit em memoria (janela deslizante).
 *
 * Suficiente para o MVP em instancia unica. Em producao com multiplas
 * instancias, trocar o Map por Redis/Upstash mantendo a mesma assinatura.
 */
type Bucket = { hits: number[]; blockedUntil?: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  /** Segundos ate poder tentar de novo. */
  retryAfter: number;
  remaining: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs, blockMs = windowMs }: { limit: number; windowMs: number; blockMs?: number },
): RateLimitResult {
  const now = Date.now();

  // Poda simples para nao crescer sem limite.
  if (buckets.size > MAX_KEYS) {
    for (const [k, b] of buckets) {
      const last = b.hits[b.hits.length - 1] ?? 0;
      if (now - last > windowMs * 4 && (b.blockedUntil ?? 0) < now) buckets.delete(k);
      if (buckets.size <= MAX_KEYS / 2) break;
    }
  }

  const bucket = buckets.get(key) ?? { hits: [] };

  if (bucket.blockedUntil && bucket.blockedUntil > now) {
    return {
      ok: false,
      retryAfter: Math.ceil((bucket.blockedUntil - now) / 1000),
      remaining: 0,
    };
  }

  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    bucket.blockedUntil = now + blockMs;
    buckets.set(key, bucket);
    return { ok: false, retryAfter: Math.ceil(blockMs / 1000), remaining: 0 };
  }

  bucket.hits.push(now);
  bucket.blockedUntil = undefined;
  buckets.set(key, bucket);

  return { ok: true, retryAfter: 0, remaining: limit - bucket.hits.length };
}

/** Zera o contador apos uma acao bem-sucedida (ex.: login correto). */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/**
 * IP do cliente, usado como chave de quase todo limite deste projeto.
 *
 * `x-forwarded-for` é um cabeçalho comum de requisição: qualquer cliente pode
 * enviá-lo. Confiar nele sem mais nada significa que basta variar o valor a
 * cada tentativa para nunca esbarrar em limite nenhum.
 *
 * Na Vercel isso não acontece porque a borda reescreve `x-forwarded-for` e
 * publica `x-vercel-forwarded-for`, que o cliente não controla — por isso o
 * cabeçalho da plataforma vem primeiro. Fora dela, só confiamos no
 * encaminhado se a aplicação declarar que está atrás de um proxy confiável,
 * via TRUST_PROXY_HEADERS=1. Sem essa declaração, cai para uma chave fixa:
 * o limite fica global em vez de por IP — mais restritivo, nunca mais frouxo.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();

  // Definido pela borda da Vercel; não pode ser forjado pelo cliente.
  const vercel = h.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0]!.trim();

  // Em desenvolvimento não há borda na frente, e uma chave única faria todo
  // limite virar global — oito tentativas de login por quinze minutos para a
  // máquina inteira, inviabilizando qualquer teste.
  const confiaNoEncaminhado =
    process.env.TRUST_PROXY_HEADERS === "1" || process.env.NODE_ENV !== "production";

  if (confiaNoEncaminhado) {
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]!.trim();

    const real = h.get("x-real-ip");
    if (real) return real.trim();
  }

  return "sem-proxy-confiavel";
}
