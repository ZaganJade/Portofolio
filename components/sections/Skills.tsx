"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { CertificationCard } from "@/components/sections/CertificationCard";
import { SkillCard } from "@/components/sections/SkillCard";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Section } from "@/components/ui/Section";
import { certifications } from "@/content/certifications";
import { type SkillCategory, skillCategories, skills } from "@/content/skills";
import { SECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Top-level sub-section switch inside the Skills section. */
type SubView = "stack" | "credentials";

const SUB_VIEWS: { id: SubView; label: string; command: string }[] = [
  { id: "stack", label: "Stack", command: "--tree" },
  { id: "credentials", label: "Certificates", command: "--credentials" },
];

export function Skills() {
  const [view, setView] = useState<SubView>("stack");
  const [activeSkill, setActiveSkill] = useState<SkillCategory>(skillCategories[0] ?? "Frontend");
  const visibleSkills = skills.filter((s) => s.category === activeSkill);

  const activeSubView = SUB_VIEWS.find((s) => s.id === view) ?? SUB_VIEWS[0];

  return (
    <Section id={SECTIONS.skills} className="relative">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent)]/10 blur-[120px]"
      />

      <div className="relative flex flex-col gap-6">
        <ScrollReveal>
          {/* Terminal prompt header \u2014 command updates per sub-view */}
          <div className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 bg-black/50 px-3 py-1.5 font-mono text-[11px] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <span className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-red-400/70" />
              <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
            </span>
            <span className="text-white/40">~/portfolio</span>
            <span className="text-[var(--color-accent-hover)]">$</span>
            <span>skills</span>
            <span className="text-[var(--color-accent-2)]">{activeSubView?.command}</span>
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-[var(--color-accent-hover)]"
            />
          </div>
        </ScrollReveal>

        <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          <AnimatedText text="Tools I use to" as="span" mode="words" stagger={0.06} />{" "}
          <span className="text-gradient">
            <AnimatedText text="build & ship" as="span" mode="words" stagger={0.06} delay={0.3} />
          </span>
        </h2>
      </div>

      {/* Sub-section switcher: Stack vs Certificates */}
      <ScrollReveal delay={0.15}>
        <div
          role="tablist"
          aria-label="Skills section view"
          className="mt-10 inline-flex w-fit gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md"
        >
          {SUB_VIEWS.map((sub) => (
            <button
              key={sub.id}
              type="button"
              role="tab"
              aria-selected={view === sub.id}
              onClick={() => setView(sub.id)}
              className={cn(
                "relative rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition-colors md:px-6",
                view === sub.id ? "text-white" : "text-white/50 hover:text-white/80",
              )}
            >
              {view === sub.id && (
                <motion.span
                  layoutId="skill-subview-pill"
                  className="absolute inset-0 rounded-full bg-gradient-signature"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{sub.label}</span>
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Content swap with animated mode presence */}
      <AnimatePresence mode="wait">
        {view === "stack" ? (
          <motion.div
            key="stack"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {/* Category tabs (Frontend / AI / Backend \u2026) */}
            <ScrollReveal delay={0.1}>
              <div
                role="tablist"
                aria-label="Skill categories"
                className="mt-6 flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-md md:w-fit"
              >
                {skillCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={activeSkill === cat}
                    onClick={() => setActiveSkill(cat)}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm font-medium transition-colors md:px-6",
                      activeSkill === cat ? "text-white" : "text-white/60 hover:text-white",
                    )}
                  >
                    {activeSkill === cat && (
                      <motion.span
                        layoutId="skill-tab-pill"
                        className="absolute inset-0 rounded-full bg-gradient-signature"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{cat}</span>
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {/* Skills grid */}
            <div className="mt-10 min-h-[240px]">
              <AnimatePresence mode="wait">
                <motion.ul
                  key={activeSkill}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={{
                    visible: { transition: { staggerChildren: 0.04 } },
                    exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
                  }}
                  className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
                >
                  {visibleSkills.map((skill, index) => (
                    <SkillCard key={skill.name} skill={skill} index={index} />
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="credentials"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mt-10 min-h-[240px]"
          >
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
              }}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {certifications.map((cert, index) => (
                <CertificationCard key={cert.name} cert={cert} index={index} />
              ))}
            </motion.ul>

            {certifications.length === 0 && (
              <p className="mt-6 font-mono text-sm text-white/50">$ no credentials indexed yet.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
