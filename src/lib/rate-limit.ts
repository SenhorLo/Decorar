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
 * IP do cliente. Atras de proxy confiavel usa x-forwarded-for.
 * Cai para "local" quando indisponivel — o limite ainda vale por e-mail.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "local";
}
