"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/actions/types";
import {
  destroySession,
  getCurrentUser,
  hashPassword,
  startSession,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { saveImage, deleteUpload, isManagedUploadUrl } from "@/lib/uploads";
import { fieldErrors, passwordChangeSchema, profileSchema } from "@/lib/validators";

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/painel/configuracoes");

  const parsed = profileSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    bio: String(formData.get("bio") ?? ""),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  // Avatar é opcional; só troca se veio arquivo novo.
  let avatarUrl: string | undefined;
  const avatar = formData.get("avatar");
  if (avatar instanceof File && avatar.size > 0) {
    const saved = await saveImage(avatar);
    if (!saved.ok) return { error: saved.error };
    avatarUrl = saved.url;
    if (user.avatarUrl) await deleteUpload(user.avatarUrl);
  }

  const d = parsed.data;
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: d.name,
      phone: d.phone || null,
      city: d.city || null,
      state: d.state || null,
      bio: d.bio || null,
      ...(avatarUrl ? { avatarUrl } : {}),
    },
  });

  revalidatePath("/painel");
  revalidatePath("/painel/configuracoes");

  return { success: "Perfil atualizado." };
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/painel/configuracoes");

  const ip = await clientIp();
  const limit = rateLimit(`pwchange:${user.id}:${ip}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.ok) {
    return { error: "Muitas tentativas. Aguarde alguns minutos." };
  }

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!record) redirect("/login");

  const valid = await verifyPassword(parsed.data.currentPassword, record.passwordHash);
  if (!valid) {
    return { fieldErrors: { currentPassword: "Senha atual incorreta." } };
  }

  // Trocar a senha derruba as outras sessões (sessionVersion++) e
  // re-emite o cookie desta, para o usuário não se deslogar aqui.
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(parsed.data.newPassword),
      sessionVersion: { increment: 1 },
    },
    select: { id: true, role: true, sessionVersion: true },
  });

  await startSession(updated);

  return { success: "Senha alterada. As outras sessões foram encerradas." };
}

export async function deleteAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "").trim();

  if (confirmation !== "EXCLUIR") {
    return { fieldErrors: { confirmation: 'Digite EXCLUIR para confirmar.' } };
  }

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!record) redirect("/login");

  if (!(await verifyPassword(password, record.passwordHash))) {
    return { fieldErrors: { password: "Senha incorreta." } };
  }

  // Anúncios, imagens, loja e favoritos caem por cascade no schema.
  const images = await prisma.listingImage.findMany({
    where: { listing: { sellerId: user.id } },
    select: { url: true },
  });

  await prisma.user.delete({ where: { id: user.id } });

  await Promise.all(
    [...images.map((i) => i.url), user.avatarUrl ?? ""]
      .filter(isManagedUploadUrl)
      .map(deleteUpload),
  );

  await destroySession();
  redirect("/?conta=removida");
}
