import { SignJWT, jwtVerify } from "jose";

/**
 * Camada de token — sem dependencia de `next/headers` nem do Prisma,
 * para poder rodar tambem no runtime edge (middleware).
 */

export const SESSION_COOKIE = "decorar_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

const ISSUER = "decorar";
const AUDIENCE = "decorar-app";

export type SessionPayload = {
  uid: string;
  /** Espelha User.sessionVersion — permite revogar sessoes antigas. */
  ver: number;
  role: "USER" | "ADMIN";
};

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET ausente ou com menos de 32 caracteres. Defina no .env antes de subir a aplicacao.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ver: payload.ver, role: payload.role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.uid)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

/** Retorna null para qualquer token invalido, expirado ou adulterado. */
export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });

    if (typeof payload.sub !== "string") return null;
    const ver = typeof payload.ver === "number" ? payload.ver : null;
    if (ver === null) return null;
    const role = payload.role === "ADMIN" ? "ADMIN" : "USER";

    return { uid: payload.sub, ver, role };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
} as const;
