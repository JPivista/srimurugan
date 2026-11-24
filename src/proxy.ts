import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, decryptSession, safeNext } from "@/lib/session";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const inBooks = path === "/app" || path.startsWith("/app/");
  if (!inBooks) return NextResponse.next();

  const session = decryptSession(request.cookies.get(COOKIE_NAME)?.value);
  const isLogin = path === "/app/login";

  if (!session && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/app/login";
    url.search = "";
    if (path !== "/app") url.searchParams.set("next", safeNext(path));
    return NextResponse.redirect(url);
  }

  if (session && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app", "/app/:path*"],
};
