"use server";

import { redirect } from "next/navigation";

import type { ActionState } from "@/actions/types";
import {
  destroySession,
  fakePasswordCheck,
  getCurrentUser,
  hashPassword,
  startSession,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { safeRedirectPath } from "@/lib/utils";
import { fieldErrors, loginSchema, registerSchema } from "@/lib/validators";

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    acceptTerms: formData.get("acceptTerms") === "on",
  };

  const values = { name: raw.name, email: raw.email };

  const ip = await clientIp();
  const limit = rateLimit(`register:${ip}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
    blockMs: 30 * 60 * 1000,
  });
  if (!limit.ok) {
    return {
      error: `Muitas contas criadas deste dispositivo. Tente novamente em ${Math.ceil(limit.retryAfter / 60)} min.`,
      values,
    };
  }

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error), values };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return {
      fieldErrors: { email: "Já existe uma conta com este e-mail." },
      values,
    };
  }

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
    select: { id: true, role: true, sessionVersion: true },
  });

  resetRateLimit(`register:${ip}`);
  await startSession(user);

  // redirect() lança para interromper a action — fora de try/catch de propósito.
  redirect("/painel?bemvindo=1");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const nextPath = safeRedirectPath(String(formData.get("next") ?? ""), "/painel");
  const values = { email: raw.email };

  const ip = await clientIp();
  const emailKey = raw.email.trim().toLowerCase();

  // Dois limites: por IP (bloqueia varredura) e por e-mail (bloqueia
  // força bruta distribuída contra uma conta específica).
  for (const key of [`login:ip:${ip}`, `login:email:${emailKey}`]) {
    const limit = rateLimit(key, {
      limit: 8,
      windowMs: 15 * 60 * 1000,
      blockMs: 15 * 60 * 1000,
    });
    if (!limit.ok) {
      return {
        error: `Muitas tentativas. Aguarde ${Math.ceil(limit.retryAfter / 60)} min e tente de novo.`,
        values,
      };
    }
  }

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error), values };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, role: true, sessionVersion: true, passwordHash: true },
  });

  if (!user) {
    // Gasta o mesmo tempo de um bcrypt real para não revelar se o e-mail existe.
    await fakePasswordCheck(parsed.data.password);
    return { error: "E-mail ou senha incorretos.", values };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { error: "E-mail ou senha incorretos.", values };
  }

  resetRateLimit(`login:ip:${ip}`);
  resetRateLimit(`login:email:${emailKey}`);
  await startSession(user);

  redirect(nextPath);
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

/** Invalida todas as sessões ativas da conta (inclusive a atual). */
export async function logoutEverywhereAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { sessionVersion: { increment: 1 } },
    });
  }
  await destroySession();
  redirect("/login");
}
