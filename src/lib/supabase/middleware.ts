import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/auth/callback"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function getSupabasePublicEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });
  const supabaseEnv = getSupabasePublicEnv();

  if (!supabaseEnv) {
    console.error("[middleware] Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
    if (isPublicPath(pathname)) {
      return response;
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let user: { id: string } | null = null;

  try {
    const supabase = createServerClient(supabaseEnv.url, supabaseEnv.anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
      db: { schema: (process.env.SUPABASE_DB_SCHEMA as "public") || "public" },
    });

    const {
      data: { user: resolvedUser },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      if (error.message !== "Auth session missing!") {
        console.error("[middleware] Supabase auth.getUser failed:", error.message);
      }
    } else {
      user = resolvedUser;
    }
  } catch (error) {
    console.error("[middleware] Supabase session update failed:", error);
  }

  // Allow public paths
  if (isPublicPath(pathname)) {
    // Redirect authenticated users away from auth pages
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return response;
  }

  // Protect all other routes
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

