import { cn } from "@/lib/utils";

/**
 * Ilustração de produto gerada por código.
 *
 * Anúncios do seed (e qualquer anúncio sem foto) usam estas placas em vez de
 * imagens externas: nada de CDN, funciona offline, e a vitrine mantém uma
 * direção de arte consistente. Fotos reais enviadas por usuários passam pelo
 * <ListingImage> normal.
 */

type Palette = { bg: string; wash: string; body: string; shade: string; accent: string };

const PALETTES: Palette[] = [
  { bg: "#F2EBDF", wash: "#E7DBC7", body: "#B78C5B", shade: "#8E6A40", accent: "#2F4239" },
  { bg: "#EDE9E1", wash: "#DCD5C8", body: "#7E8B7B", shade: "#5C6A59", accent: "#A47B45" },
  { bg: "#F4EDE6", wash: "#E6D8CB", body: "#B0603C", shade: "#8B4830", accent: "#2B2320" },
  { bg: "#EAE6DF", wash: "#D8D1C5", body: "#4A5560", shade: "#333C45", accent: "#CBAB77" },
  { bg: "#F5F0E6", wash: "#E4DAC6", body: "#8C7C68", shade: "#6B5D4C", accent: "#1F2E27" },
];

/** Hash estável: mesma peça => sempre a mesma arte. */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function Sofa({ p }: { p: Palette }) {
  return (
    <g>
      <rect x="60" y="196" width="280" height="58" rx="14" fill={p.body} />
      <rect x="60" y="196" width="280" height="20" rx="10" fill={p.shade} opacity="0.35" />
      <rect x="46" y="150" width="42" height="96" rx="18" fill={p.shade} />
      <rect x="312" y="150" width="42" height="96" rx="18" fill={p.shade} />
      <rect x="92" y="138" width="216" height="66" rx="16" fill={p.body} />
      <rect x="104" y="150" width="88" height="46" rx="10" fill={p.wash} opacity="0.55" />
      <rect x="208" y="150" width="88" height="46" rx="10" fill={p.wash} opacity="0.55" />
      <path d="M96 254v22M304 254v22" stroke={p.accent} strokeWidth="7" strokeLinecap="round" />
      <circle cx="330" cy="120" r="26" fill={p.accent} opacity="0.16" />
    </g>
  );
}

function TableChairs({ p }: { p: Palette }) {
  return (
    <g>
      <rect x="72" y="176" width="256" height="14" rx="7" fill={p.body} />
      <path d="M104 190v70M296 190v70" stroke={p.shade} strokeWidth="9" strokeLinecap="round" />
      <path d="M104 246h192" stroke={p.shade} strokeWidth="6" strokeLinecap="round" />
      <rect x="118" y="150" width="14" height="34" rx="7" fill={p.accent} />
      <rect x="106" y="196" width="42" height="10" rx="5" fill={p.accent} />
      <path d="M112 206v52M144 206v52" stroke={p.accent} strokeWidth="6" strokeLinecap="round" />
      <rect x="256" y="150" width="14" height="34" rx="7" fill={p.accent} />
      <rect x="252" y="196" width="42" height="10" rx="5" fill={p.accent} />
      <path d="M258 206v52M290 206v52" stroke={p.accent} strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="200" cy="168" rx="22" ry="9" fill={p.wash} />
    </g>
  );
}

function Bed({ p }: { p: Palette }) {
  return (
    <g>
      <rect x="66" y="120" width="72" height="130" rx="16" fill={p.shade} />
      <rect x="66" y="196" width="268" height="58" rx="12" fill={p.body} />
      <rect x="86" y="176" width="112" height="30" rx="12" fill={p.wash} />
      <rect x="96" y="164" width="92" height="26" rx="11" fill={p.bg} />
      <rect x="200" y="190" width="134" height="20" rx="9" fill={p.accent} opacity="0.4" />
      <path d="M86 254v20M318 254v20" stroke={p.accent} strokeWidth="7" strokeLinecap="round" />
    </g>
  );
}

