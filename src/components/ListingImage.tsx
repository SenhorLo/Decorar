import Image from "next/image";

import { ProductPlate } from "@/components/ProductPlate";
import { isGeneratedArt, parseArtUrl } from "@/lib/art";

/**
 * Uma imagem de anúncio pode ser:
 *  - "art:<categoria>#<seed>"  -> placa ilustrada gerada por código
 *  - "/uploads/..."            -> foto real enviada pelo usuário
 */
export function ListingImage({
  url,
  alt,
  category,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  className,
}: {
  url: string | undefined | null;
  alt: string;
  category: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (!url || isGeneratedArt(url)) {
    const parsed = url ? parseArtUrl(url) : { category, seed: alt };
    return (
      <ProductPlate
        category={parsed.category || category}
        seed={parsed.seed}
        className={className}
      />
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className ?? "object-cover"}
    />
  );
}
