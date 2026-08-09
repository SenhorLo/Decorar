/**
 * Popula o banco com um catálogo de demonstração.
 * Rode com:  npm run db:seed   (ou npm run db:reset para zerar antes)
 */
import { access, readFile } from "node:fs/promises";
import path from "node:path";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Fotos reais baixadas por `npm run seed:images` (public/uploads/seed).
 * Se o manifesto não existir, o anúncio cai na placa ilustrada `art:`.
 */
async function loadPhotos(): Promise<Record<string, string[]>> {
  let manifest: Record<string, string[]>;

  try {
    const raw = await readFile(path.join(process.cwd(), "prisma", "seed-images.json"), "utf8");
    manifest = JSON.parse(raw) as Record<string, string[]>;
  } catch {
    console.warn(
      "⚠ prisma/seed-images.json não encontrado — rode `npm run seed:images` para usar fotos reais.",
    );
    return {};
  }

  // O manifesto pode citar arquivos que não vieram no clone ou foram apagados
  // na curadoria. Referenciar um deles produziria imagem quebrada no anúncio,
  // então conferimos o disco antes e deixamos o resto cair na placa ilustrada.
  const existentes: Record<string, string[]> = {};
  let ausentes = 0;

  for (const [slug, urls] of Object.entries(manifest)) {
    const disponiveis: string[] = [];

    for (const url of urls) {
      try {
        await access(path.join(process.cwd(), "public", url));
        disponiveis.push(url);
      } catch {
        ausentes++;
      }
    }

    if (disponiveis.length) existentes[slug] = disponiveis;
  }

  if (ausentes > 0) {
    console.warn(
      `⚠ ${ausentes} imagem(ns) do manifesto não estão em disco — esses anúncios usarão a placa ilustrada.`,
    );
  }

  return existentes;
}

const COMBINING = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(value: string): string {
  return value.normalize("NFD").replace(COMBINING, "").toLowerCase().trim();
}

