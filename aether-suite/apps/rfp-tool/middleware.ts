import NextAuth from "next-auth";
import { authConfig } from "@aether/auth/config";

const { auth } = NextAuth(authConfig);

const protectedMatchers = ["/dashboard", "/api/ai", "/api/billing", "/admin", "/api/admin"];
const publicPathPattern = /^\/(|auth(?:\/.*)?|api\/health)$/;

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmail(email?: string | null): boolean {
  if (!email) {
    return false;
  }

  return getAdminEmails().includes(email.toLowerCase());
}

export default auth((request) => {
  const { nextUrl, auth: session } = request;
  const pathname = nextUrl.pathname;

  const isProtected = protectedMatchers.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isPublic = publicPathPattern.test(pathname);
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (pathname.startsWith("/auth/signin") && session) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }

  if (isProtected && !session) {
    const callbackUrl = `${nextUrl.pathname}${nextUrl.search}`;
    const signinUrl = new URL("/auth/signin", nextUrl);
    signinUrl.searchParams.set("callbackUrl", callbackUrl);
    return Response.redirect(signinUrl);
  }

  if (isAdminRoute && !isAdminEmail(session?.user?.email)) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }

  if (!isPublic && !isProtected) {
    return undefined;
  }

  return undefined;
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/ai/:path*",
    "/api/billing/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/auth/signin",
  ],
};
