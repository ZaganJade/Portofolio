import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

export const alt = SITE.title;
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
        justifyContent: "space-between",
        padding: "80px",
        background: "#000000",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(99,102,241,0.35), transparent 50%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(6,182,212,0.25), transparent 50%)",
        fontFamily: "sans-serif",
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 20,
          fontFamily: "monospace",
          color: "rgba(255,255,255,0.6)",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
        }}
      >
        <span
          style={{
            width: 40,
            height: 2,
            background: "#6366f1",
          }}
        />
        {SITE.role}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div
          style={{
            fontSize: 128,
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span style={{ color: "white" }}>{SITE.author.split(" ")[0] ?? "Your"}</span>
          <span
            style={{
              backgroundImage: "linear-gradient(135deg, #818cf8 0%, #22d3ee 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {SITE.author.split(" ")[1] ?? "Name"}
          </span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.7)",
            maxWidth: 800,
            lineHeight: 1.3,
          }}
        >
          Crafting cinematic digital experiences with modern tooling.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 22,
          fontFamily: "monospace",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        <span>{SITE.url.replace(/^https?:\/\//, "")}</span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Available for work
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#22d3ee",
              boxShadow: "0 0 16px #22d3ee",
            }}
          />
        </span>
      </div>
    </div>,
    { ...size },
  );
}
