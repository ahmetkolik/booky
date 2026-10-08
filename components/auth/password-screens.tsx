"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLang } from "@/components/i18n/language-provider";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="flex h-14 items-center justify-between px-6">
        <Link href="/">
          <Logo />
        </Link>
        <LanguageToggle />
      </header>
      <main className="mx-auto mt-16 w-full max-w-sm space-y-6 px-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </main>
    </div>
  );
}

/** /forgot-password — emails a reset link that lands on /reset-password. */
export function ForgotPasswordScreen() {
  const { lang } = useLang();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) return;
    setLoading(true);
    setError(null);
    const { error: resetError } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (resetError) setError(resetError.message);
    else setSent(true);
  }

  return (
    <Shell
      title={lang === "tr" ? "Şifreni sıfırla" : "Reset your password"}
      subtitle={
        lang === "tr"
          ? "Hesabının e-postasını yaz, sana bir sıfırlama linki gönderelim."
          : "Enter your account email and we'll send you a reset link."
      }
    >
      {!supabaseConfigured ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          {lang === "tr" ? "Demo modunda şifre yok — her e-posta/şifre çalışır." : "Demo mode has no passwords — any email/password works."}
        </p>
      ) : sent ? (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          {lang === "tr"
            ? "Bu e-postaya kayıtlı bir hesap varsa sıfırlama linki gönderildi. Gelen kutunu kontrol et."
            : "If an account exists for that email, a reset link is on its way. Check your inbox."}
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fp-email">E-posta</Label>
            <Input id="fp-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
          <Button type="submit" disabled={loading || !email.trim()} className="w-full gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {lang === "tr" ? "Sıfırlama linki gönder" : "Send reset link"}
          </Button>
        </form>
      )}
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          {lang === "tr" ? "← Girişe dön" : "← Back to sign in"}
        </Link>
      </p>
    </Shell>
  );
}

/** /reset-password — reached from the email link (session set by /auth/callback). */
export function ResetPasswordScreen() {
  const { lang } = useLang();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) return;
    let cancelled = false;
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (!cancelled) setHasSession(Boolean(data.session));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(lang === "tr" ? "Şifre en az 8 karakter olmalı." : "Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError(lang === "tr" ? "Şifreler eşleşmiyor." : "Passwords don't match.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/dashboard");
  }

  const expired = supabaseConfigured && hasSession === false;

  return (
    <Shell
      title={lang === "tr" ? "Yeni şifre belirle" : "Choose a new password"}
      subtitle={lang === "tr" ? "En az 8 karakter kullan." : "Use at least 8 characters."}
    >
      {expired ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {lang === "tr" ? "Bu link geçersiz ya da süresi dolmuş. " : "This link is invalid or has expired. "}
          <Link href="/forgot-password" className="font-medium underline">
            {lang === "tr" ? "Yeni link iste" : "Request a new one"}
          </Link>
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rp-pass">{lang === "tr" ? "Yeni şifre" : "New password"}</Label>
            <Input id="rp-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rp-confirm">{lang === "tr" ? "Yeni şifre (tekrar)" : "Confirm new password"}</Label>
            <Input id="rp-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
          <Button type="submit" disabled={loading || !supabaseConfigured} className="w-full gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {lang === "tr" ? "Şifreyi güncelle" : "Update password"}
          </Button>
        </form>
      )}
    </Shell>
  );
}
