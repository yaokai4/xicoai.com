import { ImageResponse } from "next/og";

export const alt = "Xico Clean — a native cleaner & optimizer for Mac";
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
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "0.01em" }}>
            Xico Clean
          </div>
          <div
            style={{
              marginLeft: 6,
              fontSize: 20,
              color: "#5EE7D0",
              border: "1px solid rgba(94,231,208,0.4)",
              borderRadius: 999,
              padding: "4px 14px",
            }}
          >
            Free 14-day trial
          </div>
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            marginTop: 46,
            lineHeight: 1.12,
            maxWidth: 960,
          }}
        >
          The native Mac cleaner. Fast and clean again.
        </div>
        <div style={{ fontSize: 26, color: "#9aa1ad", marginTop: 32 }}>
          Smart Scan · Space Lens · Developer junk · 100% local & undoable
        </div>
      </div>
    ),
    { ...size },
  );
}
