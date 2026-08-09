import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { MAX_FILES_PER_LISTING, saveImage } from "@/lib/uploads";

export const runtime = "nodejs";

/**
 * Upload de imagens de anúncio.
 *
 * Exige sessão válida, limita volume por usuário e valida cada arquivo por
 * magic bytes (ver lib/uploads). Devolve apenas as URLs públicas geradas
 * pelo servidor — o cliente nunca escolhe o caminho do arquivo.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Faça login para enviar imagens." }, { status: 401 });
  }

  const ip = await clientIp();
  const limit = rateLimit(`upload:${user.id}:${ip}`, {
    limit: 60,
    windowMs: 10 * 60 * 1000,
    blockMs: 5 * 60 * 1000,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Muitos envios seguidos. Aguarde alguns minutos." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Envio inválido." }, { status: 400 });
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (files.length > MAX_FILES_PER_LISTING) {
    return NextResponse.json(
      { error: `Envie no máximo ${MAX_FILES_PER_LISTING} imagens por vez.` },
      { status: 400 },
    );
  }

  const urls: string[] = [];
  for (const file of files) {
    const result = await saveImage(file);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    urls.push(result.url);
  }

  return NextResponse.json({ urls });
}
