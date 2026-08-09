"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/actions/types";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteUpload, isManagedUploadUrl, saveImage } from "@/lib/uploads";
import { slugify } from "@/lib/utils";
import { fieldErrors, storeSchema } from "@/lib/validators";

/** Gera um slug livre a partir do nome (loja-abc, loja-abc-2, ...). */
async function uniqueSlug(name: string, ignoreStoreId?: string): Promise<string> {
  const base = slugify(name) || "loja";

  for (let attempt = 0; attempt < 40; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const taken = await prisma.store.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!taken || taken.id === ignoreStoreId) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}

export async function upsertStoreAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/painel/loja");

  const parsed = storeSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    description: String(formData.get("description") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    instagram: String(formData.get("instagram") ?? ""),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const d = parsed.data;
  const existing = await prisma.store.findUnique({ where: { ownerId: user.id } });

  const media: { logoUrl?: string; coverUrl?: string } = {};
  for (const key of ["logo", "cover"] as const) {
    const file = formData.get(key);
    if (file instanceof File && file.size > 0) {
      const saved = await saveImage(file);
      if (!saved.ok) return { error: saved.error };

      if (key === "logo") {
        media.logoUrl = saved.url;
        if (existing?.logoUrl) await deleteUpload(existing.logoUrl);
      } else {
        media.coverUrl = saved.url;
        if (existing?.coverUrl) await deleteUpload(existing.coverUrl);
      }
    }
  }

  const data = {
    name: d.name,
    tagline: d.tagline || null,
    description: d.description || null,
    city: d.city || null,
    state: d.state || null,
    // Guarda só o handle, sem "@" nem URL colada.
    instagram: d.instagram ? d.instagram.replace(/^@+/, "").replace(/^.*instagram\.com\//, "") : null,
    whatsapp: d.whatsapp ? d.whatsapp.replace(/\D/g, "").slice(0, 15) : null,
    ...media,
  };

  if (existing) {
    const slug =
      existing.name === d.name ? existing.slug : await uniqueSlug(d.name, existing.id);

    await prisma.store.update({ where: { id: existing.id }, data: { ...data, slug } });
    revalidatePath(`/loja/${slug}`);
  } else {
    const slug = await uniqueSlug(d.name);
    await prisma.store.create({ data: { ...data, slug, ownerId: user.id } });
    revalidatePath(`/loja/${slug}`);
  }

  revalidatePath("/painel/loja");
  revalidatePath("/painel");

  return { success: existing ? "Loja atualizada." : "Loja criada." };
}

export async function deleteStoreAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const store = await prisma.store.findUnique({
    where: { ownerId: user.id },
    select: { id: true, logoUrl: true, coverUrl: true },
  });
  if (!store) return;

  await prisma.store.delete({ where: { id: store.id } });
  await Promise.all(
    [store.logoUrl, store.coverUrl]
      .filter((u): u is string => Boolean(u && isManagedUploadUrl(u)))
      .map(deleteUpload),
  );

  revalidatePath("/painel/loja");
  redirect("/painel/loja?removida=1");
}
