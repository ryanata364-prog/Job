import { createClient } from '@supabase/supabase-js';

const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey        = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const key = serviceRoleKey && serviceRoleKey !== 'your-service-role-key-here'
  ? serviceRoleKey
  : anonKey;

if (!key) {
  console.warn('Missing Supabase key in environment variables.');
}

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  key || 'placeholder',
  { auth: { autoRefreshToken: false, persistSession: false } }
);