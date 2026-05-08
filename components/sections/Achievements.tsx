"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { AchievementCard } from "@/components/sections/AchievementCard";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Section } from "@/components/ui/Section";
import { type AchievementCategory, achievements } from "@/content/achievements";
import { SECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type FilterCategory = AchievementCategory | "All";

/**
 * Achievements section — competition wins, hackathon placements, awards.
 *
 * Design vocabulary is a "trophy case" — deliberately distinct from the
 * Skills/Certificates sub-section which uses a terminal/editor feel.
 * Header marker uses an award banner instead of the `$` shell prompt.
 */
export function Achievements() {
  const available: FilterCategory[] = useMemo(() => {
    const cats = Array.from(new Set(achievements.map((a) => a.category))) as AchievementCategory[];
    return ["All", ...cats];
  }, []);

  const [filter, setFilter] = useState<FilterCategory>("All");

  const visible = useMemo(
    () => (filter === "All" ? achievements : achievements.filter((a) => a.category === filter)),
    [filter],
  );

  if (achievements.length === 0) return null;

  return (
    <Section id={SECTIONS.achievements} className="relative">
      {/* Warm amber glow — different from the cool glow of Skills */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[140px]"
      />

      <div className="relative flex flex-col gap-6">
        <ScrollReveal>
          {/* "Medal banner" marker — horizontal trophy-case motif */}
          <div className="inline-flex w-fit items-center gap-3 rounded-md border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-amber-200/90">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="h-1.5 w-4 rounded-full bg-amber-400/70" />
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>
            <span>Trophy Case</span>
            <span className="text-amber-400/60">\u2022</span>
            <span className="tabular-nums text-amber-300/70">
              {String(achievements.length).padStart(2, "0")} wins
            </span>
          </div>
        </ScrollReveal>

        <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          <AnimatedText text="Moments the work" as="span" mode="words" stagger={0.06} />{" "}
          <span className="text-gradient">
            <AnimatedText text="stood out" as="span" mode="words" stagger={0.06} delay={0.3} />
          </span>
        </h2>

        <p className="max-w-2xl text-base text-white/60 md:text-lg">
          Competition wins, hackathon placements, and work that earned recognition beyond the
          classroom.
        </p>
      </div>

      {/* Category filter tabs */}
      {available.length > 2 && (
        <ScrollReveal delay={0.15}>
          <div
            role="tablist"
            aria-label="Filter achievements by category"
            className="mt-10 flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-md md:w-fit"
          >
            {available.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={filter === cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors md:px-5",
                  filter === cat ? "text-white" : "text-white/55 hover:text-white/85",
                )}
              >
                {filter === cat && (
                  <motion.span
                    layoutId="achievements-filter-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/40 via-amber-400/40 to-orange-500/40"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            ))}
          </div>
        </ScrollReveal>
      )}

      <div className="mt-10 min-h-[240px]">
        <AnimatePresence mode="wait">
          <motion.ul
            key={filter}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visible.map((achievement, index) => (
              <AchievementCard
                key={`${achievement.title}-${achievement.organizer}`}
                achievement={achievement}
                index={index}
              />
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
    </Section>
  );
}
