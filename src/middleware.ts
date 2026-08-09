import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySession } from "@/lib/session";

/** Rotas que exigem sessao. */
const PROTECTED = ["/painel", "/anuncios/novo", "/favoritos"];

/** Rotas que um usuario logado nao deveria ver. */
const GUEST_ONLY = ["/login", "/cadastro"];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;

    const response = NextResponse.redirect(url);
    // Cookie invalido/expirado: limpa para nao ficar em loop.
    if (token) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (session && GUEST_ONLY.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/painel";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Tudo, menos assets estaticos e a pasta de uploads.
     * A verificacao real de permissao acontece de novo no servidor
     * (requireUser / checagem de dono) — middleware e apenas a primeira camada.
     */
    "/((?!_next/static|_next/image|uploads|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|txt|xml)$).*)",
  ],
};