function Shelf({ p }: { p: Palette }) {
  return (
    <g>
      <rect x="112" y="96" width="176" height="164" rx="10" fill={p.wash} />
      <rect x="112" y="96" width="176" height="164" rx="10" stroke={p.shade} strokeWidth="7" fill="none" />
      <path d="M112 152h176M112 206h176M200 96v164" stroke={p.shade} strokeWidth="6" />
      <rect x="128" y="118" width="10" height="28" rx="3" fill={p.body} />
      <rect x="142" y="124" width="10" height="22" rx="3" fill={p.accent} />
      <circle cx="238" cy="134" r="12" fill={p.accent} opacity="0.5" />
      <rect x="128" y="176" width="46" height="24" rx="6" fill={p.body} opacity="0.7" />
      <path d="M232 224h34" stroke={p.body} strokeWidth="7" strokeLinecap="round" />
      <path d="M128 260v14M272 260v14" stroke={p.shade} strokeWidth="7" strokeLinecap="round" />
    </g>
  );
}

function Lamp({ p }: { p: Palette }) {
  return (
    <g>
      <path d="M160 148h80l22 46H138l22-46Z" fill={p.body} />
      <path d="M138 194h124" stroke={p.shade} strokeWidth="6" strokeLinecap="round" />
      <path d="M200 194v66" stroke={p.shade} strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="200" cy="264" rx="44" ry="11" fill={p.shade} />
      <path
        d="M150 202 122 268M250 202l28 66"
        stroke={p.accent}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.35"
      />
      <circle cx="200" cy="122" r="15" fill={p.accent} opacity="0.2" />
    </g>
  );
}

