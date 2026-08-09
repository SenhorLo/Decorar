import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Handshake,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { HeroScene } from "@/components/landing/HeroScene";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { Parallax } from "@/components/landing/Parallax";
import { ListingCard } from "@/components/ListingCard";
import { ProductPlate } from "@/components/ProductPlate";
import { Reveal } from "@/components/Reveal";
import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { categoryCounts, featuredListings } from "@/lib/listings";
import { CATEGORIES } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: Camera,
    title: "Fotografe e publique",
    text: "Suba até oito fotos, descreva a procedência e defina o preço. Seu anúncio fica no ar em poucos minutos.",
  },
  {
    icon: Handshake,
    title: "Negocie direto",
    text: "Sem intermediário e sem leilão. Quem se interessa fala com você, combina a retirada ou a entrega.",
  },
  {
    icon: BadgeCheck,
    title: "Dê uma segunda casa",
    text: "A peça sai do seu depósito e entra em outra história. Você recebe o valor cheio, sem taxa por venda.",
  },
];

const PILLARS = [
  {
    icon: Sparkles,
    title: "Curadoria, não catálogo",
    text: "Categorias pensadas por quem entende de interiores — do design assinado ao garimpo de feira.",
  },
  {
    icon: MapPin,
    title: "Perto de você",
    text: "Busca por cidade e estado. Móvel grande é logística: quem está próximo negocia melhor.",
  },
  {
    icon: ShieldCheck,
    title: "Contas protegidas",
    text: "Senhas com hash forte, sessões revogáveis e cada painel acessível só pelo dono.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Vendi a mesa de jantar da minha avó para alguém que restaura peças dos anos 60. Era exatamente o destino que eu queria para ela.",
    name: "Helena R.",
    role: "Arquiteta · Curitiba",
  },
  {
    quote:
      "Montei o apartamento inteiro em três meses garimpando aqui. Gastei um terço do que gastaria em loja e ficou com muito mais caráter.",
    name: "Tomás A.",
    role: "Designer · São Paulo",
  },
  {
    quote:
      "Como brechó de mobília, o painel de loja resolveu minha vida. Todos os anúncios num lugar só e as pessoas chegam pelo perfil.",
    name: "Ateliê Marcenaria 9",
    role: "Loja parceira · Belo Horizonte",
  },
];

