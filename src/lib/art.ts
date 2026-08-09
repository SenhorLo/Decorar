/**
 * Convenção das imagens ilustrativas geradas por código.
 * Fica fora dos componentes para poder ser importada por Server Actions
 * sem arrastar React/next-image para o bundle do servidor.
 */
export const ART_PREFIX = "art:";

export function isGeneratedArt(url: string): boolean {
  return url.startsWith(ART_PREFIX);
}

/** `art:iluminacao#4` */
export function artUrl(category: string, seed: string | number): string {
  return `${ART_PREFIX}${category}#${seed}`;
}

export function parseArtUrl(url: string): { category: string; seed: string } {
  const body = url.slice(ART_PREFIX.length);
  const [category = "", seed = ""] = body.split("#");
  return { category, seed };
}
