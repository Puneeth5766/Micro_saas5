import NextAuth from "next-auth";
import { authConfig } from "@aether/auth/config";

const { auth } = NextAuth(authConfig);

const protectedMatchers = ["/dashboard", "/api/ai", "/api/billing"];
const publicPathPattern = /^\/(|auth(?:\/.*)?|api\/health)$/;

export default auth((request) => {
  const { nextUrl, auth: session } = request;
  const pathname = nextUrl.pathname;

  const isProtected = protectedMatchers.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isPublic = publicPathPattern.test(pathname);

  if (pathname.startsWith("/auth/signin") && session) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }

  if (isProtected && !session) {
    const callbackUrl = `${nextUrl.pathname}${nextUrl.search}`;
    const signinUrl = new URL("/auth/signin", nextUrl);
    signinUrl.searchParams.set("callbackUrl", callbackUrl);
    return Response.redirect(signinUrl);
  }

  if (!isPublic && !isProtected) {
    return undefined;
  }

  return undefined;
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/ai/:path*", "/api/billing/:path*", "/auth/signin"]
};
