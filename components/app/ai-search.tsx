"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Send, X, Loader2, Bot } from "lucide-react";
import { useLang } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const QUICK_PROMPTS = {
  tr: [
    "Bugünkü randevularım neler?",
    "En çok gelir getiren hizmet hangisi?",
    "No-show oranını nasıl düşürürüm?",
    "Depozito nasıl ayarlarım?",
  ],
  en: [
    "What are today's bookings?",
    "Which service earns the most?",
    "How to reduce no-shows?",
    "How do I set up deposits?",
  ],
};

export function AiSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang } = useLang();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isT = lang === "tr";

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setMessages([]);
      setInput("");
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const send = useCallback(async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, lang }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply ?? data.error ?? "Hata oluştu." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: isT ? "Bağlantı hatası." : "Connection error." }]);
    } finally {
      setLoading(false);
    }
  }, [loading, lang, isT]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-pop">
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold">{isT ? "AI Asistan" : "AI Assistant"}</p>
            <p className="text-[11px] text-muted-foreground">{isT ? "Booky hakkında her şeyi sor" : "Ask anything about Booky"}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex max-h-[360px] min-h-[120px] flex-col gap-3 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-3.5 w-3.5" />
                </span>
                <p className="rounded-2xl rounded-tl-sm bg-muted p-3 text-[13px] leading-relaxed">
                  {isT
                    ? "Merhaba! Randevular, gelir, hizmetler veya müşteriler hakkında soru sorabilirsin."
                    : "Hi! Ask me about bookings, revenue, services, or clients."}
                </p>
              </div>
              <div className="pl-9 flex flex-wrap gap-1.5">
                {QUICK_PROMPTS[lang].map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11.5px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={cn("flex items-start gap-2.5", m.role === "user" && "flex-row-reverse")}>
                {m.role === "assistant" && (
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-3.5 w-3.5" />
                  </span>
                )}
                <p
                  className={cn(
                    "max-w-[80%] rounded-2xl p-3 text-[13px] leading-relaxed",
                    m.role === "user"
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
                      : "rounded-tl-sm bg-muted text-foreground",
                  )}
                >
                  {m.text}
                </p>
              </div>
            ))
          )}
          {loading && (
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-3.5 w-3.5" />
              </span>
              <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-3">
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isT ? "Bir şey sor…" : "Ask something…"}
              className="flex-1 bg-transparent py-2.5 text-[13.5px] placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 transition-opacity hover:opacity-90"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            {isT ? "Google Gemini · Ücretsiz AI · ESC ile kapat" : "Powered by Google Gemini · Free AI · Press ESC to close"}
          </p>
        </div>
      </div>
    </div>
  );
}
