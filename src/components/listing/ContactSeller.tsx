"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Loader2, Lock, MessageCircle, Phone } from "lucide-react";

import { revealContactAction } from "@/actions/contact";
import { Button } from "@/components/ui/button";

/**
 * Contato do vendedor.
 *
 * O telefone é dado pessoal de terceiro, então nunca acompanha a página:
 *
 * 1. Visitante anônimo não recebe nada e vê um convite para entrar. Entregar
 *    o número a quem não se identificou transformaria o catálogo numa lista
 *    de contatos pronta para raspagem.
 * 2. Mesmo com sessão, o número só chega depois do clique, por uma chamada
 *    ao servidor que é limitada por usuário. Coletar os contatos do acervo
 *    exige uma requisição por anúncio — contável e barrável — em vez de um
 *    único download do HTML.
 */
export function ContactSeller({
  sellerName,
  listingTitle,
  listingId,
  isAuthenticated,
  hasContact,
}: {
  sellerName: string;
  listingTitle: string;
  listingId: string;
  isAuthenticated: boolean;
  /** Se o vendedor cadastrou algum contato — sabido sem revelar o número. */
  hasContact: boolean;
}) {
  const [numero, setNumero] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  if (!hasContact) {
    return (
      <p className="rounded-md border border-sand-deep bg-linen/60 px-4 py-3 text-[0.8125rem] leading-relaxed text-dusk">
        {sellerName} ainda não cadastrou um contato. Salve o anúncio nos
        favoritos para acompanhar.
      </p>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-2.5">
        <Link
          href={`/login?next=${encodeURIComponent(`/anuncios/${listingId}`)}`}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brass px-8 text-[0.9375rem] font-medium text-white transition-colors hover:bg-[#916b3a]"
        >
          <Lock className="h-4 w-4" aria-hidden="true" />
          Entrar para ver o contato
        </Link>
        <p className="px-1 text-center text-[0.75rem] leading-relaxed text-dusk">
          Pedimos login para proteger o contato de quem anuncia.
        </p>
      </div>
    );
  }

  function revelar() {
    setErro(null);
    startTransition(async () => {
      const r = await revealContactAction(listingId);

      if (!r.ok) {
        setErro(
          r.reason === "ratelimited"
            ? "Você viu muitos contatos em pouco tempo. Tente de novo mais tarde."
            : "Não foi possível carregar o contato deste anúncio.",
        );
        return;
      }

      const escolhido = r.whatsapp || r.phone;
      if (!escolhido) {
        setErro("Este vendedor não tem contato cadastrado.");
        return;
      }
      setNumero(escolhido);
    });
  }

  if (!numero) {
    return (
      <div className="space-y-2">
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={revelar}
          disabled={pendente}
        >
          {pendente ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Phone className="h-4 w-4" aria-hidden="true" />
          )}
          {pendente ? "Carregando…" : "Ver contato do vendedor"}
        </Button>
        {erro && <p className="text-[0.75rem] leading-snug text-danger">{erro}</p>}
      </div>
    );
  }

  const digitos = numero.replace(/\D/g, "");
  const mensagem = encodeURIComponent(
    `Olá! Vi o anúncio "${listingTitle}" no Decorar e fiquei interessado.`,
  );

  return (
    <div className="space-y-2.5">
      <a
        href={`https://wa.me/55${digitos}?text=${mensagem}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brass px-8 text-[0.9375rem] font-medium text-white transition-colors hover:bg-[#916b3a]"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Conversar no WhatsApp
      </a>

      <a
        href={`tel:+55${digitos}`}
        className="tabular flex h-11 w-full items-center justify-center gap-2 rounded-full border border-sand-deep text-sm text-bark transition-colors hover:border-ink"
      >
        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
        {numero}
      </a>
    </div>
  );
}
