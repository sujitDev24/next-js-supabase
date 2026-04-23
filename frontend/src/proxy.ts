import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseClientWithCookies } from "./lib/supabase/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  // ✅ No duplicated env/client setup — just pass cookie handlers
  const supabase = createSupabaseClientWithCookies({
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) =>
        request.cookies.set(name, value)
      );
      supabaseResponse = NextResponse.next({ request });
      cookiesToSet.forEach(({ name, value, options }) =>
        supabaseResponse.cookies.set(name, value, options)
      );
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const protectedRoutes = ["/dashboard", "/profile", "/settings", "/blogs", "/mentor/dashboard", "/mentor/challenges"];
  const authRoutes = ["/login", "/register", "forgot-password"];

  if (user && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
    "/dashboard", 
    "/profile", 
    "/settings", 
    "/blogs",
    "/mentor/dashboard",
    "/mentor/challenges",

  ],
};