import { cn } from "@/lib/utils";

type LogoProps = {
  /** `full` = símbolo + palavra. `mark` = só o símbolo. */
  variant?: "full" | "mark";
  /** `dark` para fundos claros, `light` para fundos escuros. */
  tone?: "dark" | "light";
  className?: string;
};

/**
 * Marca Decorar.
 *
 * O símbolo é um arco arquitetônico — a soleira de uma casa — com um pendente
 * de luz suspenso no centro. Arco = lar; luz = o objeto que transforma o
 * ambiente. Traço fino e serifa alta para a leitura "editorial de decoração".
 */
export function Logo({ variant = "full", tone = "dark", className }: LogoProps) {
  const ink = tone === "light" ? "var(--color-linen)" : "var(--color-ink)";
  const brass = tone === "light" ? "var(--color-brass-soft)" : "var(--color-brass)";

  return (
    <span
      className={cn("inline-flex items-center gap-2.5 align-middle", className)}
      aria-label="Decorar"
    >
      <svg
        viewBox="0 0 40 40"
        role="img"
        aria-hidden="true"
        className="h-8 w-8 shrink-0"
        fill="none"
      >
        {/* Arco — a soleira */}
        <path
          d="M6.5 35V17.5a13.5 13.5 0 0 1 27 0V35"
          stroke={ink}
          strokeWidth="1.9"
          strokeLinecap="round"
        />
        {/* Base / piso */}
        <path d="M3 35h34" stroke={ink} strokeWidth="1.9" strokeLinecap="round" />

        {/* Fio do pendente */}
        <path d="M20 9v7.5" stroke={brass} strokeWidth="1.4" strokeLinecap="round" />
        {/* Cúpula da luminária */}
        <path
          d="M14.4 24.2 20 16.4l5.6 7.8H14.4Z"
          fill={brass}
          fillOpacity={tone === "light" ? "0.28" : "0.16"}
          stroke={brass}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Halo de luz projetado no piso */}
        <path
          d="M16 30.6h8"
          stroke={brass}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />
      </svg>

      {variant === "full" && (
        <span
          className="font-display text-[1.35rem] leading-none tracking-[-0.02em]"
          style={{ color: ink }}
        >
          Decorar
        </span>
      )}
    </span>
  );
}
