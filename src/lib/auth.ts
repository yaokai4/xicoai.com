import "server-only";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "xico_admin";

function secret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "dev-insecure-secret-change-me-please",
  );
}

export async function createSession(username: string) {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySession(
  token: string | undefined | null,
): Promise<{ sub: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { sub: String(payload.sub ?? "admin") };
  } catch {
    return null;
  }
}

export function checkCredentials(username: string, password: string) {
  const u = process.env.ADMIN_USERNAME || "admin";
  const p = process.env.ADMIN_PASSWORD || "";
  return Boolean(p) && username === u && password === p;
}
