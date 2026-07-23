import { ImageResponse } from "next/og";
import appConfig from "@/app.config";
import { DEFAULT_LANG } from "@/lib/i18n/config";

export const alt = appConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(family: string, weight: number, text: string) {
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`)
  ).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);
  if (match) {
    const res = await fetch(match[1]);
    if (res.ok) return res.arrayBuffer();
  }
  return null;
}

export default async function Image() {
  const tagline = appConfig.tagline[DEFAULT_LANG];
  const text = `${appConfig.name}${tagline}`;
  const [bold, medium] = await Promise.all([
    loadGoogleFont("Bricolage+Grotesque", 700, text),
    loadGoogleFont("Bricolage+Grotesque", 500, text),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: "linear-gradient(135deg, #fa808a 0%, #e46c83 45%, #cd5394 100%)",
          fontFamily: bold ? "Bricolage Grotesque" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 22,
              background: "rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                width: 30,
                height: 16,
                borderLeft: "6px solid #fff",
                borderBottom: "6px solid #fff",
                transform: "rotate(-45deg)",
                marginTop: -6,
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: "#fff", letterSpacing: -1 }}>
            {appConfig.name}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 64,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.15,
            maxWidth: 920,
          }}
        >
          {tagline}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: bold && medium
        ? [
            { name: "Bricolage Grotesque", data: bold, weight: 700, style: "normal" },
            { name: "Bricolage Grotesque", data: medium, weight: 500, style: "normal" },
          ]
        : undefined,
    },
  );
}
