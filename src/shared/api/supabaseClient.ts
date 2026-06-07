/**
 * Supabase client (no-auth demo setup).
 *
 * Credentials come from .env:
 *   VITE_SUPABASE_URL=...
 *   VITE_SUPABASE_ANON_KEY=...
 *
 * There is no end-user authentication: the app reads whichever account row
 * in `accounts` has is_active = true (toggled directly in the database).
 */
import { createClient } from '@supabase/supabase-js';
import { env } from '@/shared/config/env';

export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
