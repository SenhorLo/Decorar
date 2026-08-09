import { cn } from "@/lib/utils";

/**
 * Cena do hero: um canto de sala com janela em arco.
 *
 * Desenhada em SVG (e não foto) por três motivos: carrega instantaneamente,
 * não depende de CDN, e mantém a paleta da marca exata em qualquer tela.
 * Os grupos têm `data-depth` — o <Parallax> desloca cada camada em ritmo
 * diferente durante a rolagem para criar profundidade.
 */
export function HeroScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 720 620"
      className={cn("h-full w-full", className)}
      fill="none"
      role="img"
      aria-label="Ilustração de uma sala de estar com janela em arco, poltrona, luminária e vasos"
    >
      <defs>
        <linearGradient id="hs-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7F2E9" />
          <stop offset="100%" stopColor="#EDE4D5" />
        </linearGradient>
        <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DCE6E2" />
          <stop offset="55%" stopColor="#EFE7D8" />
          <stop offset="100%" stopColor="#E3D6C0" />
        </linearGradient>
        <linearGradient id="hs-beam" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#FFF6E2" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFF6E2" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hs-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D9C8AE" />
          <stop offset="100%" stopColor="#C9B291" />
        </linearGradient>
        <radialGradient id="hs-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#F6D9A0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F6D9A0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---------- Parede e piso ---------- */}
      <rect width="720" height="620" fill="url(#hs-wall)" />
      <path d="M0 470h720v150H0z" fill="url(#hs-floor)" />
      <path d="M0 470h720" stroke="#B79E7B" strokeWidth="2" opacity="0.5" />
      <g opacity="0.28" stroke="#A98B62" strokeWidth="1.5">
        <path d="M96 470v150M232 470v150M368 470v150M504 470v150M640 470v150" />
      </g>

      {/* ---------- Janela em arco (camada de fundo) ---------- */}
      <g data-depth="0.18">
        <path
          d="M118 470V204a90 90 0 0 1 180 0v266Z"
          fill="url(#hs-sky)"
          stroke="#B79E7B"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <path
          d="M208 116v354M118 300h180"
          stroke="#B79E7B"
          strokeWidth="5"
          opacity="0.85"
        />
        {/* Paisagem distante */}
        <path d="M118 400c40-26 66-8 92-22s52-30 88-8v100H118Z" fill="#C3CFC4" opacity="0.55" />
        <circle cx="256" cy="192" r="26" fill="#F2E2BE" opacity="0.85" />
        {/* Cortina */}
        <path
          d="M298 128c26 8 34 40 34 92v250h-34V128Z"
          fill="#E8DDCB"
          stroke="#CDBB9E"
          strokeWidth="3"
        />
        <path d="M312 150v308M324 168v290" stroke="#CDBB9E" strokeWidth="2" opacity="0.7" />
      </g>

      {/* ---------- Feixe de luz ---------- */}
      <path d="M132 470 200 210l176 260Z" fill="url(#hs-beam)" />

      {/* ---------- Prateleira e quadros (fundo) ---------- */}
      <g data-depth="0.3">
        <rect x="440" y="150" width="180" height="128" rx="4" fill="#E4D8C2" stroke="#B79E7B" strokeWidth="4" />
        <path d="M460 250l36-44 26 30 24-22 34 36v18h-120v-18Z" fill="#8FA08C" opacity="0.75" />
        <circle cx="580" cy="192" r="16" fill="#CBAB77" opacity="0.8" />

        <rect x="440" y="306" width="180" height="8" rx="4" fill="#B79E7B" />
        <rect x="462" y="272" width="16" height="34" rx="3" fill="#A47B45" />
        <rect x="482" y="280" width="12" height="26" rx="3" fill="#2F4239" />
        <path
          d="M528 306c-12-8-16-20-16-30h34c0 10-6 22-18 30Z"
          fill="#B0603C"
          opacity="0.85"
        />
        <circle cx="580" cy="292" r="14" fill="#8FA08C" />
      </g>

      {/* ---------- Tapete ---------- */}
      <g data-depth="0.05">
        <ellipse cx="356" cy="524" rx="252" ry="62" fill="#C4A87F" opacity="0.5" />
        <ellipse cx="356" cy="524" rx="212" ry="50" fill="#D8C5A4" opacity="0.75" />
        <ellipse cx="356" cy="524" rx="150" ry="34" fill="none" stroke="#B0603C" strokeWidth="3" opacity="0.4" />
      </g>

      {/* ---------- Poltrona ---------- */}
      <g data-depth="0.55">
        <ellipse cx="266" cy="520" rx="120" ry="20" fill="#8E7550" opacity="0.2" />
        <path
          d="M184 470v-92a68 68 0 0 1 136 0v92Z"
          fill="#7E8B7B"
        />
        <path d="M200 462v-78a52 52 0 0 1 104 0v78Z" fill="#8FA08C" />
        <rect x="176" y="456" width="152" height="46" rx="14" fill="#6E7C6C" />
        <rect x="188" y="446" width="128" height="30" rx="12" fill="#9CAD98" />
        <rect x="160" y="392" width="34" height="82" rx="16" fill="#6E7C6C" />
        <rect x="310" y="392" width="34" height="82" rx="16" fill="#6E7C6C" />
        <path d="M196 502l-12 34M328 502l12 34" stroke="#8A6B45" strokeWidth="10" strokeLinecap="round" />
        {/* Almofada */}
        <rect x="216" y="398" width="66" height="52" rx="14" fill="#CBAB77" transform="rotate(-8 249 424)" />
      </g>

      {/* ---------- Luminária de piso ---------- */}
      <g data-depth="0.75">
        <ellipse cx="596" cy="300" rx="92" ry="92" fill="url(#hs-glow)" opacity="0.55" />
        <path d="M556 296h80l24 56h-128l24-56Z" fill="#CBAB77" />
        <path d="M532 352h128" stroke="#A47B45" strokeWidth="6" strokeLinecap="round" />
        <path d="M596 352v152" stroke="#3A3229" strokeWidth="7" strokeLinecap="round" />
        <path d="M566 508h60" stroke="#3A3229" strokeWidth="9" strokeLinecap="round" />
        <ellipse cx="596" cy="512" rx="46" ry="9" fill="#8E7550" opacity="0.25" />
      </g>

      {/* ---------- Mesa lateral + objetos ---------- */}
      <g data-depth="0.9">
        <ellipse cx="420" cy="502" rx="62" ry="12" fill="#8E7550" opacity="0.22" />
        <ellipse cx="420" cy="422" rx="58" ry="14" fill="#A47B45" />
        <path d="M420 428v70" stroke="#8A6B45" strokeWidth="9" strokeLinecap="round" />
        <path d="M392 498h56" stroke="#8A6B45" strokeWidth="8" strokeLinecap="round" />

        {/* Vaso com galhos */}
        <path
          d="M406 418h28l-5 18c8 7 13 16 13 26 0 18-11 30-22 30s-22-12-22-30c0-10 5-19 13-26l-5-18Z"
          fill="#B0603C"
        />
        <path
          d="M420 418c-4-22 2-38 16-46M420 418c2-16-6-26-20-30"
          stroke="#5E6B4F"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="437" cy="370" r="7" fill="#8FA08C" />
        <circle cx="399" cy="386" r="6" fill="#8FA08C" />

        {/* Livros empilhados */}
        <rect x="448" y="404" width="46" height="9" rx="3" fill="#2F4239" />
        <rect x="452" y="396" width="42" height="9" rx="3" fill="#CBAB77" />
      </g>

      {/* ---------- Planta ---------- */}
      <g data-depth="1.05">
        <ellipse cx="98" cy="524" rx="52" ry="11" fill="#8E7550" opacity="0.25" />
        <path d="M72 448h52l-8 74H80l-8-74Z" fill="#B0603C" />
        <path d="M70 440h56v14H70z" fill="#C97A52" />
        <path
          d="M98 448c-6-46-30-64-52-70 20 34 26 52 52 70ZM98 448c4-50 26-70 50-78-18 38-24 58-50 78ZM98 448c-2-30 8-52 22-62-6 28-10 44-22 62Z"
          fill="#5E6B4F"
        />
        <path
          d="M98 448c-4-28-16-44-30-52"
          stroke="#4A5540"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* ---------- Grão / vinheta ---------- */}
      <rect width="720" height="620" fill="#16120F" opacity="0.03" />
    </svg>
  );
}
