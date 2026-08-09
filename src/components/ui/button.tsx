import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium " +
  "transition-[background-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "disabled:pointer-events-none disabled:opacity-45 active:scale-[0.985] cursor-pointer";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-linen shadow-[0_1px_2px_rgba(22,18,15,0.18)] hover:bg-bark hover:shadow-[0_10px_28px_-12px_rgba(22,18,15,0.55)]",
  secondary:
    "bg-brass text-white hover:bg-[#916b3a] shadow-[0_1px_2px_rgba(164,123,69,0.25)] hover:shadow-[0_10px_28px_-12px_rgba(164,123,69,0.6)]",
  outline:
    "border border-sand-deep bg-transparent text-ink hover:border-ink hover:bg-canvas",
  ghost: "text-dusk hover:text-ink hover:bg-sand/50",
  danger: "bg-danger text-white hover:bg-[#7f261d]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-[0.9375rem]",
};

export function buttonStyles(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return <button type={type} className={buttonStyles(variant, size, className)} {...props} />;
}
