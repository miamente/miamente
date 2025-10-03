import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Check if the request is coming from admin subdomain
  const isAdminSubdomain = hostname.startsWith("admin.");

  // If it's admin subdomain, redirect to admin routes
  if (isAdminSubdomain) {
    // Remove the admin subdomain and redirect to admin routes
    const adminUrl = new URL(request.url);
    adminUrl.hostname = adminUrl.hostname.replace("admin.", "");

    // Map admin subdomain paths to admin routes
    if (pathname === "/" || pathname === "") {
      // Root admin subdomain should redirect to admin login
      adminUrl.pathname = "/admin/login";
    } else if (pathname === "/login") {
      // Admin subdomain login should redirect to admin login
      adminUrl.pathname = "/admin/login";
    } else if (pathname.startsWith("/admin")) {
      // Direct admin routes stay as they are
      adminUrl.pathname = pathname;
    } else if (pathname.startsWith("/users")) {
      adminUrl.pathname = `/admin/users${pathname.replace("/users", "")}`;
    } else if (pathname.startsWith("/professionals")) {
      adminUrl.pathname = `/admin/professionals${pathname.replace("/professionals", "")}`;
    } else if (pathname.startsWith("/specialties")) {
      adminUrl.pathname = `/admin/specialties${pathname.replace("/specialties", "")}`;
    } else if (pathname.startsWith("/approaches")) {
      adminUrl.pathname = `/admin/approaches${pathname.replace("/approaches", "")}`;
    } else {
      adminUrl.pathname = `/admin${pathname}`;
    }

    return NextResponse.redirect(adminUrl);
  }

  // For non-admin subdomains, continue with normal routing
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
