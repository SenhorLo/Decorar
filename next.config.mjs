/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy.
 * `unsafe-inline` continua necessario para o bootstrap inline do Next e para
 * os styles gerados pelo Tailwind/next-font. Em producao com nonce dinamico
 * isso pode ser endurecido (ver README > Seguranca).
 */
/**
 * Em producao as fotos enviadas por usuarios ficam no Vercel Blob, servidas
 * de um subdominio proprio. Precisa constar na CSP e em `images` — sem isso
 * o navegador bloqueia e o otimizador do next/image recusa a origem.
 */
const BLOB_HOST = "https://*.public.blob.vercel-storage.com";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${BLOB_HOST}`,
  "font-src 'self' data:",
  "connect-src 'self'" + (isDev ? " ws: wss:" : ""),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Em dev o servidor é http://localhost — forçar upgrade quebraria todos os
  // assets. Em produção o site é servido por HTTPS e a diretiva entra.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Esconde o selo do Next no canto da tela durante o desenvolvimento.
  // (Em produção ele nunca é incluído no bundle.)
  devIndicators: false,
  // Permite rodar `next build` sem derrubar um `next dev` que esteja usando .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    serverActions: {
      // Uploads passam por Server Actions: 6 imagens x 5MB + folga.
      bodySizeLimit: "32mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
