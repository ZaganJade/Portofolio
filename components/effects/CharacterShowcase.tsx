"use client";

import Image from "next/image";
import { type MouseEvent, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export interface CharacterShowcaseProps {
  /** Path or URL of the character image. Falls back to placeholder when missing. */
  src?: string;
  /** Display name shown in the nameplate */
  name: string;
  /** Title / role shown under the name */
  title: string;
  /** Small mono caption on the top frame (e.g. "DOSSIER", "OPERATOR") */
  tag?: string;
  /** Secondary label next to the tag — defaults to a 2-digit serial */
  serial?: string;
  /** Accent color as "r, g, b" — drives all glows & highlights */
  accent?: string;
  /** Object-position for the portrait (e.g. "center top" for head-focused photos) */
  objectPosition?: string;
  className?: string;
}

/**
 * Holographic character card — a sci-fi HUD aesthetic with layered depth.
 *
 * Layers, back-to-front:
 *   1. Radial glow aura
 *   2. Rotating dashed ring
 *   3. Static geometric frame w/ corner brackets
 *   4. Character image (mouse-parallax)
 *   5. Animated scanline sweep
 *   6. Nameplate overlay
 *
 * The scanline + orbital ring animate on pure CSS (cheap).
 * The image + frame respond to cursor movement via CSS variables
 * set on the root — no state thrash, no re-renders per mouse move.
 *
 * Gracefully falls back to a styled placeholder when `src` is missing
 * or fails to load, so the card still looks intentional on first visit.
 */
export function CharacterShowcase({
  src,
  name,
  title,
  tag = "DOSSIER",
  serial = "01",
  accent = "244, 114, 182", // Pink-400
  objectPosition = "center center",
  className,
}: CharacterShowcaseProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const prefersReduced = useReducedMotion();

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const py = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    el.style.setProperty("--cs-px", px.toFixed(3));
    el.style.setProperty("--cs-py", py.toFixed(3));
  };

  const handleLeave = () => {
    const el = rootRef.current;
    if (!el) return;
    el.style.setProperty("--cs-px", "0");
    el.style.setProperty("--cs-py", "0");
  };

  const hasImage = !!src && !imgFailed;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: decorative parallax, no functional interaction
    <div
      ref={rootRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      role="presentation"
      className={cn(
        "relative aspect-[3/4] w-full max-w-[420px] select-none",
        "[--cs-px:0] [--cs-py:0]",
        className,
      )}
      style={{ "--cs-accent": accent } as React.CSSProperties}
    >
      {/* Layer 1: radial glow aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 55%, rgba(var(--cs-accent), 0.3), transparent 65%)",
          filter: "blur(20px)",
        }}
      />

      {/* Layer 2: rotating orbital ring (outer) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 rounded-full border border-dashed opacity-30"
        style={{
          borderColor: "rgba(var(--cs-accent), 0.6)",
          animation: "cs-orbit 24s linear infinite",
          transform: "translate3d(calc(var(--cs-px) * 6px), calc(var(--cs-py) * 6px), 0)",
        }}
      />

      {/* Layer 2b: inner orbital, opposite direction */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-14 rounded-full border opacity-40"
        style={{
          borderColor: "rgba(var(--cs-accent), 0.4)",
          animation: "cs-orbit-reverse 18s linear infinite",
          transform: "translate3d(calc(var(--cs-px) * 3px), calc(var(--cs-py) * 3px), 0)",
        }}
      />

      {/* Layer 3: Geometric frame + corner brackets */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[2rem] border"
        style={{
          borderColor: "rgba(var(--cs-accent), 0.25)",
        }}
      >
        {/* Corner brackets */}
        {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((corner) => (
          <CornerBracket key={corner} position={corner} />
        ))}
      </div>

      {/* Top-center tag */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em]"
        style={{ color: "rgba(var(--cs-accent), 0.85)" }}
      >
        {tag} · <span className="text-white/50">#{serial}</span>
      </div>

      {/* Layer 4: Character image (or placeholder) */}
      <div
        className="absolute inset-8 flex items-end justify-center overflow-hidden rounded-[1.5rem]"
        style={{
          background:
            "linear-gradient(180deg, rgba(var(--cs-accent), 0.08) 0%, rgba(0,0,0,0.5) 100%)",
          backdropFilter: "blur(6px)",
          transform:
            "translate3d(calc(var(--cs-px) * -8px), calc(var(--cs-py) * -8px), 0) scale(calc(1 + var(--cs-py) * 0.01))",
          transition: "transform 400ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {hasImage ? (
          <Image
            src={src}
            alt={name}
            fill
            className="object-cover"
            style={{ objectPosition }}
            sizes="(max-width: 640px) 100vw, 420px"
            onError={() => setImgFailed(true)}
            priority={false}
            unoptimized
          />
        ) : (
          <PlaceholderSilhouette />
        )}

        {/* Inner image vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 60%, transparent 50%, rgba(0,0,0,0.75) 100%)",
          }}
        />
      </div>

      {/* Layer 5: Scanline sweep */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-8 overflow-hidden rounded-[1.5rem]"
      >
        <div
          className="absolute inset-x-0 h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(var(--cs-accent), 0.9), transparent)",
            boxShadow: "0 0 18px rgba(var(--cs-accent), 0.8)",
            animation: "cs-scan 5s ease-in-out infinite",
          }}
        />
      </div>

      {/* Noise texture for film grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-8 rounded-[1.5rem] opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Layer 6: Nameplate overlay */}
      <div className="absolute inset-x-8 bottom-10 z-20 flex flex-col items-center gap-1 text-center">
        <div
          className="h-px w-16"
          aria-hidden="true"
          style={{ background: "rgba(var(--cs-accent), 0.7)" }}
        />
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.25em] text-white">
          {name}
        </p>
        <p
          className="text-[10px] uppercase tracking-[0.3em]"
          style={{ color: "rgba(var(--cs-accent), 0.85)" }}
        >
          {title}
        </p>
      </div>

      {/* Keyframes (scoped via styled-jsx-like block) */}
      <style jsx>{`
        @keyframes cs-orbit {
          from { transform: rotate(0deg) translate3d(calc(var(--cs-px) * 6px), calc(var(--cs-py) * 6px), 0); }
          to   { transform: rotate(360deg) translate3d(calc(var(--cs-px) * 6px), calc(var(--cs-py) * 6px), 0); }
        }
        @keyframes cs-orbit-reverse {
          from { transform: rotate(360deg) translate3d(calc(var(--cs-px) * 3px), calc(var(--cs-py) * 3px), 0); }
          to   { transform: rotate(0deg) translate3d(calc(var(--cs-px) * 3px), calc(var(--cs-py) * 3px), 0); }
        }
        @keyframes cs-scan {
          0%   { transform: translateY(-6px); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(var(--cs-scan-end, 100%)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/** L-shaped corner bracket positioned absolutely. */
function CornerBracket({
  position,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const base = "absolute h-5 w-5";
  const placement: Record<typeof position, string> = {
    "top-left": "top-3 left-3 border-t border-l",
    "top-right": "top-3 right-3 border-t border-r",
    "bottom-left": "bottom-3 left-3 border-b border-l",
    "bottom-right": "bottom-3 right-3 border-b border-r",
  };
  return (
    <span
      aria-hidden="true"
      className={cn(base, placement[position])}
      style={{ borderColor: "rgba(var(--cs-accent), 0.7)" }}
    />
  );
}

/**
 * Fallback silhouette when no image is provided — keeps the card looking
 * intentional even before you drop a character portrait in /public/images.
 */
function PlaceholderSilhouette() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 200 260"
        className="h-[80%] w-auto"
        aria-hidden="true"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cs-silhouette" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(var(--cs-accent), 0.4)" />
            <stop offset="100%" stopColor="rgba(var(--cs-accent), 0)" />
          </linearGradient>
        </defs>
        {/* Abstract portrait silhouette: head + shoulders */}
        <ellipse cx="100" cy="85" rx="42" ry="50" fill="url(#cs-silhouette)" />
        <path
          d="M25 260 C 25 180, 60 155, 100 155 C 140 155, 175 180, 175 260 Z"
          fill="url(#cs-silhouette)"
        />
      </svg>
      <div
        className="absolute inset-x-4 bottom-14 rounded-lg border px-3 py-2 text-center font-mono text-[9px] uppercase tracking-widest text-white/50 backdrop-blur-sm"
        style={{ borderColor: "rgba(var(--cs-accent), 0.3)" }}
      >
        Drop a portrait at
        <br />
        <span className="text-white/80">/public/images/herta.png</span>
      </div>
    </div>
  );
}
