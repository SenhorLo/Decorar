/**
 * Baixa fotos reais para os anúncios do seed.
 *
 * Fonte: Openverse (agregador do WordPress). Filtramos por CC0 / domínio
 * público para não haver exigência de atribuição, e as imagens ficam salvas
 * localmente em public/uploads/seed — a aplicação não depende de CDN em runtime.
 *
 * Uso:  npm run seed:images
 * Depois:  npm run db:seed
 */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const COMBINING = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(COMBINING, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Título do anúncio no seed -> termo de busca em inglês. */
const QUERIES: Record<string, string> = {
  "Poltrona Mole em jacarandá restaurada": "leather armchair living room",
  "Mesa de jantar em freijó maciço para 8 lugares": "wooden dining table chairs",
  "Luminária de piso em latão escovado": "floor lamp living room corner",
  "Par de espelhos redondos com moldura de palhinha": "mirror hanging on wall room",
  "Estante modular em cedro com seis nichos": "wooden bookshelf shelves books",
  "Cadeiras Bertoia originais — jogo com 4": "dining room interior chairs",
  "Sofá de três lugares em linho areia": "beige linen sofa living room",
  "Aparador anos 60 em imbuia com pés palito": "wooden sideboard cabinet interior",
  "Escrivaninha compacta em carvalho claro": "wooden desk home office",
  "Tapete kilim turco 2,00 × 1,40 m": "patterned rug living room floor",
  "Luminária pendente em vidro soprado âmbar": "pendant light glass hanging lamp",
  "Cama queen com cabeceira estofada em veludo verde": "bed headboard bedroom interior",
  "Conjunto de três vasos em cerâmica fosca": "ceramic vases table decor",
  "Quadro abstrato original 90 × 70 cm": "framed art print wall",
  "Cadeira de balanço em rattan natural": "rattan chair porch",
  "Arandelas de latão anos 70 — par": "wall sconce lamp interior",
  "Abajur em vidro fumê com base cônica": "table lamp bedside nightstand",
  "Baú de viagem restaurado como mesa de centro": "vintage trunk coffee table",
  "Manta de lã merino tecida à mão": "wool blanket throw textile",
};

/** Termos mais genéricos, usados quando a busca específica não rende o bastante. */
const FALLBACK_QUERIES: Record<string, string> = {
  "Luminária de piso em latão escovado": "lamp interior",
  "Par de espelhos redondos com moldura de palhinha": "bathroom mirror interior",
  "Estante modular em cedro com seis nichos": "bookshelf",
  "Cadeiras Bertoia originais — jogo com 4": "dining room interior",
  "Sofá de três lugares em linho areia": "sofa couch",
  "Aparador anos 60 em imbuia com pés palito": "wooden cabinet drawers",
  "Escrivaninha compacta em carvalho claro": "desk office",
  "Tapete kilim turco 2,00 × 1,40 m": "carpet rug",
  "Luminária pendente em vidro soprado âmbar": "hanging lamp",
  "Conjunto de três vasos em cerâmica fosca": "vase pottery",
  "Cadeira de balanço em rattan natural": "wicker chair",
  "Arandelas de latão anos 70 — par": "wall lamp",
  "Abajur em vidro fumê com base cônica": "lamp shade table",
  "Baú de viagem restaurado como mesa de centro": "wooden chest trunk",
  "Manta de lã merino tecida à mão": "wool textile fabric",
};

const IMAGES_PER_LISTING = 3;
const OUT_DIR = path.join(process.cwd(), "public", "uploads", "seed");
const MANIFEST = path.join(process.cwd(), "prisma", "seed-images.json");
const UA = "Decorar-MVP/1.0 (projeto educacional)";

type OpenverseImage = {
  id: string;
  title: string;
  url: string;
  width: number;
  height: number;
  license: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function search(
  query: string,
  licenses: string,
  { wideOnly = true }: { wideOnly?: boolean } = {},
): Promise<OpenverseImage[]> {
  const params = new URLSearchParams({
    q: query,
    page_size: "20",
    size: "large",
    license: licenses,
    mature: "false",
    ...(wideOnly ? { aspect_ratio: "wide" } : {}),
  });

  const response = await fetch(`https://api.openverse.org/v1/images/?${params}`, {
    headers: { "User-Agent": UA },
  });

  if (!response.ok) return [];

  const data = (await response.json()) as { results?: OpenverseImage[] };
  return data.results ?? [];
}

/** Descarta ilustração/clipart e formatos que quebrariam o card. */
function usable(image: OpenverseImage): boolean {
  if (!image.url || !image.width || !image.height) return false;
  if (image.width < 800) return false;

  // Precisa ser paisagem para não distorcer o card 4:3, mas sem exigir
  // proporção exata — o CSS faz object-cover.
  const ratio = image.width / image.height;
  if (ratio < 1.05 || ratio > 2.1) return false;

  const title = image.title?.toLowerCase() ?? "";
  return !["clipart", "png sticker", "illustration", "vector", "icon", "logo"].some((bad) =>
    title.includes(bad),
  );
}

/**
 * Baixa e normaliza: recorta para 4:3 (a proporção do card), reduz para
 * 1600px e grava sempre como JPEG. Sem isso o acervo vira uma mistura de
 * WebP/PNG de 5000px com proporções variadas.
 */
async function download(url: string, dest: string): Promise<boolean> {
  try {
    const response = await fetch(url, { headers: { "User-Agent": UA } });
    if (!response.ok) return false;

    const type = response.headers.get("content-type") ?? "";
    if (!type.startsWith("image/")) return false;

    const source = Buffer.from(await response.arrayBuffer());
    if (source.length < 20_000) return false; // provavelmente um placeholder de erro

    const normalized = await sharp(source)
      .rotate() // respeita o EXIF antes de recortar
      .resize(1600, 1200, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    await writeFile(dest, normalized);
    return true;
  } catch {
    return false;
  }
}

/** Manifesto anterior, para poder retomar de onde parou. */
async function loadManifest(): Promise<Record<string, string[]>> {
  try {
    return JSON.parse(await readFile(MANIFEST, "utf8")) as Record<string, string[]>;
  } catch {
    return {};
  }
}

async function stillOnDisk(urls: string[]): Promise<boolean> {
  for (const url of urls) {
    try {
      await access(path.join(process.cwd(), "public", url));
    } catch {
      return false;
    }
  }
  return urls.length > 0;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // --only=<slug>  refaz a busca de um anúncio específico
  // --top-up       completa até IMAGES_PER_LISTING (por padrão só preenche vazios,
  //                para não desfazer a curadoria manual)
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
  const topUp = process.argv.includes("--top-up");

  const manifest = await loadManifest();
  const titles = Object.keys(QUERIES);

  for (const [index, title] of titles.entries()) {
    const query = QUERIES[title]!;
    const slug = slugify(title);

    if (only && slug !== only) continue;

    const existing = only === slug ? [] : (manifest[slug] ?? []);
    const enough = topUp ? IMAGES_PER_LISTING : 1;

    if (existing.length >= enough && (await stillOnDisk(existing))) {
      console.log(
        `[${String(index + 1).padStart(2, "0")}/${titles.length}] já baixado    ${title}`,
      );
      continue;
    }

    // Tentativas em ordem crescente de permissividade: primeiro domínio
    // público com o termo específico, depois licenças CC-BY, depois um termo
    // genérico e sem restrição de proporção.
    const attempts: Array<[string, string, { wideOnly?: boolean }]> = [
      [query, "cc0,pdm", {}],
      [query, "cc0,pdm,by,by-sa", {}],
      [FALLBACK_QUERIES[title] ?? query, "cc0,pdm,by,by-sa", {}],
      [FALLBACK_QUERIES[title] ?? query, "cc0,pdm,by,by-sa", { wideOnly: false }],
    ];

    const candidates: OpenverseImage[] = [];
    const seen = new Set<string>();

    for (const [term, licenses, options] of attempts) {
      if (candidates.length >= IMAGES_PER_LISTING) break;

      for (const image of (await search(term, licenses, options)).filter(usable)) {
        if (seen.has(image.id)) continue;
        seen.add(image.id);
        candidates.push(image);
      }

      await sleep(350);
    }

    const saved: string[] = [];
    for (const candidate of candidates) {
      if (saved.length >= IMAGES_PER_LISTING) break;

      const filename = `${slug}-${saved.length + 1}.jpg`;
      const ok = await download(candidate.url, path.join(OUT_DIR, filename));
      if (ok) saved.push(`/uploads/seed/${filename}`);

      await sleep(250);
    }

    // Nunca piora o resultado anterior: uma rodada que rendeu menos (429 na
    // API, por exemplo) mantém o que já havia sido baixado.
    manifest[slug] = saved.length >= existing.length ? saved : existing;
    console.log(
      `[${String(index + 1).padStart(2, "0")}/${titles.length}] ${saved.length}/${IMAGES_PER_LISTING}  ${title}`,
    );

    await sleep(500);
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const total = Object.values(manifest).reduce((sum, list) => sum + list.length, 0);
  const missing = Object.entries(manifest).filter(([, list]) => list.length === 0);

  console.log(`\n✓ ${total} imagens salvas em public/uploads/seed`);
  console.log(`  manifesto: prisma/seed-images.json`);
  if (missing.length) {
    console.log(`  ⚠ sem foto (usarão a placa ilustrada): ${missing.map(([s]) => s).join(", ")}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
