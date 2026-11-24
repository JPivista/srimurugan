import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, decryptSession, encryptSession } from "./session";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    expires,
    path: "/",
  };
}

export const verifySession = cache(async () => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const session = decryptSession(token);
  if (!session) redirect("/app/login");
  return { userId: session.userId };
});

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + WEEK_MS);
  const token = encryptSession(userId, expiresAt);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, cookieOptions(expiresAt));
}

export async function deleteSession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", cookieOptions(new Date(0)));
}
