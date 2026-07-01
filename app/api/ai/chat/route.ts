import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SYSTEM_PROMPT = `Sen Booky randevu yönetim sistemi için bir AI asistanısın.
Kullanıcılar sana randevular, hizmetler, gelir raporları, personel ve müşteri yönetimi hakkında sorular sorar.
Kısa, net ve Türkçe yanıtlar ver. Gerektiğinde İngilizce de yanıtlayabilirsin.
Sadece randevu ve işletme yönetimi ile ilgili sorulara yanıt ver.`;

export async function POST(req: NextRequest) {
  const { message, lang } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "Mesaj boş olamaz." }, { status: 400 });
  }

  if (!GEMINI_API_KEY) {
    // Demo mode: return a helpful canned response
    const demoResponses: Record<string, string> = {
      tr: "AI arama özelliği için .env.local dosyasına GEMINI_API_KEY eklemeniz gerekiyor. Google AI Studio'dan ücretsiz alabilirsiniz: aistudio.google.com",
      en: "To enable AI search, add GEMINI_API_KEY to your .env.local file. Get a free key from Google AI Studio: aistudio.google.com",
    };
    return NextResponse.json({ reply: demoResponses[lang ?? "tr"] });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    contents: [
      {
        parts: [{ text: `${SYSTEM_PROMPT}\n\nKullanıcı sorusu: ${message}` }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Gemini API hatası: ${err}` }, { status: 500 });
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Yanıt alınamadı.";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "AI servisi şu anda kullanılamıyor." }, { status: 500 });
  }
}
