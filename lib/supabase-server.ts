/**
 * Server-only Supabase client using the SERVICE ROLE key.
 * NEVER import this in client components — it bypasses RLS.
 * Only used in Next.js API route handlers (app/api/...).
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey        = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use service role if configured, otherwise fall back to anon key
// (service role is required for admin operations like listUsers)
const key = serviceRoleKey && serviceRoleKey !== 'your-service-role-key-here'
  ? serviceRoleKey
  : anonKey;

if (!key) {
  throw new Error('Missing Supabase key in environment variables.');
}

export const supabaseAdmin = createClient(supabaseUrl, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});
