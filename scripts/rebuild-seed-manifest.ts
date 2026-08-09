/**
 * Reconstrói prisma/seed-images.json a partir do que existe em
 * public/uploads/seed.
 *
 * Serve para curadoria manual: apague os arquivos ruins, rode este script e
 * o manifesto passa a refletir só o que sobrou. Anúncios que ficarem sem
 * nenhuma foto voltam a usar a placa ilustrada.
 *
 * Uso:  npm run seed:manifest
 */
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SEED_DIR = path.join(process.cwd(), "public", "uploads", "seed");
const MANIFEST = path.join(process.cwd(), "prisma", "seed-images.json");

async function main() {
  const files = (await readdir(SEED_DIR))
    .filter((name) => name.endsWith(".jpg"))
    .sort();

  const manifest: Record<string, string[]> = {};

  for (const file of files) {
    // "tapete-kilim-turco-2-00-1-40-m-2.jpg" -> slug + índice no fim
    const base = file.replace(/\.jpg$/, "");
    const slug = base.replace(/-\d+$/, "");

    (manifest[slug] ??= []).push(`/uploads/seed/${file}`);
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const listings = Object.keys(manifest).length;
  console.log(`✓ manifesto reconstruído: ${files.length} imagens em ${listings} anúncios`);
  for (const [slug, urls] of Object.entries(manifest)) {
    console.log(`  ${String(urls.length)}  ${slug}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
