"use client";

import { motion } from "framer-motion";
import {
  Atom,
  BookMarked,
  Component,
  Cpu,
  Film,
  Layers,
  Layout,
  type LucideIcon,
  MessageSquareCode,
  MonitorDot,
  Moon,
  Network,
  Package2,
  Plug,
  Rocket,
  Server,
  Sparkles,
  Terminal,
  TerminalSquare,
  Zap,
} from "lucide-react";
import type { CSSProperties } from "react";
import type { Skill } from "@/content/skills";
import { EASING } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface SkillCardProps {
  skill: Skill;
  index: number;
}

/**
 * Category-scoped color palettes. Each category gets its own accent so
 * switching tabs feels like stepping into a different "namespace", but
 * the card structure stays identical — unity through variation.
 *
 * Colors pass WCAG AA contrast against the near-black card background.
 */
const CATEGORY_PALETTE: Record<
  Skill["category"],
  { tag: string; accent: string; glow: string; tileBg: string }
> = {
  Frontend: {
    tag: "FE",
    accent: "rgb(129, 140, 248)", // indigo-400
    glow: "rgba(129, 140, 248, 0.25)",
    tileBg: "rgba(129, 140, 248, 0.12)",
  },
  AI: {
    tag: "AI",
    accent: "rgb(52, 211, 153)", // emerald-400 — distinct from cyan backend
    glow: "rgba(52, 211, 153, 0.3)",
    tileBg: "rgba(52, 211, 153, 0.14)",
  },
  Backend: {
    tag: "BE",
    accent: "rgb(34, 211, 238)", // cyan-400
    glow: "rgba(34, 211, 238, 0.25)",
    tileBg: "rgba(34, 211, 238, 0.12)",
  },
  Tools: {
    tag: "TL",
    accent: "rgb(244, 114, 182)", // pink-400
    glow: "rgba(244, 114, 182, 0.25)",
    tileBg: "rgba(244, 114, 182, 0.12)",
  },
  Design: {
    tag: "DS",
    accent: "rgb(250, 204, 21)", // yellow-400
    glow: "rgba(250, 204, 21, 0.25)",
    tileBg: "rgba(250, 204, 21, 0.12)",
  },
};

/**
 * Lucide icon registry — keyed by the `lucideIcon` string on a Skill.
 * Keep this in sync with the icons referenced in `content/skills.ts`.
 * Adding a new key here is the only place required to support a new
 * conceptual skill without a brand logo.
 */
const LUCIDE_ICON_MAP: Record<string, LucideIcon> = {
  Atom,
  BookMarked,
  Component,
  Cpu,
  Film,
  Layers,
  Layout,
  MessageSquareCode,
  MonitorDot,
  Moon,
  Network,
  Package2,
  Plug,
  Rocket,
  Server,
  Sparkles,
  Terminal,
  TerminalSquare,
  Zap,
};

/** Derive a short 2-char monogram (first two letters, uppercased). */
function monogram(name: string): string {
  // Strip leading non-letters, grab first 2 alphas, upper-case
  const letters = name.replace(/[^A-Za-z]/g, "");
  return letters.slice(0, 2).toUpperCase();
}

/**
 * A single "tech module" card — built to feel like a file/module tile
 * from a code editor tree. Mount animation comes from the parent stagger
 * group; hover has a subtle lift, corner brackets fading in, and a single
 * shine sweep across the card face.
 */
export function SkillCard({ skill, index }: SkillCardProps) {
  const palette = CATEGORY_PALETTE[skill.category];
  const mono = monogram(skill.name);
  const level = skill.level ?? 0;
  const LucideSymbol = skill.lucideIcon ? LUCIDE_ICON_MAP[skill.lucideIcon] : undefined;

  const style: CSSProperties = {
    "--sk-accent": palette.accent,
    "--sk-glow": palette.glow,
    "--sk-tile": palette.tileBg,
  } as CSSProperties;

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.92 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.5, ease: EASING.outExpo },
        },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
      }}
      className="group relative"
      style={style}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-white/10",
          "bg-[rgba(12,12,16,0.7)] backdrop-blur-md",
          "transition-[transform,box-shadow,border-color] duration-500 ease-out",
          "hover:-translate-y-1 hover:border-[color:var(--sk-accent)]/50",
          "hover:shadow-[0_20px_40px_-20px_var(--sk-glow)]",
        )}
      >
        {/* Corner brackets — fade in on hover, echoes the About HUD */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1.5 top-1.5 h-3 w-3 border-l border-t opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ borderColor: "var(--sk-accent)" }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1.5 right-1.5 h-3 w-3 border-b border-r opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ borderColor: "var(--sk-accent)" }}
        />

        {/* Top metadata row: category tag + index */}
        <div className="flex items-center justify-between px-4 pt-4 font-mono text-[9px] uppercase tracking-[0.25em] text-white/70">
          <span
            className="transition-colors duration-500 group-hover:text-[color:var(--sk-accent)]"
            aria-hidden="true"
          >
            {palette.tag}
          </span>
          <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
        </div>

        {/* Body: brand logo tile + name */}
        <div className="flex items-center gap-3 px-4 pt-3">
          <span
            aria-hidden="true"
            className={cn(
              "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border",
              "transition-transform duration-500 ease-out group-hover:scale-105",
            )}
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, var(--sk-tile) 100%)",
            }}
          >
            {skill.iconSlug ? (
              // biome-ignore lint/performance/noImgElement: tiny decorative SVG from an icon CDN; next/image adds more overhead than optimization for 20×20 brand marks
              <img
                src={`https://cdn.simpleicons.org/${skill.iconSlug}/${encodeURIComponent(palette.accent)}`}
                alt=""
                width={20}
                height={20}
                loading="lazy"
                decoding="async"
                className="h-5 w-5 object-contain"
              />
            ) : LucideSymbol ? (
              <LucideSymbol
                size={20}
                strokeWidth={1.75}
                style={{ color: "var(--sk-accent)" }}
                aria-hidden="true"
              />
            ) : (
              <span
                className="font-mono text-[11px] font-bold tracking-tight"
                style={{ color: "var(--sk-accent)" }}
              >
                {mono}
              </span>
            )}
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-white md:text-base">
              {skill.name}
            </span>
            <span className="font-mono text-[10px] text-white/60">
              .{skill.category.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Hairline divider */}
        <div
          aria-hidden="true"
          className="mx-4 my-3 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent"
        />

        {/* Proficiency bar + numeric readout */}
        {skill.level !== undefined && (
          <div className="flex items-center gap-3 px-4 pb-4">
            <span className="font-mono text-[10px] tabular-nums text-white/70">
              {String(level).padStart(2, "0")}
            </span>
            <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${level}%` }}
                transition={{
                  duration: 1,
                  ease: EASING.outExpo,
                  delay: 0.25 + index * 0.02,
                }}
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, var(--sk-accent), rgba(255,255,255,0.4))",
                  boxShadow: "0 0 8px var(--sk-glow)",
                }}
              />
            </div>
          </div>
        )}

        {/* Shine sweep — the one "little animation" on hover */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -translate-x-full",
            "bg-gradient-to-r from-transparent via-white/[0.07] to-transparent",
            "transition-transform duration-[900ms] ease-out",
            "group-hover:translate-x-full",
          )}
        />
      </div>
    </motion.li>
  );
}
