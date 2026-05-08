"use client";

import { motion } from "framer-motion";
import { ExternalLink, Medal, Trophy } from "lucide-react";
import type { CSSProperties } from "react";
import type {
  Achievement,
  AchievementCategory,
  AchievementPlacement,
} from "@/content/achievements";
import { EASING } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface AchievementCardProps {
  achievement: Achievement;
  index: number;
}

/** Category-scoped color palettes. Matches the broader site vocabulary. */
const CATEGORY_PALETTE: Record<
  AchievementCategory,
  { accent: string; glow: string; tileBg: string; tag: string }
> = {
  Hackathon: {
    tag: "HK",
    accent: "rgb(167, 139, 250)", // violet
    glow: "rgba(167, 139, 250, 0.3)",
    tileBg: "rgba(167, 139, 250, 0.14)",
  },
  Competition: {
    tag: "CM",
    accent: "rgb(52, 211, 153)", // emerald
    glow: "rgba(52, 211, 153, 0.3)",
    tileBg: "rgba(52, 211, 153, 0.14)",
  },
  Award: {
    tag: "AW",
    accent: "rgb(250, 204, 21)", // yellow — trophy vibe
    glow: "rgba(250, 204, 21, 0.28)",
    tileBg: "rgba(250, 204, 21, 0.14)",
  },
  Scholarship: {
    tag: "SP",
    accent: "rgb(129, 140, 248)", // indigo
    glow: "rgba(129, 140, 248, 0.25)",
    tileBg: "rgba(129, 140, 248, 0.12)",
  },
  Recognition: {
    tag: "RC",
    accent: "rgb(244, 114, 182)", // pink
    glow: "rgba(244, 114, 182, 0.25)",
    tileBg: "rgba(244, 114, 182, 0.12)",
  },
};

/** Placement rank → visual weight. Podium placements get trophy, rest get medal. */
const PLACEMENT_META: Record<
  AchievementPlacement,
  { short: string; icon: "trophy" | "medal"; rank: 1 | 2 | 3 | 4 }
> = {
  "1st": { short: "1ST", icon: "trophy", rank: 1 },
  "2nd": { short: "2ND", icon: "trophy", rank: 2 },
  "3rd": { short: "3RD", icon: "trophy", rank: 3 },
  Winner: { short: "WIN", icon: "trophy", rank: 1 },
  Finalist: { short: "FIN", icon: "medal", rank: 4 },
  Semifinalist: { short: "SMF", icon: "medal", rank: 4 },
  "Honorable Mention": { short: "HM", icon: "medal", rank: 4 },
};

/**
 * A single achievement card. Designed to feel more like a trophy case
 * entry than a catalog item — prominent placement badge, tag strip,
 * and a slightly taller layout to breathe around the award name.
 */
export function AchievementCard({ achievement, index }: AchievementCardProps) {
  const palette = CATEGORY_PALETTE[achievement.category];
  const meta = PLACEMENT_META[achievement.placement];

  const style: CSSProperties = {
    "--sk-accent": palette.accent,
    "--sk-glow": palette.glow,
    "--sk-tile": palette.tileBg,
  } as CSSProperties;

  const Icon = meta.icon === "trophy" ? Trophy : Medal;

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 24, scale: 0.96 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.55, ease: EASING.outExpo },
        },
      }}
      className="group relative"
      style={style}
    >
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10",
          "bg-[rgba(12,12,16,0.7)] backdrop-blur-md",
          "transition-[transform,box-shadow,border-color] duration-500 ease-out",
          "hover:-translate-y-1 hover:border-[color:var(--sk-accent)]/50",
          "hover:shadow-[0_24px_48px_-24px_var(--sk-glow)]",
        )}
      >
        {/* Corner brackets */}
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

        {/* Metadata strip */}
        <div className="flex items-center justify-between px-4 pt-4 font-mono text-[9px] uppercase tracking-[0.25em] text-white/70">
          <span
            aria-hidden="true"
            className="transition-colors duration-500 group-hover:text-[color:var(--sk-accent)]"
          >
            {palette.tag}
          </span>
          <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
        </div>

        {/* Placement + Icon */}
        <div className="flex items-start gap-3 px-4 pt-3">
          <span
            aria-hidden="true"
            className={cn(
              "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border",
              "transition-transform duration-500 ease-out group-hover:scale-105",
            )}
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, var(--sk-tile) 100%)",
            }}
          >
            <Icon size={22} style={{ color: "var(--sk-accent)" }} strokeWidth={1.8} />
          </span>

          <div className="flex min-w-0 flex-1 flex-col">
            <span className="line-clamp-2 text-base font-semibold leading-snug text-white md:text-lg">
              {achievement.title}
            </span>
            <span className="mt-0.5 truncate text-xs text-white/60">{achievement.organizer}</span>
          </div>

          {/* Placement badge */}
          <div
            className="flex flex-shrink-0 flex-col items-center gap-0.5 rounded-md border px-2 py-1.5"
            style={{
              borderColor: "color-mix(in srgb, var(--sk-accent) 40%, transparent)",
              background: "color-mix(in srgb, var(--sk-accent) 12%, transparent)",
            }}
          >
            <span
              className="font-mono text-[10px] font-bold tabular-nums"
              style={{ color: "var(--sk-accent)" }}
            >
              {meta.short}
            </span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-white/50">
              {achievement.level.slice(0, 4)}
            </span>
          </div>
        </div>

        {/* Description */}
        {achievement.description && (
          <p className="mt-3 px-4 text-xs leading-relaxed text-white/60">
            {achievement.description}
          </p>
        )}

        {/* Tags */}
        {achievement.tags && achievement.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 px-4">
            {achievement.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex-1" />

        <div
          aria-hidden="true"
          className="mx-4 mt-3 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent"
        />

        {/* Footer: date + optional link */}
        <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-3 font-mono text-[10px] text-white/60">
          <span className="tabular-nums uppercase tracking-[0.15em]">{achievement.date}</span>
          {achievement.url ? (
            <a
              href={achievement.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-white/70 transition-colors hover:text-[color:var(--sk-accent)]"
            >
              <span>Source</span>
              <ExternalLink size={11} />
            </a>
          ) : null}
        </div>

        {/* Shine sweep */}
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