function slugify(value: string): string {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

type SeedListing = {
  title: string;
  description: string;
  price: number;
  original?: number;
  category: string;
  condition: string;
  material?: string;
  color?: string;
  brand?: string;
  city: string;
  state: string;
  negotiable?: boolean;
  delivery?: boolean;
  views?: number;
};

const SELLERS = [
  {
    name: "Helena Rocha",
    email: "helena@decorar.test",
    city: "Curitiba",
    state: "PR",
    phone: "41988887777",
    bio: "Arquiteta. Vendo peças de projetos entregues e do meu próprio acervo.",
    store: {
      name: "Atelier Helena",
      tagline: "Mobiliário autoral e peças de projeto",
      description:
        "Trabalho com móveis de projeto que sobraram de obras entregues e com garimpo de peças modernistas brasileiras. Tudo com procedência documentada.",
      instagram: "atelierhelena",
      whatsapp: "41988887777",
    },
  },
  {
    name: "Tomás Aguiar",
    email: "tomas@decorar.test",
    city: "São Paulo",
    state: "SP",
    phone: "11977776666",
    bio: "Designer de produto. Garimpo, restauro e revendo clássicos.",
    store: {
      name: "Marcenaria 9",
      tagline: "Restauro de clássicos dos anos 50 e 60",
      description:
        "Oficina de restauro em Pinheiros. Cada peça passa por revisão estrutural, tratamento da madeira e novo estofamento antes de ir para o anúncio.",
      instagram: "marcenaria9",
      whatsapp: "11977776666",
    },
  },
  {
    name: "Júlia Mendes",
    email: "julia@decorar.test",
    city: "Belo Horizonte",
    state: "MG",
    phone: "31966665555",
    bio: "Mudando de apartamento — desapegando aos poucos.",
    store: null,
  },
  {
    name: "Rafael Nunes",
    email: "rafael@decorar.test",
    city: "Porto Alegre",
    state: "RS",
    phone: "51955554444",
    bio: "Colecionador de iluminação e objetos de vidro.",
    store: null,
  },
];

const LISTINGS: SeedListing[][] = [
  // --- Helena (Curitiba/PR) ---
  [
    {
      title: "Poltrona Mole em jacarandá restaurada",
      description:
        "Poltrona Mole original dos anos 60, projeto de Sergio Rodrigues. Estrutura em jacarandá com encaixes revisados por marceneiro e couro caramelo trocado no ano passado. Marcas leves de uso na madeira, coerentes com a idade da peça. Documentação de procedência disponível. Retirada em Curitiba, no bairro Batel.",
      price: 1480000,
      original: 1890000,
      category: "sofas-e-poltronas",
      condition: "RESTAURADO",
      material: "Madeira maciça",
      color: "Caramelo",
      brand: "Oca",
      city: "Curitiba",
      state: "PR",
      delivery: true,
      views: 412,
    },
    {
      title: "Mesa de jantar em freijó maciço para 8 lugares",
      description:
        "Tampo de freijó maciço com 2,40 m por 1,00 m, base em aço com pintura eletrostática preta. Peça de projeto, usada por três anos em residência sem crianças. Sem trincas, sem empenamento. Acompanha um jogo de feltros para a base. A retirada precisa de duas pessoas.",
      price: 890000,
      category: "mesas-e-cadeiras",
      condition: "SEMINOVO",
      material: "Madeira maciça",
      color: "Mel",
      city: "Curitiba",
      state: "PR",
      negotiable: true,
      delivery: true,
      views: 268,
    },
    {
      title: "Luminária de piso em latão escovado",
      description:
        "Luminária de leitura com haste em latão escovado e cúpula em linho cru. Altura regulável de 1,40 m a 1,70 m. Fiação revisada e plugue novo. Lâmpada não inclusa. Ideal para canto de poltrona.",
      price: 129000,
      original: 168000,
      category: "iluminacao",
      condition: "SEMINOVO",
      material: "Metal",
      color: "Latão",
      city: "Curitiba",
      state: "PR",
      views: 197,
    },
    {
      title: "Par de espelhos redondos com moldura de palhinha",
      description:
        "Dois espelhos de 60 cm de diâmetro com moldura em rattan natural trançado à mão. Comprados para um projeto que mudou de direção — nunca foram instalados. Ainda com o plástico de fábrica no verso.",
      price: 78000,
      category: "espelhos",
      condition: "NOVO",
      material: "Rattan / Palhinha",
      color: "Natural",
      city: "Curitiba",
      state: "PR",
      delivery: true,
      views: 143,
    },
    {
      title: "Estante modular em cedro com seis nichos",
      description:
        "Estante de cedro com seis nichos abertos, 1,80 m de altura por 1,20 m de largura. Acabamento em óleo natural, fácil de retocar. Desmonta em três módulos para transporte. Vendo por mudança de escritório.",
      price: 265000,
      category: "armarios-e-estantes",
      condition: "USADO",
      material: "Madeira maciça",
      color: "Cedro",
      city: "Curitiba",
      state: "PR",
      negotiable: true,
      views: 88,
    },
  ],

  // --- Tomás (São Paulo/SP) ---
  [
    {
      title: "Cadeiras Bertoia originais — jogo com 4",
      description:
        "Quatro cadeiras Bertoia Diamond originais Knoll, estrutura cromada e almofadas em lã cinza refeitas por tapeceiro. Uma das cadeiras tem um ponto de oxidação discreto na base traseira, fotografado. Vendo o jogo completo, não separo.",
      price: 1240000,
      original: 1620000,
      category: "mesas-e-cadeiras",
      condition: "RESTAURADO",
      material: "Metal",
      color: "Cromado",
      brand: "Knoll",
      city: "São Paulo",
      state: "SP",
      delivery: true,
      views: 531,
    },
    {
      title: "Sofá de três lugares em linho areia",
      description:
        "Sofá reto de 2,20 m com estrutura em eucalipto certificado, assentos em espuma D33 e revestimento em linho areia com tratamento antimanchas. Dois anos de uso em sala de estar. Higienização profissional feita na semana passada. Capas removíveis e laváveis.",
      price: 420000,
      category: "sofas-e-poltronas",
      condition: "SEMINOVO",
      material: "Linho",
      color: "Areia",
      city: "São Paulo",
      state: "SP",
      negotiable: true,
      delivery: true,
      views: 389,
    },
    {
      title: "Aparador anos 60 em imbuia com pés palito",
      description:
        "Aparador de 1,60 m em imbuia, quatro portas com puxadores originais em latão e pés palito. Restaurei a estrutura e apliquei goma-laca. Interior forrado com feltro novo. Peça de garimpo em leilão de espólio, sem marca identificada.",
      price: 580000,
      category: "vintage-e-garimpo",
      condition: "RESTAURADO",
      material: "Madeira maciça",
      color: "Imbuia",
      city: "São Paulo",
      state: "SP",
      views: 302,
    },
    {
      title: "Escrivaninha compacta em carvalho claro",
      description:
        "Escrivaninha de 1,10 m por 55 cm com duas gavetas e passagem de cabos no tampo. Perfeita para apartamento pequeno ou home office. Usada por um ano, sem marcas relevantes. Cadeira não inclusa.",
      price: 148000,
      original: 189000,
      category: "escritorio",
      condition: "SEMINOVO",
      material: "MDF",
      color: "Carvalho",
      city: "São Paulo",
      state: "SP",
      delivery: true,
      views: 221,
    },
    {
      title: "Tapete kilim turco 2,00 × 1,40 m",
      description:
        "Kilim turco tecido à mão em lã, tons de terracota e verde-oliva. Comprado em Istambul em 2019. Uma das pontas tem franja levemente desgastada, o resto está impecável. Lavado a seco antes do anúncio.",
      price: 320000,
      category: "tapetes-e-texteis",
      condition: "USADO",
      material: "Outro",
      color: "Terracota",
      city: "São Paulo",
      state: "SP",
      negotiable: true,
      views: 176,
    },
    {
      title: "Luminária pendente em vidro soprado âmbar",
      description:
        "Pendente artesanal de vidro soprado âmbar, 28 cm de diâmetro, com canopla e cabo têxtil de 1,50 m. Feito por vidraria de Poços de Caldas. Nunca instalado — sobrou de um projeto.",
      price: 92000,
      category: "iluminacao",
      condition: "NOVO",
      material: "Vidro",
      color: "Âmbar",
      city: "São Paulo",
      state: "SP",
      views: 154,
    },
  ],

  // --- Júlia (Belo Horizonte/MG) ---
  [
    {
      title: "Cama queen com cabeceira estofada em veludo verde",
      description:
        "Cama queen size completa: estrutura em madeira, cabeceira estofada em veludo verde-musgo de 1,60 m e sapatas em madeira torneada. Três anos de uso, sem manchas nem rasgos. Colchão não incluso. Desmonto para a retirada.",
      price: 218000,
      original: 289000,
      category: "camas-e-colchoes",
      condition: "USADO",
      material: "Veludo",
      color: "Verde",
      city: "Belo Horizonte",
      state: "MG",
      negotiable: true,
      views: 264,
    },
    {
      title: "Conjunto de três vasos em cerâmica fosca",
      description:
        "Trio de vasos artesanais em cerâmica fosca — 32 cm, 24 cm e 18 cm de altura. Tons off-white e areia. Comprados de uma ceramista de Tiradentes. Sem trincas ou lascas. Vendo o conjunto.",
      price: 46000,
      category: "vasos-e-objetos",
      condition: "SEMINOVO",
      material: "Cerâmica",
      color: "Off-white",
      city: "Belo Horizonte",
      state: "MG",
      views: 119,
    },
    {
      title: "Quadro abstrato original 90 × 70 cm",
      description:
        "Acrílica sobre tela de artista mineira, assinado e datado de 2021. Paleta em ocre, verde-seco e branco. Moldura flutuante em madeira clara já instalada, pronto para pendurar. Certificado do artista incluso.",
      price: 175000,
      category: "arte-e-quadros",
      condition: "SEMINOVO",
      color: "Ocre",
      city: "Belo Horizonte",
      state: "MG",
      views: 208,
    },
    {
      title: "Cadeira de balanço em rattan natural",
      description:
        "Cadeira de balanço com estrutura em madeira e trançado em rattan natural. Usada na varanda, sempre coberta. O trançado está firme, sem fios soltos. Almofada de assento em lona crua acompanha.",
      price: 98000,
      category: "area-externa",
      condition: "USADO",
      material: "Rattan / Palhinha",
      color: "Natural",
      city: "Belo Horizonte",
      state: "MG",
      views: 97,
    },
  ],

  // --- Rafael (Porto Alegre/RS) ---
  [
    {
      title: "Arandelas de latão anos 70 — par",
      description:
        "Par de arandelas de parede em latão maciço com cúpula ajustável, década de 70. Fiação totalmente refeita e soquetes novos. O latão está com pátina natural preservada — não poli, porque é ela que dá o caráter da peça.",
      price: 138000,
      category: "vintage-e-garimpo",
      condition: "RESTAURADO",
      material: "Metal",
      color: "Latão",
      city: "Porto Alegre",
      state: "RS",
      views: 186,
    },
    {
      title: "Abajur em vidro fumê com base cônica",
      description:
        "Abajur de mesa em vidro fumê, base cônica e cúpula em tecido cru, 48 cm de altura. Dimmer no cabo. Peça de acervo pessoal, pouquíssimo uso. Embalagem original preservada.",
      price: 64000,
      original: 82000,
      category: "iluminacao",
      condition: "SEMINOVO",
      material: "Vidro",
      color: "Fumê",
      city: "Porto Alegre",
      state: "RS",
      delivery: true,
      views: 132,
    },
    {
      title: "Baú de viagem restaurado como mesa de centro",
      description:
        "Baú de viagem dos anos 40 em madeira e metal, restaurado para uso como mesa de centro. Interior forrado com tecido novo e serve de armazenamento. Ferragens originais, tratadas contra ferrugem. 90 × 50 × 45 cm.",
      price: 156000,
      category: "vintage-e-garimpo",
      condition: "RESTAURADO",
      material: "Madeira maciça",
      color: "Marrom",
      city: "Porto Alegre",
      state: "RS",
      negotiable: true,
      views: 173,
    },
    {
      title: "Manta de lã merino tecida à mão",
      description:
        "Manta de lã merino 1,80 × 1,20 m, tecida em tear manual por artesã da serra gaúcha. Tons de cru e caramelo com franjas trançadas. Usada duas vezes. Lavagem a seco recomendada.",
      price: 52000,
      category: "tapetes-e-texteis",
      condition: "SEMINOVO",
      material: "Outro",
      color: "Cru",
      city: "Porto Alegre",
      state: "RS",
      views: 74,
    },
  ],
];

async function main() {
  const photos = await loadPhotos();

  console.log("→ Limpando dados anteriores…");
  await prisma.favorite.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("decorar123", 12);
  let listingCount = 0;

  for (const [index, seller] of SELLERS.entries()) {
    const user = await prisma.user.create({
      data: {
        name: seller.name,
        email: seller.email,
        passwordHash,
        city: seller.city,
        state: seller.state,
        phone: seller.phone,
        bio: seller.bio,
      },
    });

    if (seller.store) {
      await prisma.store.create({
        data: {
          ownerId: user.id,
          name: seller.store.name,
          slug: slugify(seller.store.name),
          tagline: seller.store.tagline,
          description: seller.store.description,
          instagram: seller.store.instagram,
          whatsapp: seller.store.whatsapp,
          city: seller.city,
          state: seller.state,
        },
      });
    }

    for (const [i, item] of (LISTINGS[index] ?? []).entries()) {
      const searchIndex = normalize(
        [item.title, item.description, item.brand, item.material, item.color, item.city]
          .filter(Boolean)
          .join(" "),
      ).slice(0, 4000);

      // Datas escalonadas para "Mais recentes" ter alguma variação.
      const createdAt = new Date(Date.now() - (index * 5 + i) * 36 * 60 * 60 * 1000);

      const slug = slugify(item.title);
      const urls = photos[slug]?.length
        ? photos[slug]!
        : // Sem foto baixada: usa a placa ilustrada gerada em runtime.
          [`art:${item.category}#${slug}`, `art:${item.category}#${slug}-b`];

      await prisma.listing.create({
        data: {
          sellerId: user.id,
          title: item.title,
          description: item.description,
          priceCents: item.price,
          originalPriceCents: item.original ?? null,
          category: item.category,
          condition: item.condition,
          material: item.material ?? null,
          color: item.color ?? null,
          brand: item.brand ?? null,
          city: item.city,
          state: item.state,
          status: "ATIVO",
          negotiable: item.negotiable ?? false,
          deliveryAvailable: item.delivery ?? false,
          views: item.views ?? 0,
          searchIndex,
          createdAt,
          updatedAt: createdAt,
          images: {
            create: urls.map((url, position) => ({
              url,
              alt: item.title,
              position,
            })),
          },
        },
      });

      listingCount++;
    }
  }

  console.log(`✓ ${SELLERS.length} usuários, ${listingCount} anúncios criados.`);
  console.log("\n  Login de teste:");
  console.log("  e-mail : helena@decorar.test");
  console.log("  senha  : decorar123\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
