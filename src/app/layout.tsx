import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Decorar — mobília e decoração com história",
    template: "%s · Decorar",
  },
  description:
    "Marketplace de móveis e objetos de decoração. Compre, venda e revenda peças selecionadas — do design assinado ao garimpo vintage.",
  keywords: [
    "móveis usados",
    "decoração",
    "marketplace de móveis",
    "design de interiores",
    "móveis vintage",
    "revenda de mobília",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Decorar",
    title: "Decorar — mobília e decoração com história",
    description:
      "Compre, venda e revenda peças selecionadas de mobília e decoração.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f7f3ec",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:text-linen"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