export default async function HomePage() {
  const [user, featured, counts, totals] = await Promise.all([
    getCurrentUser(),
    featuredListings(8),
    categoryCounts(),
    Promise.all([
      prisma.listing.count({ where: { status: "ATIVO" } }),
      prisma.user.count(),
      prisma.store.count(),
    ]),
  ]);

  const [activeListings, users, stores] = totals;

  const favoriteIds = user
    ? new Set(
        (
          await prisma.favorite.findMany({
            where: { userId: user.id },
            select: { listingId: true },
          })
        ).map((f) => f.listingId),
      )
    : new Set<string>();

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="grain pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="mx-auto grid max-w-[88rem] items-center gap-14 px-5 pb-24 pt-14 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-32 lg:pt-20">
          <div className="relative z-10 max-w-xl">
            <p className="animate-fade-up flex items-center gap-3 text-[0.6875rem] uppercase tracking-[0.22em] text-brass">
              <span className="h-px w-10 bg-brass/50" />
              Mobília com procedência
            </p>

            <h1
              className="animate-fade-up mt-7 font-display text-[clamp(2.75rem,7vw,4.75rem)] font-light leading-[0.98] tracking-[-0.03em] text-ink"
              style={{ animationDelay: "80ms" }}
            >
              Todo móvel bom
              <br />
              merece uma
              <br />
              <em className="not-italic text-brass">segunda casa.</em>
            </h1>

            <p
              className="animate-fade-up mt-7 max-w-lg text-[1.0625rem] leading-relaxed text-dusk"
              style={{ animationDelay: "160ms" }}
            >
              O Decorar é o marketplace de venda e revenda de mobília e objetos
              de decoração. Peças selecionadas, negociação direta entre pessoas
              e nenhuma taxa sobre a sua venda.
            </p>

            <div className="animate-fade-up mt-9" style={{ animationDelay: "240ms" }}>
              <HeroSearch />
            </div>

            <div
              className="animate-fade-up mt-8 flex flex-wrap items-center gap-x-8 gap-y-4"
              style={{ animationDelay: "320ms" }}
            >
              <Link href="/anuncios/novo" className={buttonStyles("secondary", "md")}>
                Quero anunciar
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <dl className="flex items-center gap-7 text-sm">
                <div>
                  <dt className="text-[0.6875rem] uppercase tracking-[0.12em] text-mute">
                    Peças no ar
                  </dt>
                  <dd className="tabular font-display text-lg text-ink">{activeListings}</dd>
                </div>
                <div className="h-8 w-px bg-sand-deep" />
                <div>
                  <dt className="text-[0.6875rem] uppercase tracking-[0.12em] text-mute">
                    Vendedores
                  </dt>
                  <dd className="tabular font-display text-lg text-ink">{users}</dd>
                </div>
                <div className="hidden h-8 w-px bg-sand-deep sm:block" />
                <div className="hidden sm:block">
                  <dt className="text-[0.6875rem] uppercase tracking-[0.12em] text-mute">
                    Lojas
                  </dt>
                  <dd className="tabular font-display text-lg text-ink">{stores}</dd>
                </div>
              </dl>
            </div>
          </div>

          <Parallax className="relative" strength={54}>
            <div className="relative mx-auto max-w-[38rem] overflow-hidden rounded-[2rem] border border-sand-deep/70 shadow-[var(--shadow-lift)]">
              <HeroScene />
            </div>

            {/* Cartão flutuante — reforça a proposta sem poluir */}
            <div className="animate-float-slow absolute -bottom-6 -left-2 hidden w-56 rounded-lg border border-sand-deep bg-canvas/95 p-4 shadow-[var(--shadow-lift)] backdrop-blur-sm sm:block lg:-left-10">
              <p className="text-[0.6875rem] uppercase tracking-[0.12em] text-brass">
                Poltrona restaurada
              </p>
              <p className="mt-1.5 font-display text-lg leading-tight text-ink">
                Anos 60, jacarandá
              </p>
              <p className="tabular mt-2 text-sm text-dusk">R$ 2.480,00</p>
            </div>
          </Parallax>
        </div>

        {/* Faixa rolante de categorias */}
        <div className="relative border-y border-sand-deep/60 bg-canvas/50 py-4">
          <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
            <div className="marquee-track flex shrink-0 items-center gap-10 pr-10">
              {[...CATEGORIES, ...CATEGORIES].map((c, i) => (
                <span
                  key={`${c.slug}-${i}`}
                  className="flex shrink-0 items-center gap-10 text-[0.8125rem] uppercase tracking-[0.16em] text-dusk"
                >
                  {c.label}
                  <span className="h-1 w-1 rounded-full bg-brass/50" aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= PILARES ================= */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 110} as="article">
              <pillar.icon className="h-5 w-5 text-brass" aria-hidden="true" />
              <h2 className="mt-5 font-display text-[1.5rem] leading-snug text-ink">
                {pillar.title}
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-dusk">{pillar.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= CURADORIA ================= */}
      <section id="curadoria" className="border-t border-sand-deep/60 bg-canvas/60">
        <div className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-brass">
                Curadoria da semana
              </p>
              <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-light leading-[1.04] tracking-[-0.025em] text-ink">
                Peças que estão saindo de casa
              </h2>
            </div>

            <Link
              href="/anuncios"
              className="group inline-flex items-center gap-2 text-sm text-bark transition-colors hover:text-brass"
            >
              Ver tudo
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </Reveal>

          {featured.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((listing, i) => (
                <Reveal key={listing.id} from="scale" delay={(i % 4) * 90} className="h-full">
                  <ListingCard
                    listing={listing}
                    favorited={favoriteIds.has(listing.id)}
                    canFavorite={Boolean(user)}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal className="mt-12 rounded-xl border border-dashed border-sand-deep bg-linen/60 px-8 py-20 text-center">
              <p className="font-display text-xl text-ink">
                A vitrine está esperando a primeira peça.
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm text-dusk">
                Rode <code className="rounded-xs bg-sand px-1.5 py-0.5">npm run db:seed</code> para
                carregar o catálogo de exemplo — ou publique o seu anúncio agora.
              </p>
              <Link href="/anuncios/novo" className={buttonStyles("primary", "md", "mt-7")}>
                Criar o primeiro anúncio
              </Link>
            </Reveal>
          )}
        </div>
      </section>

      {/* ================= COMO FUNCIONA ================= */}
      <section id="como-funciona" className="relative overflow-hidden">
        <div className="mx-auto max-w-[88rem] px-5 py-28 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-brass">
              Como funciona
            </p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-light leading-[1.04] tracking-[-0.025em] text-ink">
              Três passos entre o seu depósito e a sala de alguém
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 130} className="relative">
                <div className="flex items-baseline gap-4">
                  <span className="tabular font-display text-[3.25rem] font-light leading-none text-sand-deep">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <step.icon className="h-5 w-5 text-brass" aria-hidden="true" />
                </div>

                <h3 className="mt-6 font-display text-[1.5rem] leading-snug text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-dusk">{step.text}</p>

                {i < STEPS.length - 1 && (
                  <div
                    className="hairline absolute -right-6 top-6 hidden w-12 md:block"
                    aria-hidden="true"
                  />
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MANIFESTO ================= */}
      <section className="grain relative overflow-hidden bg-forest text-linen">
        <div className="mx-auto grid max-w-[88rem] items-center gap-16 px-5 py-28 sm:px-8 lg:grid-cols-2">
          <Reveal from="left">
            <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-brass-soft">
              Nossa proposta
            </p>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.5rem)] font-light leading-[1.05] tracking-[-0.025em]">
              Móvel bom não é descartável.
              <br />É herança em trânsito.
            </h2>

            <div className="mt-8 space-y-5 text-[1.0625rem] leading-relaxed text-linen/75">
              <p>
                Uma cômoda de madeira maciça dura oitenta anos. O apartamento de
                quem a comprou, não. Entre uma mudança e outra, peças inteiras
                acabam no depósito — ou na calçada.
              </p>
              <p>
                O Decorar existe para encurtar esse caminho: conectar quem
                precisa se desfazer de uma boa peça a quem está montando um lar.
                Sem leilão, sem intermediário, sem taxa sobre a venda.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/cadastro" className={buttonStyles("secondary", "lg")}>
                Criar minha conta
              </Link>
              <Link
                href="/anuncios"
                className="inline-flex h-13 items-center rounded-full border border-linen/25 px-8 text-[0.9375rem] text-linen transition-colors hover:border-linen/60"
              >
                Explorar peças
              </Link>
            </div>
          </Reveal>

          <Reveal from="right" className="grid grid-cols-2 gap-4">
            {["vintage-e-garimpo", "iluminacao", "vasos-e-objetos", "espelhos"].map(
              (slug, i) => (
                <div
                  key={slug}
                  className={`overflow-hidden rounded-lg border border-linen/12 ${
                    i % 2 === 1 ? "translate-y-8" : ""
                  }`}
                >
                  <div className="aspect-4/5">
                    <ProductPlate category={slug} seed={`manifesto-${i}`} />
                  </div>
                </div>
              ),
            )}
          </Reveal>
        </div>
      </section>

      {/* ================= CATEGORIAS ================= */}
      <section className="mx-auto max-w-[88rem] px-5 py-28 sm:px-8">
        <Reveal className="max-w-xl">
          <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-brass">
            Navegue por ambiente
          </p>
          <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-light leading-[1.04] tracking-[-0.025em] text-ink">
            Cada categoria, um cômodo da casa
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category, i) => (
            <Reveal key={category.slug} delay={(i % 4) * 80} className="h-full">
              <Link
                href={`/anuncios?categoria=${category.slug}`}
                className="card-hover group flex h-full flex-col overflow-hidden rounded-lg border border-sand-deep/70 bg-canvas"
              >
                <div className="relative aspect-5/4 shrink-0 overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105">
                    <ProductPlate category={category.slug} seed={category.slug} />
                  </div>
                </div>

                <div className="flex flex-1 items-center justify-between gap-3 px-4 py-4">
                  <h3 className="font-display text-[1.0625rem] leading-tight text-ink">
                    {category.label}
                  </h3>
                  <span className="tabular shrink-0 text-[0.75rem] text-mute">
                    {counts[category.slug] ?? 0}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= DEPOIMENTOS ================= */}
      <section className="border-y border-sand-deep/60 bg-canvas/60">
        <div className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            {TESTIMONIALS.map((item, i) => (
              <Reveal key={item.name} delay={i * 120} as="figure">
                <svg viewBox="0 0 24 18" className="h-5 w-6 text-brass/40" aria-hidden="true">
                  <path
                    d="M0 18V9C0 4 3 1 8 0l1 3C6 4 4 6 4 9h4v9H0Zm14 0V9c0-5 3-8 8-9l1 3c-3 1-5 3-5 6h4v9h-8Z"
                    fill="currentColor"
                  />
                </svg>

                <blockquote className="mt-5 font-display text-[1.1875rem] leading-relaxed text-bark">
                  {item.quote}
                </blockquote>

                <figcaption className="mt-6 border-t border-sand pt-4">
                  <p className="text-sm text-ink">{item.name}</p>
                  <p className="mt-0.5 text-[0.75rem] uppercase tracking-[0.1em] text-mute">
                    {item.role}
                  </p>
                </figcaption>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[88rem] px-5 py-28 sm:px-8">
          <Reveal
            from="scale"
            className="relative overflow-hidden rounded-2xl border border-sand-deep bg-linen px-8 py-20 text-center sm:px-16"
          >
            <div className="grain pointer-events-none absolute inset-0" aria-hidden="true" />

            <p className="relative text-[0.6875rem] uppercase tracking-[0.22em] text-brass">
              Comece agora
            </p>
            <h2 className="relative mx-auto mt-5 max-w-3xl font-display text-[clamp(2.25rem,5.5vw,4rem)] font-light leading-[1.02] tracking-[-0.03em] text-ink">
              Tem uma peça parada? Ela já é o sonho de alguém.
            </h2>
            <p className="relative mx-auto mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-dusk">
              Crie sua conta gratuita, publique em minutos e converse direto com
              quem quer comprar.
            </p>

            <div className="relative mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/cadastro" className={buttonStyles("primary", "lg")}>
                Criar conta gratuita
              </Link>
              <Link href="/anuncios" className={buttonStyles("outline", "lg")}>
                Só quero olhar
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
