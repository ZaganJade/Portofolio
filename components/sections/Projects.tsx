"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { ProjectModal } from "@/components/sections/ProjectModal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Section } from "@/components/ui/Section";
import { type Project, projects } from "@/content/projects";
import { SECTIONS } from "@/lib/constants";

export function Projects() {
  const [active, setActive] = useState<Project | null>(null);

  return (
    <>
      <Section id={SECTIONS.projects} className="relative">
        <div className="flex flex-col gap-6">
          <ScrollReveal>
            {/* Archive-style header bar */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em]">
              <span className="inline-flex items-center gap-2 rounded-sm border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-2.5 py-1 text-[var(--color-accent-hover)]">
                <span className="text-white/50">03</span>
                <span className="h-3 w-px bg-white/20" />
                Archive
              </span>
              <span className="text-white/40">{projects.length} entries · sorted by year</span>
              <span className="ml-auto hidden text-white/30 md:inline">
                <span aria-hidden="true">―――</span> browse
              </span>
            </div>
          </ScrollReveal>

          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              <AnimatedText text="Selected" as="span" mode="words" stagger={0.06} /> <br />
              <span className="text-gradient">
                <AnimatedText text="work" as="span" mode="chars" stagger={0.04} delay={0.3} />
              </span>
            </h2>
            <ScrollReveal delay={0.3}>
              <p className="max-w-md text-base text-white/60 md:text-right md:text-lg">
                A curated collection of projects that span product design, engineering systems, and
                experimental interfaces.
              </p>
            </ScrollReveal>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-3 lg:gap-8">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} onOpen={setActive} />
          ))}
        </div>
      </Section>

      <ProjectModal project={active} onClose={() => setActive(null)} />
    </>
  );
}
