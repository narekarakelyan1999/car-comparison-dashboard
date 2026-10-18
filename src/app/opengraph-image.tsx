import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#0f172a",
        color: "#ffffff",
        padding: "80px",
      }}
    >
      <div style={{ fontSize: 72, fontWeight: 600 }}>{siteConfig.name}</div>
      <div style={{ marginTop: 24, fontSize: 32, color: "#cbd5e1" }}>
        Compare price, rating, and specifications
      </div>
    </div>,
    { ...size },
  );
}
