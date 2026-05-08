import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const alt = SITE.title;

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 110,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: 700,
        background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
      }}
    >
      Y
    </div>,
    { ...size },
  );
}
