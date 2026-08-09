import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
  verifySession,
} from "@/lib/session";

const BCRYPT_ROUNDS = 12;

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  avatarUrl: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  bio: string | null;
  storeSlug: string | null;
  hasStore: boolean;
};

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Hash descartavel usado quando o e-mail nao existe, para que o tempo de
 * resposta do login seja parecido nos dois casos (mitiga user enumeration).
 */
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.4pM9k1nFYFqTzBvZuZ9m3PGa5Kx0N6y";

export async function fakePasswordCheck(plain: string): Promise<void> {
  await bcrypt.compare(plain, DUMMY_HASH).catch(() => false);
}

/**
 * Usuario da requisicao atual. Le o cookie, valida a assinatura do JWT e
 * confere no banco — um token valido de um usuario deletado ou com sessao
 * revogada (sessionVersion) e rejeitado.
 *
 * `cache` garante uma unica consulta por requisicao, mesmo com varios
 * componentes chamando.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const payload = await verifySession(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      city: true,
      state: true,
      phone: true,
      bio: true,
      sessionVersion: true,
      store: { select: { slug: true } },
    },
  });

  if (!user) return null;
  if (user.sessionVersion !== payload.ver) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === "ADMIN" ? "ADMIN" : "USER",
    avatarUrl: user.avatarUrl,
    city: user.city,
    state: user.state,
    phone: user.phone,
    bio: user.bio,
    storeSlug: user.store?.slug ?? null,
    hasStore: Boolean(user.store),
  };
});

/**
 * Guarda de servidor. O middleware ja bloqueia as rotas privadas, mas toda
 * pagina e Server Action revalida aqui — middleware sozinho nunca e garantia.
 *
 * Chegar aqui sem usuario significa cookie ausente OU token assinado cujo
 * usuario nao existe mais / foi revogado. Redirecionamos para /sair, que
 * limpa o cookie antes de mandar ao login — se fosse direto para /login, o
 * middleware veria o token ainda "valido" e devolveria para ca em laco.
 */
export async function requireUser(nextPath = "/painel"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/sair?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function startSession(user: {
  id: string;
  role: string;
  sessionVersion: number;
}): Promise<void> {
  const token = await signSession({
    uid: user.id,
    ver: user.sessionVersion,
    role: user.role === "ADMIN" ? "ADMIN" : "USER",
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions);
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
}
