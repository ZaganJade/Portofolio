"use client";

import { motion } from "framer-motion";
import { BadgeCheck, ExternalLink } from "lucide-react";
import type { CSSProperties } from "react";
import type { Certification, CertificationCategory } from "@/content/certifications";
import { EASING } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface CertificationCardProps {
  cert: Certification;
  index: number;
}

/**
 * Per-category palette. Mirrors the SkillCard color system so the two
 * sub-sections visually read as a family.
 */
const PALETTE: Record<
  CertificationCategory,
  { accent: string; glow: string; tileBg: string; tag: string }
> = {
  "AI / ML": {
    tag: "AI",
    accent: "rgb(52, 211, 153)",
    glow: "rgba(52, 211, 153, 0.3)",
    tileBg: "rgba(52, 211, 153, 0.14)",
  },
  Cloud: {
    tag: "CL",
    accent: "rgb(251, 146, 60)",
    glow: "rgba(251, 146, 60, 0.25)",
    tileBg: "rgba(251, 146, 60, 0.12)",
  },
  Frontend: {
    tag: "FE",
    accent: "rgb(129, 140, 248)",
    glow: "rgba(129, 140, 248, 0.25)",
    tileBg: "rgba(129, 140, 248, 0.12)",
  },
  Backend: {
    tag: "BE",
    accent: "rgb(34, 211, 238)",
    glow: "rgba(34, 211, 238, 0.25)",
    tileBg: "rgba(34, 211, 238, 0.12)",
  },
  Security: {
    tag: "SC",
    accent: "rgb(244, 63, 94)",
    glow: "rgba(244, 63, 94, 0.25)",
    tileBg: "rgba(244, 63, 94, 0.12)",
  },
  Design: {
    tag: "DS",
    accent: "rgb(250, 204, 21)",
    glow: "rgba(250, 204, 21, 0.25)",
    tileBg: "rgba(250, 204, 21, 0.12)",
  },
  General: {
    tag: "GN",
    accent: "rgb(209, 213, 219)",
    glow: "rgba(209, 213, 219, 0.22)",
    tileBg: "rgba(209, 213, 219, 0.1)",
  },
  Hackathon: {
    tag: "HK",
    accent: "rgb(167, 139, 250)", // violet — matches Achievements.Hackathon
    glow: "rgba(167, 139, 250, 0.28)",
    tileBg: "rgba(167, 139, 250, 0.12)",
  },
};

function monogram(name: string): string {
  const letters = name.replace(/[^A-Za-z]/g, "");
  return letters.slice(0, 2).toUpperCase();
}

/**
 * A single credential / certificate card \u2014 styled to match SkillCard
 * but with a wider body layout that highlights issuer + issue date
 * instead of a numeric proficiency bar.
 */
export function CertificationCard({ cert, index }: CertificationCardProps) {
  const palette = PALETTE[cert.category];
  const mono = monogram(cert.issuer);

  const style: CSSProperties = {
    "--sk-accent": palette.accent,
    "--sk-glow": palette.glow,
    "--sk-tile": palette.tileBg,
  } as CSSProperties;

  const dateLabel = cert.expiresAt ? `${cert.issueDate} \u2192 ${cert.expiresAt}` : cert.issueDate;

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
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

        {/* Header row */}
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
            {cert.iconSlug ? (
              // biome-ignore lint/performance/noImgElement: brand mark from icon CDN \u2014 lighter than next/image for 20\u00d720 SVGs
              <img
                src={`https://cdn.simpleicons.org/${cert.iconSlug}/${encodeURIComponent(palette.accent)}`}
                alt=""
                width={20}
                height={20}
                loading="lazy"
                decoding="async"
                className="h-5 w-5 object-contain"
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

          <div className="flex min-w-0 flex-1 flex-col">
            <span className="line-clamp-2 text-sm font-semibold leading-snug text-white md:text-base">
              {cert.name}
            </span>
            <span className="font-mono text-[10px] text-white/60">
              .{cert.issuer.toLowerCase().replace(/\s+/g, "-")}
            </span>
          </div>

          <BadgeCheck
            size={16}
            className="flex-shrink-0 transition-colors duration-500"
            style={{ color: "var(--sk-accent)" }}
            aria-hidden="true"
          />
        </div>

        {/* Description */}
        {cert.description && (
          <p className="mt-3 line-clamp-2 px-4 text-xs leading-relaxed text-white/60">
            {cert.description}
          </p>
        )}

        <div
          aria-hidden="true"
          className="mx-4 my-3 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent"
        />

        {/* Footer: date + credential id + verify link */}
        <div className="flex items-center justify-between gap-3 px-4 pb-4 font-mono text-[10px] text-white/60">
          <span className="tabular-nums uppercase tracking-[0.15em]">{dateLabel}</span>
          {cert.verifyUrl ? (
            <a
              href={cert.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-white/70 transition-colors hover:text-[color:var(--sk-accent)]"
            >
              <span>Verify</span>
              <ExternalLink size={11} />
            </a>
          ) : cert.credentialId ? (
            <span className="truncate uppercase tracking-[0.1em]">{cert.credentialId}</span>
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
