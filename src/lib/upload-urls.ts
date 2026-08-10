/**
 * Validação de origem das imagens de anúncio.
 *
 * Fica separado de `uploads.ts` porque são checagens de string puras: não
 * dependem do SDK do Blob nem do sistema de arquivos, e assim podem ser
 * testadas e importadas sem arrastar `server-only` junto.
 */

/**
 * O Vercel Blob serve blobs públicos em `<id>.public.blob.vercel-storage.com`,
 * mas o subdomínio varia conforme o modo do store. Exigir literalmente
 * `.public.` fazia URLs válidas serem descartadas na criação do anúncio — o
 * upload funcionava e a peça nunca era publicada.
 *
 * A checagem segue fechada: o host precisa terminar exatamente em
 * `.blob.vercel-storage.com`, seguido de `/`. Assim
 * `x.blob.vercel-storage.com.invasor.com` não passa.
 */
const BLOB_HOST_RE = /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.blob\.vercel-storage\.com\//i;

export function isBlobUrl(url: string): boolean {
  return BLOB_HOST_RE.test(url);
}

export function isLocalUploadUrl(url: string): boolean {
  return url.startsWith("/uploads/") && !url.includes("..");
}

/** Aceita apenas URLs que o próprio servidor gerou. */
export function isManagedUploadUrl(url: string): boolean {
  return isLocalUploadUrl(url) || isBlobUrl(url);
}
