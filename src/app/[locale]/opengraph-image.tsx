import { ImageResponse } from "next/og";

export const alt = "XICO AI — AI Products, Software & Digital Platforms";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "100px",
          background:
            "linear-gradient(135deg, #06070a 0%, #0e1118 55%, #141026 100%)",
          color: "#eceef3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg,#6E8BFF,#A77BFF,#4FD8C0)",
            }}
          />
          <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: "0.14em" }}>
            XICO AI
          </div>
        </div>
        <div
          style={{
            fontSize: 62,
            fontWeight: 700,
            marginTop: 46,
            lineHeight: 1.12,
            maxWidth: 940,
          }}
        >
          Products that actually run — built with AI, engineering & design.
        </div>
        <div style={{ fontSize: 27, color: "#9aa1ad", marginTop: 34 }}>
          AI Products · Mobile Apps · Web Platforms · Digital Systems
        </div>
      </div>
    ),
    { ...size },
  );
}
