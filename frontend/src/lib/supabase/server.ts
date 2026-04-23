import { createServerClient,  type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";

function getEnvironmentVariables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

export async function createSupabaseServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getEnvironmentVariables();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      name: 'sb-auth-token', // ✅ must match browser.ts storageKey
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => 
            cookieStore.set(name, value, options)
          );
        } catch(error) {
          console.log(error)
        }
      }
    }
  });
}

// ✅ Used in proxy/middleware (caller provides cookie handlers)
export function createSupabaseClientWithCookies(
  cookieMethods: CookieMethodsServer
) {
  const { supabaseUrl, supabaseAnonKey } = getEnvironmentVariables();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: { name: "sb-auth-token" },
    cookies: cookieMethods,
  });
}