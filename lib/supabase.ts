/**
 * Browser-side Supabase client.
 * Uses @supabase/ssr's createBrowserClient so the session is stored in
 * cookies (not localStorage), making it readable by server Route Handlers.
 */
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
