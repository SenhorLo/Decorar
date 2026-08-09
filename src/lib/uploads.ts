import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_FILES_PER_LISTING = 8;

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

type Signature = { ext: string; mime: string; test: (b: Uint8Array) => boolean };

/**
 * Validacao por magic bytes: o `type` informado pelo browser e controlado
 * pelo cliente e nao pode ser a unica barreira contra upload de executaveis
 * ou SVG com script.
 */
const SIGNATURES: Signature[] = [
  {
    ext: "jpg",
    mime: "image/jpeg",
    test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "png",
    mime: "image/png",
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    ext: "webp",
    mime: "image/webp",
    test: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && // RIFF
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50, // WEBP
  },
  {
    ext: "avif",
    mime: "image/avif",
    test: (b) =>
      b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 && // ftyp
      b[8] === 0x61 && b[9] === 0x76 && b[10] === 0x69 && b[11] === 0x66, // avif
  },
];

export type SaveResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function saveImage(file: File): Promise<SaveResult> {
  if (!file || file.size === 0) return { ok: false, error: "Arquivo vazio." };

  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: `"${file.name}" passa de 5 MB.` };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length < 16) return { ok: false, error: "Arquivo inválido." };

  const signature = SIGNATURES.find((s) => s.test(bytes));
  if (!signature) {
    return {
      ok: false,
      error: `"${file.name}" não é uma imagem válida. Use JPG, PNG, WebP ou AVIF.`,
    };
  }

  // Nome gerado pelo servidor: o nome enviado pelo cliente nunca toca o disco.
  const now = new Date();
  const folder = path.join(
    UPLOAD_ROOT,
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, "0"),
  );
  await mkdir(folder, { recursive: true });

  const filename = `${randomUUID()}.${signature.ext}`;
  await writeFile(path.join(folder, filename), bytes);

  const url = `/uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${filename}`;
  return { ok: true, url };
}

/**
 * Remove um arquivo enviado. Só aceita URLs sob /uploads/ e resolve o caminho
 * para garantir que nao escape do diretorio (path traversal).
 */
export async function deleteUpload(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;

  const target = path.resolve(path.join(process.cwd(), "public", url));
  if (!target.startsWith(path.resolve(UPLOAD_ROOT) + path.sep)) return;

  await unlink(target).catch(() => undefined);
}
