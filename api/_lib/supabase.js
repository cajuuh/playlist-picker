import { createClient } from '@supabase/supabase-js';

// Server-only: uses the service-role key, which bypasses Row Level Security.
// Never import this from client code or expose the key with a VITE_ prefix.
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
