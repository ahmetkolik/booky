import { createBrowserClient } from "@supabase/ssr";

/** True once real Supabase keys are present; false means the app stays in demo mode. */
export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/** Browser client for Client Components — respects RLS as the signed-in user (or anon). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
