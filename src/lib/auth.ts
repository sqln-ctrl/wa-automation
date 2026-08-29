// Minimal single-admin auth. Since this is a single-business app, we use one
// AdminUser record (or env-var fallback) rather than a full multi-user role system.
//
// Uses `jose` (not `jsonwebtoken`) because this file is imported from middleware.ts,
// which runs on the Edge runtime — jsonwebtoken depends on Node's `crypto` module
// and silently fails to verify tokens there, which lets unauthenticated requests
// through instead of redirecting to /login.
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "insecure-dev-secret-change-me");
const COOKIE_NAME = "session_token";

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (admin) {
    return bcrypt.compare(password, admin.passwordHash);
  }
  // Fallback to env vars for the very first login before an AdminUser row exists.
  if (
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_PASSWORD_HASH &&
    email === process.env.ADMIN_EMAIL
  ) {
    return bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  }
  return false;
}

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { email: string };
  } catch {
    return null;
  }
}

/**
 * Reads and verifies the session cookie from a server component or route handler
 * (Node runtime, not middleware/edge). Returns the logged-in admin's email, or null.
 */
export async function getCurrentAdminEmail(): Promise<string | null> {
  const { cookies } = await import("next/headers");
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  return session?.email ?? null;
}

export { COOKIE_NAME };
