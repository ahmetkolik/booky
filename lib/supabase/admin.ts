import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Service-role client — bypasses RLS. Only for trusted server code (webhooks, cron). */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
