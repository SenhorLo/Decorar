"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/actions/types";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildSearchIndex } from "@/lib/listings";
import { isGeneratedArt } from "@/lib/art";
import { deleteUpload, isManagedUploadUrl } from "@/lib/uploads";
import { parseBRLToCents } from "@/lib/utils";
import { fieldErrors, listingSchema } from "@/lib/validators";
import { LISTING_STATUS_VALUES } from "@/lib/taxonomy";

/** Lê o formulário e devolve o objeto no formato esperado pelo schema. */
function readListingForm(formData: FormData) {
  const original = String(formData.get("originalPrice") ?? "").trim();

  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    priceCents: parseBRLToCents(String(formData.get("price") ?? "")) ?? -1,
    originalPriceCents: original ? (parseBRLToCents(original) ?? -1) : null,
    category: String(formData.get("category") ?? ""),
    condition: String(formData.get("condition") ?? ""),
    material: String(formData.get("material") ?? ""),
    color: String(formData.get("color") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    status: String(formData.get("status") ?? "ATIVO"),
    negotiable: formData.get("negotiable") === "on",
    deliveryAvailable: formData.get("deliveryAvailable") === "on",
    images: formData.getAll("images").map(String).filter(Boolean),
  };
}

/** Mantém no formulário o que o usuário já digitou quando há erro. */
function echoValues(formData: FormData): Record<string, string> {
  const keys = [
    "title", "description", "price", "originalPrice", "category", "condition",
    "material", "color", "brand", "city", "state", "status",
  ];
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = String(formData.get(k) ?? "");
  out.negotiable = formData.get("negotiable") === "on" ? "on" : "";
  out.deliveryAvailable = formData.get("deliveryAvailable") === "on" ? "on" : "";
  out.images = formData.getAll("images").map(String).filter(Boolean).join("|");
  return out;
}

/**
 * Só aceita URLs que o próprio servidor gerou: disco local, Vercel Blob ou
 * uma placa ilustrada. Bloqueia injeção de URL externa — sem isto daria para
 * apontar o anúncio para um pixel de rastreamento ou um host arbitrário.
 *
 * Devolve os descartados junto: se todas as imagens caírem aqui, o usuário
 * receberia "envie pelo menos uma imagem" — uma mensagem que culpa quem
 * acabou de enviar as fotos e esconde que o problema é de configuração.
 */
function sanitizeImages(urls: string[]): { aceitas: string[]; recusadas: string[] } {
  const aceitas: string[] = [];
  const recusadas: string[] = [];

  for (const url of urls) {
    if (isManagedUploadUrl(url) || isGeneratedArt(url)) aceitas.push(url);
    else recusadas.push(url);
  }

  return { aceitas: aceitas.slice(0, 8), recusadas };
}

/** Erro comum a criar e editar quando as imagens enviadas foram recusadas. */
function erroDeImagensRecusadas(recusadas: string[]): ActionState {
  console.error(
    "[listings] URLs de imagem recusadas pela validação de origem:",
    recusadas.map((u) => u.slice(0, 120)),
  );

  return {
    error:
      "As imagens enviadas vieram de uma origem que o servidor não reconhece, " +
      "então o anúncio não foi salvo. Isso costuma ser configuração do " +
      "armazenamento — o endereço recusado ficou registrado no log do servidor.",
  };
}

export async function createListingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/anuncios/novo");

  const raw = readListingForm(formData);
  const imagens = sanitizeImages(raw.images);
  raw.images = imagens.aceitas;

  if (imagens.aceitas.length === 0 && imagens.recusadas.length > 0) {
    return { ...erroDeImagensRecusadas(imagens.recusadas), values: echoValues(formData) };
  }

  const parsed = listingSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error), values: echoValues(formData) };
  }

  const data = parsed.data;

  const listing = await prisma.listing.create({
    data: {
      sellerId: user.id,
      title: data.title,
      description: data.description,
      priceCents: data.priceCents,
      originalPriceCents: data.originalPriceCents ?? null,
      category: data.category,
      condition: data.condition,
      material: data.material || null,
      color: data.color || null,
      brand: data.brand || null,
      city: data.city,
      state: data.state,
      status: data.status,
      negotiable: data.negotiable,
      deliveryAvailable: data.deliveryAvailable,
      searchIndex: buildSearchIndex(data),
      images: {
        create: data.images.map((url, index) => ({
          url,
          alt: data.title,
          position: index,
        })),
      },
    },
    select: { id: true },
  });

  revalidatePath("/anuncios");
  revalidatePath("/painel/anuncios");
  redirect(`/painel/anuncios?criado=${listing.id}`);
}

export async function updateListingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Anúncio não encontrado." };

  // Checagem de dono no servidor — nunca confie no que veio do formulário.
  const current = await prisma.listing.findUnique({
    where: { id },
    select: { sellerId: true, images: { select: { url: true } } },
  });

  if (!current) return { error: "Anúncio não encontrado." };
  if (current.sellerId !== user.id && user.role !== "ADMIN") {
    return { error: "Você não tem permissão para editar este anúncio." };
  }

  const raw = readListingForm(formData);
  const imagens = sanitizeImages(raw.images);
  raw.images = imagens.aceitas;

  if (imagens.aceitas.length === 0 && imagens.recusadas.length > 0) {
    return { ...erroDeImagensRecusadas(imagens.recusadas), values: echoValues(formData) };
  }

  const parsed = listingSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error), values: echoValues(formData) };
  }

  const data = parsed.data;

  await prisma.$transaction([
    prisma.listingImage.deleteMany({ where: { listingId: id } }),
    prisma.listing.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        priceCents: data.priceCents,
        originalPriceCents: data.originalPriceCents ?? null,
        category: data.category,
        condition: data.condition,
        material: data.material || null,
        color: data.color || null,
        brand: data.brand || null,
        city: data.city,
        state: data.state,
        status: data.status,
        negotiable: data.negotiable,
        deliveryAvailable: data.deliveryAvailable,
        searchIndex: buildSearchIndex(data),
        images: {
          create: data.images.map((url, index) => ({
            url,
            alt: data.title,
            position: index,
          })),
        },
      },
    }),
  ]);

  // Remove do disco as fotos que saíram do anúncio.
  const removed = current.images
    .map((i) => i.url)
    .filter((url) => isManagedUploadUrl(url) && !data.images.includes(url));
  await Promise.all(removed.map(deleteUpload));

  revalidatePath("/anuncios");
  revalidatePath(`/anuncios/${id}`);
  revalidatePath("/painel/anuncios");

  return { success: "Anúncio atualizado." };
}

export async function deleteListingAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { sellerId: true, images: { select: { url: true } } },
  });

  if (!listing) return;
  if (listing.sellerId !== user.id && user.role !== "ADMIN") return;

  await prisma.listing.delete({ where: { id } });
  await Promise.all(
    listing.images.map((i) => i.url).filter(isManagedUploadUrl).map(deleteUpload),
  );

  revalidatePath("/anuncios");
  revalidatePath("/painel/anuncios");
  redirect("/painel/anuncios?removido=1");
}

export async function setListingStatusAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !LISTING_STATUS_VALUES.includes(status)) return;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { sellerId: true },
  });
  if (!listing) return;
  if (listing.sellerId !== user.id && user.role !== "ADMIN") return;

  await prisma.listing.update({ where: { id }, data: { status } });

  revalidatePath("/anuncios");
  revalidatePath(`/anuncios/${id}`);
  revalidatePath("/painel/anuncios");
}
