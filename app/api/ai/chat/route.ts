import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/client";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SYSTEM_PROMPT = `Sen Booky randevu yönetim sistemi için bir AI asistanısın.
Kullanıcılar sana randevular, hizmetler, gelir raporları, personel ve müşteri yönetimi hakkında sorular sorar.
Kısa, net ve Türkçe yanıtlar ver. Gerektiğinde İngilizce de yanıtlayabilirsin.
Sadece randevu ve işletme yönetimi ile ilgili sorulara yanıt ver.`;

const MAX_MESSAGE_CHARS = 1000;

/* Best-effort per-instance rate limit (serverless instances don't share it,
   but it stops a single client from hammering one warm instance). */
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const lang: "tr" | "en" = body.lang === "en" ? "en" : "tr";

  if (!message) {
    return NextResponse.json({ error: "Mesaj boş olamaz." }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json(
      { error: lang === "tr" ? "Mesaj çok uzun." : "Message is too long." },
      { status: 400 },
    );
  }

  if (!GEMINI_API_KEY) {
    // Demo mode: return a helpful canned response
    const demoResponses = {
      tr: "AI arama özelliği için .env.local dosyasına GEMINI_API_KEY eklemeniz gerekiyor. Google AI Studio'dan ücretsiz alabilirsiniz: aistudio.google.com",
      en: "To enable AI search, add GEMINI_API_KEY to your .env.local file. Get a free key from Google AI Studio: aistudio.google.com",
    };
    return NextResponse.json({ reply: demoResponses[lang] });
  }

  // With a real backend, only signed-in owners may spend the Gemini quota.
  let rateKey = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (supabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: lang === "tr" ? "Giriş yapmalısın." : "Sign in required." }, { status: 401 });
    }
    rateKey = user.id;
  }
  if (rateLimited(rateKey)) {
    return NextResponse.json(
      { error: lang === "tr" ? "Çok fazla istek. Birkaç dakika sonra tekrar dene." : "Too many requests. Try again in a few minutes." },
      { status: 429 },
    );
  }

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  const payload = {
    contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nKullanıcı sorusu: ${message}` }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // Log the provider's error server-side; never echo it to the browser.
      console.error("[ai/chat] Gemini error", res.status, await res.text().catch(() => ""));
      return NextResponse.json(
        { error: lang === "tr" ? "AI servisi şu anda yanıt veremiyor." : "The AI service isn't responding right now." },
        { status: 502 },
      );
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? (lang === "tr" ? "Yanıt alınamadı." : "No answer.");
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: lang === "tr" ? "AI servisi şu anda kullanılamıyor." : "The AI service is unavailable." },
      { status: 500 },
    );
  }
}
