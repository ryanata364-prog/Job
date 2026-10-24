/**
 * Creates a Supabase client for use in Route Handlers.
 * Uses @supabase/ssr so that supabase.auth.getUser() resolves the
 * session set by the browser-side supabase.auth.signInWithPassword().
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createRouteClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]),
            );
          } catch {
            // setAll is called from Server Components where cookies can't be set.
            // Middleware handles token refresh instead.
          }
        },
      },
    },
  );
}