function Rug({ p }: { p: Palette }) {
  return (
    <g>
      <rect x="66" y="140" width="268" height="118" rx="10" fill={p.body} />
      <rect x="86" y="158" width="228" height="82" rx="6" fill={p.wash} />
      <rect x="106" y="176" width="188" height="46" rx="4" fill={p.accent} opacity="0.35" />
      <path d="M148 176v46M200 176v46M252 176v46" stroke={p.body} strokeWidth="5" />
      <path
        d="M66 258h268M66 140h268"
        stroke={p.shade}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M76 258v12M124 258v12M172 258v12M220 258v12M268 258v12M320 258v12" stroke={p.shade} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function Frame({ p }: { p: Palette }) {
  return (
    <g>
      <rect x="122" y="82" width="156" height="182" rx="6" fill={p.body} />
      <rect x="140" y="100" width="120" height="146" rx="3" fill={p.bg} />
      <circle cx="200" cy="150" r="34" fill={p.accent} opacity="0.5" />
      <path d="M140 208l40-42 30 32 26-24 24 26v46H140v-38Z" fill={p.shade} opacity="0.55" />
      <path d="M100 264h200" stroke={p.shade} strokeWidth="6" strokeLinecap="round" />
    </g>
  );
}

function Mirror({ p }: { p: Palette }) {
  return (
    <g>
      <path d="M136 264V150a64 64 0 0 1 128 0v114Z" fill={p.body} />
      <path d="M152 258V150a48 48 0 0 1 96 0v108Z" fill={p.wash} />
      <path
        d="M170 250V152a30 30 0 0 1 22-29"
        stroke={p.bg}
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path d="M110 264h180" stroke={p.shade} strokeWidth="6" strokeLinecap="round" />
      <circle cx="298" cy="126" r="18" fill={p.accent} opacity="0.2" />
    </g>
  );
}

function Vase({ p }: { p: Palette }) {
  return (
    <g>
      <path
        d="M176 132h48l-8 30c14 12 22 28 22 46 0 32-20 54-38 54s-38-22-38-54c0-18 8-34 22-46l-8-30Z"
        fill={p.body}
      />
      <path d="M186 176c-8 10-12 20-12 32 0 20 12 34 26 34" stroke={p.bg} strokeWidth="7" strokeLinecap="round" opacity="0.55" fill="none" />
      <path
        d="M200 132c-6-26 4-46 22-56M200 132c4-20-6-34-24-40"
        stroke={p.accent}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="222" cy="72" r="9" fill={p.accent} opacity="0.6" />
      <circle cx="174" cy="88" r="7" fill={p.accent} opacity="0.4" />
      <ellipse cx="200" cy="264" rx="52" ry="10" fill={p.shade} opacity="0.35" />
    </g>
  );
}

function Desk({ p }: { p: Palette }) {
  return (
    <g>
      <rect x="84" y="182" width="232" height="13" rx="6" fill={p.body} />
      <path d="M100 195v66M300 195v66" stroke={p.shade} strokeWidth="8" strokeLinecap="round" />
      <rect x="228" y="200" width="76" height="58" rx="7" fill={p.shade} />
      <path d="M240 216h52M240 232h36" stroke={p.bg} strokeWidth="5" strokeLinecap="round" />
      <rect x="150" y="134" width="106" height="48" rx="5" fill={p.accent} />
      <rect x="160" y="144" width="86" height="28" rx="3" fill={p.wash} opacity="0.7" />
      <path d="M116 168v14h18" stroke={p.accent} strokeWidth="6" strokeLinecap="round" fill="none" />
    </g>
  );
}

function Outdoor({ p }: { p: Palette }) {
  return (
    <g>
      <path d="M112 200h176v56H112z" fill={p.body} />
      <path d="M112 200h176" stroke={p.shade} strokeWidth="7" strokeLinecap="round" />
      <path d="M126 256v20M274 256v20" stroke={p.shade} strokeWidth="7" strokeLinecap="round" />
      <path d="M132 200v-46h136v46" stroke={p.body} strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M150 200v-40M200 200v-40M250 200v-40" stroke={p.wash} strokeWidth="6" strokeLinecap="round" />
      <path
        d="M318 256c0-40 10-66 10-66s10 26 10 66"
        stroke={p.accent}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="86" cy="140" r="24" fill={p.accent} opacity="0.22" />
    </g>
  );
}

function Vintage({ p }: { p: Palette }) {
  return (
    <g>
      <path d="M138 200h124v52H138z" fill={p.body} />
      <path
        d="M142 200v-52a58 58 0 0 1 116 0v52"
        fill={p.shade}
      />
      <path d="M162 190v-42a38 38 0 0 1 76 0v42" fill={p.wash} opacity="0.75" />
      <path d="M138 252l-14 26M262 252l14 26" stroke={p.accent} strokeWidth="7" strokeLinecap="round" />
      <path d="M126 200h-16M290 200h16" stroke={p.shade} strokeWidth="9" strokeLinecap="round" />
      <path d="M200 148v42" stroke={p.body} strokeWidth="4" opacity="0.6" strokeLinecap="round" />
    </g>
  );
}

const SHAPES: Record<string, (props: { p: Palette }) => React.JSX.Element> = {
  "sofas-e-poltronas": Sofa,
  "mesas-e-cadeiras": TableChairs,
  "camas-e-colchoes": Bed,
  "armarios-e-estantes": Shelf,
  iluminacao: Lamp,
  "tapetes-e-texteis": Rug,
  "arte-e-quadros": Frame,
  espelhos: Mirror,
  "vasos-e-objetos": Vase,
  escritorio: Desk,
  "area-externa": Outdoor,
  "vintage-e-garimpo": Vintage,
};

export function ProductPlate({
  category,
  seed = "",
  className,
}: {
  category: string;
  seed?: string;
  className?: string;
}) {
  const Shape = SHAPES[category] ?? Sofa;
  const h = hash(`${category}:${seed}`);
  const p = PALETTES[h % PALETTES.length]!;
  const archShift = (h >> 3) % 3; // 0,1,2 — varia a composição de fundo

  return (
    <svg
      viewBox="0 0 400 300"
      className={cn("h-full w-full", className)}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-hidden="true"
    >
      <rect width="400" height="300" fill={p.bg} />

      {/* Arco de parede — profundidade sem foto */}
      <path
        d={
          archShift === 0
            ? "M92 300V152a108 108 0 0 1 216 0v148Z"
            : archShift === 1
              ? "M40 300V166a92 92 0 0 1 184 0v134Z"
              : "M186 300V140a104 104 0 0 1 208 0v160Z"
        }
        fill={p.wash}
        opacity="0.75"
      />

      {/* Piso */}
      <rect y="256" width="400" height="44" fill={p.wash} opacity="0.55" />
      <path d="M0 256h400" stroke={p.shade} strokeWidth="1.5" opacity="0.3" />

      {/* Sombra difusa sob o objeto */}
      <ellipse cx="200" cy="272" rx="132" ry="14" fill={p.shade} opacity="0.16" />

      <Shape p={p} />
    </svg>
  );
}
