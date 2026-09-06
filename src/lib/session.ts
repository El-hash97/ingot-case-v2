import { cookies } from "next/headers";

/**
 * ponytail: hand-rolled signed-cookie session instead of pulling in
 * next-auth. Two roles, one credentials form, no OAuth — an HMAC-signed
 * JSON cookie is the whole feature. Upgrade to next-auth/Auth.js if SSO
 * or extra providers ever show up.
 *
 * Uses Web Crypto (SubtleCrypto) rather than Node's `crypto` module —
 * this file is imported by middleware.ts, which runs in the Edge
 * runtime where Node's HMAC APIs aren't available.
 */

export type SessionPayload = {
  userId: string;
  name: string;
  username: string;
  role: "OPERATOR" | "LEADER";
  exp: number; // epoch ms
};

const COOKIE_NAME = "session";
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12h — long enough for one shift

let cachedKey: Promise<CryptoKey> | null = null;
function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  cachedKey = crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return cachedKey;
}

export async function createSessionCookie(payload: Omit<SessionPayload, "exp">): Promise<string> {
  const full: SessionPayload = { ...payload, exp: Date.now() + MAX_AGE_MS };
  const body = Buffer.from(JSON.stringify(full)).toString("base64url");
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return `${body}.${Buffer.from(sig).toString("base64url")}`;
}

export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify("HMAC", key, Buffer.from(sig, "base64url"), new TextEncoder().encode(body));
    if (!valid) return null;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export async function setSessionCookie(payload: Omit<SessionPayload, "exp">) {
  const store = await cookies();
  store.set(COOKIE_NAME, await createSessionCookie(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_MS / 1000,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
