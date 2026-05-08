"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, GitFork, Star } from "lucide-react";
import { type MouseEvent, useRef, useState } from "react";
import type { GitHubRepo } from "@/lib/github";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export interface GitHubRepoCardProps {
  repo: GitHubRepo;
  index: number;
}

const LANG_COLOR: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Dart: "#00B4AB",
  PHP: "#4F5D95",
  Go: "#00ADD8",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

/**
 * Displays a single repo as an external-link card with a subtle cursor-tracking
 * spotlight and gradient border on hover.
 */
export function GitHubRepoCard({ repo, index }: GitHubRepoCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  const prefersReduced = useReducedMotion();

  const onMove = (event: MouseEvent<HTMLAnchorElement>) => {
    if (prefersReduced) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSpot({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  const displayName = repo.name.length > 28 ? `${repo.name.slice(0, 28)}…` : repo.name;
  const langColor = repo.language ? (LANG_COLOR[repo.language] ?? "#8b5cf6") : "#8b5cf6";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <a
        ref={cardRef}
        href={repo.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={onMove}
        className={cn(
          "group gradient-border glass relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl p-5 transition-all duration-500",
          "hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(99,102,241,0.35)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
        )}
      >
        {/* Spotlight overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle 220px at ${spot.x}% ${spot.y}%, rgba(99,102,241,0.22), transparent 70%)`,
          }}
        />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <h5 className="truncate text-base font-semibold text-white md:text-lg">
                {displayName}
              </h5>
              {repo.archived && (
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
                  Archived
                </span>
              )}
            </div>
            <span className="truncate font-mono text-xs text-white/40">{repo.fullName}</span>
          </div>
          <ArrowUpRight
            size={18}
            className="flex-shrink-0 text-white/50 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
          />
        </div>

        {repo.description && (
          <p className="relative z-10 line-clamp-2 text-sm text-white/60">{repo.description}</p>
        )}

        <div className="relative z-10 mt-auto flex flex-wrap items-center gap-4 pt-2 text-xs text-white/50">
          {repo.language && (
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: langColor }}
              />
              {repo.language}
            </span>
          )}
          {repo.stars > 0 && (
            <span className="inline-flex items-center gap-1">
              <Star size={12} />
              {repo.stars}
            </span>
          )}
          {repo.forks > 0 && (
            <span className="inline-flex items-center gap-1">
              <GitFork size={12} />
              {repo.forks}
            </span>
          )}
          <span className="ml-auto font-mono text-[10px] text-white/30">
            Updated {formatRelative(repo.pushedAt)}
          </span>
        </div>
      </a>
    </motion.div>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (!then) return "";
  const diff = Date.now() - then;
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
