// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySignedRoleCookie } from "./utils/role-cookies";

const PROTECTED_PATHS = ["/orders", "/make-tiffin"];
const ADMIN_ONLY_PATH = "/make-tiffin";
const ALLOWED_ADMIN_ROLES = new Set(["1", "2"]);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const userRoleCookie = request.cookies.get("tiffin.role")?.value;
  const isAuthenticated = request.cookies.has("tiffin.sid");
  const role = await verifySignedRoleCookie(userRoleCookie);
  const isProtectedRoute = PROTECTED_PATHS.some(
    (protectedPath) =>
      pathname === protectedPath || pathname.startsWith(`${protectedPath}/`)
  );

  console.log("Middleware check - Path:",role, pathname, "Authenticated:", isAuthenticated);
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    (pathname === ADMIN_ONLY_PATH ||
      pathname.startsWith(`${ADMIN_ONLY_PATH}/`)) &&
    (!role || !ALLOWED_ADMIN_ROLES.has(role))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [ "/orders/:path*", "/make-tiffin/:path*"],
};
