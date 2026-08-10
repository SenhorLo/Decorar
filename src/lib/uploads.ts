import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { del, put } from "@vercel/blob";

import { isBlobUrl, isLocalUploadUrl } from "@/lib/upload-urls";

/**
 * 4 MB, nao 5.
 *
 * Uma Vercel Function aceita no maximo ~4,5 MB de corpo na requisicao. Como o
 * arquivo passa pelo servidor antes de ir para o Blob, o limite da plataforma
 * e o teto real — e um 413 ali chega ao cliente como HTML, nao JSON.
 * O cliente tambem envia um arquivo por requisicao, para o total nunca somar.
 */
export const MAX_FILE_BYTES = 4 * 1024 * 1024;
export const MAX_FILE_MB = 4;
export const MAX_FILES_PER_LISTING = 8;

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

/**
 * Em produção (Vercel) o sistema de arquivos é somente-leitura e efêmero:
 * gravar em public/ falha, e o que fosse gravado sumiria no próximo deploy.
 * Com o token presente usamos o Vercel Blob; sem ele, disco local — assim o
 * desenvolvimento continua funcionando offline, sem conta nem token.
 */
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const useBlob = Boolean(BLOB_TOKEN);

/**
 * Na Vercel o disco e somente-leitura. Sem o Blob conectado, tentar gravar
 * lanca EROFS e o usuario recebe um erro generico de rede — melhor detectar
 * a configuracao faltando e dizer exatamente o que fazer.
 */
const isServerless = Boolean(process.env.VERCEL);

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
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return {
      ok: false,
      error: `"${file.name}" tem ${mb} MB e o limite é ${MAX_FILE_MB} MB.`,
    };
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

  // Nome gerado pelo servidor: o nome enviado pelo cliente nunca vira caminho.
  const now = new Date();
  const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const filename = `${randomUUID()}.${signature.ext}`;

  if (useBlob) {
    try {
      const blob = await put(`uploads/${folder}/${filename}`, Buffer.from(bytes), {
        access: "public",
        contentType: signature.mime,
        token: BLOB_TOKEN,
        // O nome já é um UUID; sufixo aleatório extra só sujaria a URL.
        addRandomSuffix: false,
      });
      return { ok: true, url: blob.url };
    } catch (error) {
      console.error("[uploads] falha ao gravar no Vercel Blob:", error);
      return { ok: false, error: "Não foi possível salvar a imagem. Tente de novo." };
    }
  }

  // Sem Blob em ambiente serverless não há onde gravar. Falhar aqui, com o
  // motivo exato, evita um EROFS disfarçado de erro de conexão.
  if (isServerless) {
    console.error(
      "[uploads] BLOB_READ_WRITE_TOKEN ausente em ambiente serverless — conecte um Blob Store ao projeto.",
    );
    return {
      ok: false,
      error:
        "O armazenamento de imagens não está configurado neste ambiente. " +
        "Conecte um Blob Store ao projeto na Vercel (Storage → Blob).",
    };
  }

  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);

  return { ok: true, url: `/uploads/${folder}/${filename}` };
}

export { isBlobUrl, isLocalUploadUrl, isManagedUploadUrl } from "@/lib/upload-urls";

/**
 * Remove um arquivo enviado. Só aceita URLs que nós geramos, e no caso local
 * resolve o caminho para garantir que não escape do diretório (path traversal).
 */
export async function deleteUpload(url: string): Promise<void> {
  if (isBlobUrl(url)) {
    await del(url, { token: BLOB_TOKEN }).catch(() => undefined);
    return;
  }

  if (!isLocalUploadUrl(url)) return;

  const target = path.resolve(path.join(process.cwd(), "public", url));
  if (!target.startsWith(path.resolve(UPLOAD_ROOT) + path.sep)) return;

  await unlink(target).catch(() => undefined);
}
