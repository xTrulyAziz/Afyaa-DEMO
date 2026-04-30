import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  // Pass non-admin routes straight through
  if (!isAdminRoute) return NextResponse.next({ request });

  // Build a mutable response we can set cookies on
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write into both the request (for downstream) and the response (for the browser)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — MUST use getUser(), not getSession(), to validate server-side
  const { data: { user } } = await supabase.auth.getUser();

  if (process.env.NODE_ENV === "development") {
    console.log(`[proxy] ${pathname} | user: ${user?.email ?? "none"} | ADMIN_EMAIL: ${process.env.ADMIN_EMAIL}`);
  }

  const allowed = process.env.ADMIN_EMAIL;

  // Protect all /admin/* routes except /admin/login
  if (!isLoginPage) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    // Fail secure: if ADMIN_EMAIL is not configured, deny everyone.
    if (!allowed || user.email !== allowed) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // If already logged in and visiting /admin/login, redirect to dashboard
  // Only redirect if ADMIN_EMAIL is set and the user matches — otherwise let
  // the login page render its own error rather than bouncing to dashboard.
  if (isLoginPage && user && allowed && user.email === allowed) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return response;
}

export const config = {
  // Match /admin and all /admin/* paths
  matcher: ["/admin", "/admin/:path*"],
};
