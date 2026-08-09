"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  /** Direção de entrada. */
  from?: "up" | "left" | "right" | "scale";
  /** Atraso em ms — usado para escalonar itens de uma mesma lista. */
  delay?: number;
  /** Fração do elemento visível para disparar (0–1). */
  threshold?: number;
  as?: ElementType;
  className?: string;
};

/** Rede de segurança: passado este tempo, o conteúdo aparece de qualquer forma. */
const FAILSAFE_MS = 2000;

/**
 * `useLayoutEffect` roda depois da hidratação e antes da pintura, então dá para
 * esconder o que está fora da tela sem o usuário ver um flash. No servidor ele
 * não existe — cair para `useEffect` evita o aviso do React.
 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Revela o conteúdo quando ele entra na viewport.
 *
 * **O padrão é visível.** O HTML sai do servidor já legível e só é escondido
 * depois que o JavaScript confirma que o elemento está fora da tela. Isso
 * inverte o risco: se algo der errado — JS desativado, hidratação falhando,
 * IntersectionObserver que não dispara — o pior caso é a animação não
 * acontecer, nunca a página ficar em branco. (Um card invisível continua
 * ocupando espaço e recebendo cliques, então o usuário veria "nada" no lugar
 * de um anúncio; é um modo de falha que não vale o efeito visual.)
 *
 * Ainda assim há um timer de segurança, para o caso do observer nunca reportar
 * a entrada do elemento.
 */
export function Reveal({
  children,
  from = "up",
  delay = 0,
  threshold = 0.15,
  as: Tag = "div",
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(true);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const rect = node.getBoundingClientRect();

    // Já está na tela (ou o layout ainda não existe, caso de aba oculta):
    // deixa como está, sem animação de entrada.
    if (rect.height === 0 || rect.top < viewport) return;

    setVisible(false);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            setVisible(true);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);

    const failsafe = window.setTimeout(() => setVisible(true), FAILSAFE_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      data-reveal={from}
      data-visible={visible ? "true" : "false"}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
