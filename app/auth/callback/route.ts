import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/client";

/**
 * GET /auth/callback — where Supabase's confirmation / magic-link emails land.
 *
 * Exchanges the one-time code (PKCE) or token hash for a session cookie, then
 * sends the user on: to `next` (default /onboarding, which itself forwards
 * owners who already have a business to the dashboard).
 *
 * If the link was opened on another device the PKCE verifier isn't there, but
 * Supabase has already confirmed the email by this point — so we send them to
 * the login screen with a "confirmed, now sign in" notice instead of an error.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "/onboarding";
  // Only allow same-site relative redirects.
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/onboarding";

  if (!supabaseConfigured) return NextResponse.redirect(`${origin}/login`);

  const supabase = await createClient();
  let ok = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  }

  if (ok) return NextResponse.redirect(`${origin}${next}`);
  return NextResponse.redirect(`${origin}/login?confirmed=1`);
}
