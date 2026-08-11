"use client";

import { Check } from "lucide-react";

import {
  checkPassword,
  PASSWORD_RULES,
  passwordStrength,
  STRENGTH_LABELS,
} from "@/lib/password";
import { cn } from "@/lib/utils";

/**
 * Requisitos e força da senha, atualizados enquanto o usuário digita.
 *
 * As regras vêm do mesmo módulo que a Server Action usa para validar, então é
 * impossível a interface aprovar algo que o servidor recusaria — e vice-versa.
 * Usado no cadastro e na troca de senha.
 */
export function PasswordRules({ value }: { value: string }) {
  const check = checkPassword(value);
  const forca = passwordStrength(value);
  const faltando = new Set(check.faltando.map((r) => r.id));

  const cores = ["bg-sand", "bg-danger", "bg-clay", "bg-brass", "bg-success"];

  return (
    <div className="mt-2.5 space-y-2.5">
      <div>
        <div className="flex gap-1" aria-hidden="true">
          {[1, 2, 3, 4].map((nivel) => (
            <span
              key={nivel}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                nivel <= forca ? cores[forca] : "bg-sand",
              )}
            />
          ))}
        </div>
        <p role="status" aria-live="polite" className="mt-1.5 text-[0.6875rem] text-dusk">
          {value ? `Força: ${STRENGTH_LABELS[forca]}` : "Use letras, números e um símbolo"}
        </p>
      </div>

      <ul className="grid gap-1.5 sm:grid-cols-2">
        {PASSWORD_RULES.map((rule) => {
          const ok = value.length > 0 && !faltando.has(rule.id);
          return (
            <li
              key={rule.id}
              className={cn(
                "flex items-center gap-1.5 text-[0.6875rem] transition-colors",
                ok ? "text-success" : "text-mute",
              )}
            >
              <Check className={cn("h-3 w-3 shrink-0", !ok && "opacity-35")} aria-hidden="true" />
              {rule.label}
            </li>
          );
        })}
      </ul>

      {/* Cumpre as regras mas ainda é adivinhável (palavra comum, sequência). */}
      {check.fraca && value.length > 0 && (
        <p className="text-[0.6875rem] leading-snug text-clay">{check.fraca}</p>
      )}
    </div>
  );
}
