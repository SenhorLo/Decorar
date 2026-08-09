import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-md border bg-canvas px-3.5 text-sm text-ink placeholder:text-mute " +
  "transition-colors duration-200 outline-none " +
  "focus:border-brass focus:ring-2 focus:ring-brass/20 disabled:opacity-50";

const controlIdle = "border-sand-deep hover:border-dusk/60";
const controlError = "border-danger focus:border-danger focus:ring-danger/20";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-[0.8125rem] font-medium tracking-wide text-bark"
        >
          {label}
          {required && <span className="ml-0.5 text-clay">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[0.75rem] leading-snug text-danger">{error}</p>
      ) : hint ? (
        <p className="text-[0.75rem] leading-snug text-dusk">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(controlBase, "h-11", invalid ? controlError : controlIdle, className)}
      {...props}
    />
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export function Textarea({ className, invalid, rows = 5, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        controlBase,
        "resize-y py-3 leading-relaxed",
        invalid ? controlError : controlIdle,
        className,
      )}
      {...props}
    />
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export function Select({ className, invalid, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={cn(
          controlBase,
          "h-11 appearance-none pr-9",
          invalid ? controlError : controlIdle,
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 12 12"
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 h-3 w-3 -translate-y-1/2 text-dusk"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="m2.5 4.5 3.5 3.5 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Checkbox({
  label,
  description,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; description?: string }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-sm", className)}>
      <input
        type="checkbox"
        className="mt-0.5 h-[1.05rem] w-[1.05rem] shrink-0 cursor-pointer rounded-xs border-sand-deep text-brass accent-[#a47b45]"
        {...props}
      />
      <span>
        <span className="block leading-snug text-bark">{label}</span>
        {description && (
          <span className="mt-0.5 block text-[0.75rem] leading-snug text-dusk">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "brass" | "forest" | "clay" | "muted";
  className?: string;
}) {
  const tones = {
    neutral: "bg-sand/70 text-bark",
    brass: "bg-brass-wash text-brass",
    forest: "bg-forest text-linen",
    clay: "bg-clay/12 text-clay",
    muted: "bg-transparent text-dusk ring-1 ring-inset ring-sand-deep",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.08em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className="rounded-md border border-danger/25 bg-danger/6 px-3.5 py-2.5 text-[0.8125rem] leading-snug text-danger"
    >
      {children}
    </div>
  );
}

export function FormSuccess({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="status"
      className="rounded-md border border-success/25 bg-success/6 px-3.5 py-2.5 text-[0.8125rem] leading-snug text-success"
    >
      {children}
    </div>
  );
}
