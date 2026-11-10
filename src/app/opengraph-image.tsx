import { ImageResponse } from "next/og";
import { siteConfig } from "@/data/site";

export const alt = "pawelium — chiens, chats, chiots & chatons de race, sélection européenne";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social card for every route (individual listings override with their own photo).
export default function OpengraphImage() {
  const domain = siteConfig.siteUrl.replace(/^https?:\/\//, "");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #faf7f2 0%, #f1e7d6 100%)",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 20,
              height: 72,
              borderRadius: 6,
              background: "#a06b1f",
            }}
          />
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#221c17",
              letterSpacing: -1,
            }}
          >
            pawelium
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#221c17",
              maxWidth: 940,
              letterSpacing: -2,
            }}
          >
            Chiens, chats, chiots &amp; chatons de race
          </div>
          <div style={{ fontSize: 34, color: "#6b5c48", maxWidth: 900 }}>
            Sélection éthique européenne · Passeport &amp; ICAD certifiés
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#183C32",
              color: "#fff",
              fontSize: 26,
              fontWeight: 700,
              padding: "10px 24px",
              borderRadius: 999,
            }}
          >
            Marché Européen d&apos;Exception
          </div>
          <div style={{ fontSize: 30, color: "#8a7a63" }}>{domain}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
