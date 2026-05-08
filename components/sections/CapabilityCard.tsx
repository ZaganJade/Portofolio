"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { type CSSProperties, type MouseEvent, useRef, useState } from "react";
import type { Capability } from "@/content/capabilities";
import { EASING } from "@/lib/constants";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export interface CapabilityCardProps {
  capability: Capability;
  /** Zero-based index within the stack */
  index: number;
  /** Total cards in the stack, used for offset math */
  total: number;
}

/**
 * Sticky-stack card (à la devin.ai's "Able to work with hundreds of tools").
 *
 * Each card is `sticky` at `top = baseOffset + index * step`. As the user
 * scrolls, card N+1 slides up behind card N and pins slightly lower,
 * creating a physical "stacking deck" effect. The section wrapper gives
 * each card exactly 100vh of scroll room, so every card gets a moment
 * of full visibility before the next lands on top.
 *
 * On hover the card widens and the gradient border + cursor spotlight
 * light up. CSS-only — no Framer Motion per cell, keeping scroll-perf
 * snappy even with five cards.
 */
export function CapabilityCard({ capability, index, total }: CapabilityCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  const prefersReduced = useReducedMotion();

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSpot({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  // Sticky math — each card lands slightly below the previous one
  const baseTop = 96; // nav height + gap
  const step = 20; // pixels of peek per previous card
  const Icon: LucideIcon = capability.icon;

  // Depth: cards further into the stack sit a touch scaled + dimmed
  const depth = total - 1 - index;

  const style: CSSProperties = {
    top: `${baseTop + index * step}px`,
    zIndex: index + 10,
    // Give each card ~3vh of scroll room so the next card has time to
    // slide up over this one before pinning. Tight stacking.
    marginBottom: "3vh",
    "--cap-accent": capability.accent,
    "--cap-gradient": capability.gradient,
  } as CSSProperties;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: decorative cursor-spotlight; card is purely visual, not interactive
    <div
      className="sticky w-full"
      style={style}
      data-capability-card
      data-index={index}
      onMouseMove={onMouseMove}
      role="presentation"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{
          duration: 0.7,
          ease: EASING.outExpo,
        }}
      >
        <div
          ref={cardRef}
          className={cn(
            "group relative mx-auto w-full overflow-hidden rounded-[2rem] border border-white/10",
            "transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "will-change-transform",
            "bg-[rgba(10,10,12,0.88)] backdrop-blur-xl",
            "shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]",
            "hover:scale-[1.008] hover:border-[rgba(var(--cap-accent),0.4)]",
            "hover:shadow-[0_40px_100px_-30px_rgba(var(--cap-accent),0.45)]",
          )}
          style={{
            transformOrigin: "center top",
          }}
        >
          {/* Cursor-tracked radial spotlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(circle 420px at ${spot.x}% ${spot.y}%, rgba(var(--cap-accent), 0.22), transparent 65%)`,
            }}
          />

          {/* Ambient gradient glow blob */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full opacity-40 blur-[120px] transition-opacity duration-700 group-hover:opacity-70"
            style={{ background: capability.gradient }}
          />

          {/* Fine-grain animated gradient border (appears on hover) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              padding: "1px",
              background: capability.gradient,
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />

          {/* Body */}
          <div className="relative z-10 grid gap-6 p-6 sm:p-8 md:grid-cols-[1.3fr_1fr] md:gap-10 md:p-12 lg:p-16">
            {/* Left: copy */}
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex items-center justify-between gap-4">
                <span
                  className="font-mono text-sm tracking-[0.2em] text-white/40"
                  style={{ color: `rgba(var(--cap-accent), 0.9)` }}
                >
                  {capability.number} / {String(total).padStart(2, "0")}
                </span>
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition-colors group-hover:border-[rgba(var(--cap-accent),0.5)] group-hover:text-white"
                  style={{ color: `rgb(var(--cap-accent))` }}
                >
                  <Icon size={18} />
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-semibold leading-[1.1] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
                  {capability.title}
                </h3>
                <p
                  className="font-mono text-xs uppercase tracking-[0.2em] sm:text-sm"
                  style={{ color: `rgb(var(--cap-accent))` }}
                >
                  {capability.tagline}
                </p>
              </div>

              <p className="max-w-lg text-sm leading-relaxed text-white/80 sm:text-base md:text-lg">
                {capability.description}
              </p>

              <ul className="mt-auto flex flex-wrap gap-2 pt-4">
                {capability.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-medium text-white transition-colors group-hover:border-white/30"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: decorative number / visual */}
            <div className="relative hidden min-h-[240px] items-center justify-center md:flex">
              {/* Enormous outline numeral */}
              <span
                aria-hidden="true"
                className="select-none font-mono text-[11rem] font-bold leading-none tracking-tighter text-transparent opacity-20 transition-opacity duration-700 group-hover:opacity-40 lg:text-[14rem]"
                style={{
                  WebkitTextStroke: `1.5px rgb(var(--cap-accent))`,
                }}
              >
                {capability.number}
              </span>

              {/* Orbiting ring */}
              <span
                aria-hidden="true"
                className="absolute inset-8 rounded-full border border-dashed opacity-30 transition-opacity duration-700 group-hover:opacity-60"
                style={{
                  borderColor: `rgba(var(--cap-accent), 0.4)`,
                  animation: "cap-spin 30s linear infinite",
                }}
              />
              <span
                aria-hidden="true"
                className="absolute inset-20 rounded-full border opacity-20 transition-opacity duration-700 group-hover:opacity-40"
                style={{ borderColor: `rgba(var(--cap-accent), 0.5)` }}
              />

              {/* Arrow CTA hint */}
              <ArrowUpRight
                className="absolute right-6 top-6 text-white/30 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/80"
                size={18}
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* Accent underline bar */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
            style={{ background: capability.gradient }}
          />
        </div>

        {/* Depth scale — subtle, so deep cards recede visually */}
        <style jsx>{`
        @keyframes cap-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        div[data-capability-card] > div {
          transform: scale(${1 - depth * 0.015});
        }
      `}</style>
      </motion.div>
    </div>
  );
}
