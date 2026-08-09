import { z } from "zod";

import {
  CATEGORY_SLUGS,
  CONDITION_VALUES,
  LISTING_STATUS_VALUES,
  UF_VALUES,
} from "@/lib/taxonomy";

const trimmed = (max: number) => z.string().trim().max(max);

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, "E-mail inválido")
  .max(160, "E-mail muito longo")
  .email("E-mail inválido");

export const passwordSchema = z
  .string()
  .min(8, "A senha precisa de pelo menos 8 caracteres")
  .max(72, "A senha pode ter no máximo 72 caracteres") // limite do bcrypt
  .refine((v) => /[a-zA-Z]/.test(v), "Inclua ao menos uma letra")
  .refine((v) => /[0-9]/.test(v), "Inclua ao menos um número");

export const registerSchema = z
  .object({
    name: trimmed(80).min(2, "Informe seu nome"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "É preciso aceitar os termos" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe sua senha").max(72),
});

export const profileSchema = z.object({
  name: trimmed(80).min(2, "Informe seu nome"),
  phone: trimmed(20).optional().or(z.literal("")),
  city: trimmed(60).optional().or(z.literal("")),
  state: z.enum(UF_VALUES).optional().or(z.literal("")),
  bio: trimmed(400).optional().or(z.literal("")),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual").max(72),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export const storeSchema = z.object({
  name: trimmed(60).min(2, "Informe o nome da loja"),
  tagline: trimmed(90).optional().or(z.literal("")),
  description: trimmed(800).optional().or(z.literal("")),
  city: trimmed(60).optional().or(z.literal("")),
  state: z.enum(UF_VALUES).optional().or(z.literal("")),
  whatsapp: trimmed(20).optional().or(z.literal("")),
  instagram: trimmed(40).optional().or(z.literal("")),
});

/** Preco em centavos: R$ 1,00 a R$ 500.000,00 */
const priceCents = z
  .number()
  .int("Preço inválido")
  .min(100, "O preço mínimo é R$ 1,00")
  .max(50_000_000, "O preço máximo é R$ 500.000,00");

export const listingSchema = z
  .object({
    title: trimmed(90).min(6, "O título precisa de pelo menos 6 caracteres"),
    description: trimmed(3000).min(20, "Descreva a peça com pelo menos 20 caracteres"),
    priceCents,
    originalPriceCents: priceCents.nullable().optional(),
    category: z.enum(CATEGORY_SLUGS, {
      errorMap: () => ({ message: "Escolha uma categoria" }),
    }),
    condition: z.enum(CONDITION_VALUES, {
      errorMap: () => ({ message: "Escolha o estado de conservação" }),
    }),
    material: trimmed(40).optional().or(z.literal("")),
    color: trimmed(30).optional().or(z.literal("")),
    brand: trimmed(40).optional().or(z.literal("")),
    city: trimmed(60).min(2, "Informe a cidade"),
    state: z.enum(UF_VALUES, { errorMap: () => ({ message: "Escolha o estado" }) }),
    status: z.enum(LISTING_STATUS_VALUES),
    negotiable: z.boolean(),
    deliveryAvailable: z.boolean(),
    images: z
      .array(z.string().min(1))
      .min(1, "Envie pelo menos uma imagem")
      .max(8, "Máximo de 8 imagens por anúncio"),
  })
  .refine(
    (d) => !d.originalPriceCents || d.originalPriceCents > d.priceCents,
    {
      message: "O preço original precisa ser maior que o preço atual",
      path: ["originalPriceCents"],
    },
  );

export type ListingInput = z.infer<typeof listingSchema>;

export const searchParamsSchema = z.object({
  q: trimmed(80).optional(),
  categoria: z.enum(CATEGORY_SLUGS).optional(),
  condicao: z.enum(CONDITION_VALUES).optional(),
  uf: z.enum(UF_VALUES).optional(),
  cidade: trimmed(60).optional(),
  min: z.coerce.number().int().min(0).max(500_000).optional(),
  max: z.coerce.number().int().min(0).max(500_000).optional(),
  entrega: z.coerce.boolean().optional(),
  ordem: z.enum(["recentes", "menor-preco", "maior-preco", "populares"]).default("recentes"),
  pagina: z.coerce.number().int().min(1).max(500).default(1),
});

export type SearchQuery = z.infer<typeof searchParamsSchema>;

/** Converte erros do zod em `{ campo: mensagem }` para exibir no formulario. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
