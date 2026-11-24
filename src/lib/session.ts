import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE_NAME = "smf_session";

type SessionPayload = {
  userId: string;
  exp: number;
};

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) return null;
  return value;
}

export function authConfigured() {
  return Boolean(secret() && process.env.APP_PASSWORD);
}

export function encryptSession(userId: string, expiresAt: Date) {
  const key = secret();
  if (!key) throw new Error("SESSION_SECRET is not set.");
  const body = Buffer.from(
    JSON.stringify({ userId, exp: expiresAt.getTime() } satisfies SessionPayload),
    "utf8",
  ).toString("base64url");
  const sig = createHmac("sha256", key).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function decryptSession(token: string | undefined) {
  const key = secret();
  if (!key || !token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", key).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || typeof payload.exp !== "number" || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function credentialsMatch(username: string, password: string) {
  const expectedUser = process.env.APP_USERNAME || "admin";
  const expectedPass = process.env.APP_PASSWORD || "";
  if (!expectedPass || !secret()) return false;
  const userOk = timingSafeEqual(digest(username), digest(expectedUser));
  const passOk = timingSafeEqual(digest(password), digest(expectedPass));
  return userOk && passOk;
}

export function safeNext(value: string | undefined) {
  if (!value) return "/app";
  if (value !== "/app" && !value.startsWith("/app/")) return "/app";
  if (
    value.includes("..") ||
    value.includes("\\") ||
    value.includes("//") ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return "/app";
  }
  if (value.startsWith("/app/login")) return "/app";
  return value;
}
