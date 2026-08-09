import { NextResponse, type NextRequest } from "next/server";

import { destroySession } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * Encerra a sessão e manda para o login.
 *
 * Existe para quebrar um laço de redirecionamento: o middleware valida só a
 * assinatura do JWT, enquanto `requireUser` confere o usuário no banco. Um
 * token assinado corretamente cujo usuário foi removido (ou cuja
 * sessionVersion mudou) passaria pelo middleware e seria recusado na página,
 * que devolveria para /login — e o middleware, vendo o mesmo token "válido",
 * mandaria de volta para /painel, indefinidamente.
 *
 * Aqui o cookie é apagado antes do redirect, então o ciclo termina.
 */
export async function GET(request: NextRequest) {
  const next = safeRedirectPath(request.nextUrl.searchParams.get("next"), "/painel");

  await destroySession();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = next === "/" ? "" : `?next=${encodeURIComponent(next)}`;

  return NextResponse.redirect(url);
}
