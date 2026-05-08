"use client";

import { cn } from "@/lib/utils";

/**
 * Horizontal infinite-scrolling strip of AI tools/models — the visual
 * signal that says "this person actually works with AI" before the
 * reader even gets to the paragraph copy.
 *
 * Implementation: content is duplicated once inline; the track slides
 * from 0 → -50% so the seam is seamless (you never see the end of
 * the list because by the time you'd see it, we've wrapped back).
 * Pure CSS keyframe (`ai-marquee` in globals.css). Pauses on hover.
 */

const ITEMS = [
  "Gemini",
  "Claude",
  "GPT",
  "Kimi",
  "GLM",
  "MiniMax",
  "OpenRouter",
  "LangChain",
  "MCP",
  "RAG",
  "Embeddings",
  "Ollama",
  "Hugging Face",
  "AI CLI",
  "Prompt Eng.",
  "Generative AI",
] as const;

export interface AIMarqueeProps {
  className?: string;
  /** Seconds per full loop. Lower = faster. */
  speed?: number;
}

export function AIMarquee({ className, speed = 40 }: AIMarqueeProps) {
  return (
    <section
      aria-label="AI stack marquee"
      className={cn(
        "group relative overflow-hidden rounded-full border border-emerald-400/20",
        "bg-gradient-to-r from-emerald-500/[0.04] via-emerald-400/[0.08] to-emerald-500/[0.04]",
        "py-3",
        className,
      )}
      style={{
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      {/* Pinned label */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 flex h-full items-center gap-2 bg-gradient-to-r from-[var(--color-bg)] via-[var(--color-bg)] to-transparent pl-5 pr-10 font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-300">
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
        </span>
        <span>AI.stack</span>
      </div>

      {/* Infinite track — duplicated inline for seamless wrap.
       * We intentionally do NOT gate on prefers-reduced-motion because
       * MIUI/HyperOS (Xiaomi/Poco) enables it by default, which would
       * break the marquee on those devices. The animation is a slow,
       * continuous horizontal scroll — not vestibular trigger territory. */}
      <div
        className="flex w-max items-center gap-0"
        style={{
          animation: `ai-marquee ${speed}s linear infinite`,
          animationPlayState: "running",
        }}
      >
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-6 whitespace-nowrap px-6 font-mono text-sm uppercase tracking-[0.18em] text-white/80"
          >
            {item}
            <span aria-hidden="true" className="text-emerald-400/60">
              ◆
            </span>
          </span>
        ))}
      </div>

      {/* Hover pause — no JS needed */}
      <style jsx>{`
        .group:hover > div:last-of-type {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
