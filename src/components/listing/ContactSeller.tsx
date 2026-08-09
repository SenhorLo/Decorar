"use client";

import { useState } from "react";
import { MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * O telefone só aparece depois de um clique consciente — evita que
 * raspadores peguem contatos direto do HTML da listagem.
 */
export function ContactSeller({
  phone,
  whatsapp,
  sellerName,
  listingTitle,
}: {
  phone: string | null;
  whatsapp: string | null;
  sellerName: string;
  listingTitle: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const number = whatsapp || phone;

  if (!number) {
    return (
      <p className="rounded-md border border-sand-deep bg-linen/60 px-4 py-3 text-[0.8125rem] leading-relaxed text-dusk">
        {sellerName} ainda não cadastrou um contato. Salve o anúncio nos
        favoritos para acompanhar.
      </p>
    );
  }

  if (!revealed) {
    return (
      <Button variant="secondary" size="lg" className="w-full" onClick={() => setRevealed(true)}>
        <Phone className="h-4 w-4" aria-hidden="true" />
        Ver contato do vendedor
      </Button>
    );
  }

  const digits = number.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Olá! Vi o anúncio "${listingTitle}" no Decorar e fiquei interessado.`,
  );

  return (
    <div className="space-y-2.5">
      <a
        href={`https://wa.me/55${digits}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brass px-8 text-[0.9375rem] font-medium text-white transition-colors hover:bg-[#916b3a]"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Conversar no WhatsApp
      </a>

      <a
        href={`tel:+55${digits}`}
        className="tabular flex h-11 w-full items-center justify-center gap-2 rounded-full border border-sand-deep text-sm text-bark transition-colors hover:border-ink"
      >
        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
        {number}
      </a>
    </div>
  );
}
