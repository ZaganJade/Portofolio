"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { GraduationCap, MapPin } from "lucide-react";
import { useRef } from "react";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Counter } from "@/components/ui/Counter";
import { Section } from "@/components/ui/Section";
import { achievements, experience } from "@/content/experience";
import { EASING, SECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Experience() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 70%", "end 30%"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <Section id={SECTIONS.experience} className="relative">
      <div className="flex flex-col gap-6">
        <ScrollReveal>
          {/* Waypoint / path marker */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <span aria-hidden="true" className="text-[var(--color-accent-hover)] text-lg">
              ↳
            </span>
            <span className="inline-flex items-baseline gap-2 uppercase tracking-[0.3em]">
              <span className="text-white/40">Waypoint</span>
              <span className="text-[var(--color-accent-hover)]">·</span>
              <span className="text-[var(--color-accent-hover)] text-sm font-semibold">05</span>
            </span>
            <span className="ml-2 hidden h-px w-16 bg-gradient-to-r from-[var(--color-accent-hover)] to-transparent md:block" />
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 md:inline">
              the path so far
            </span>
          </div>
        </ScrollReveal>

        <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          <AnimatedText text="A journey of" as="span" mode="words" stagger={0.06} />{" "}
          <span className="text-gradient">
            <AnimatedText
              text="shipping & learning"
              as="span"
              mode="words"
              stagger={0.06}
              delay={0.3}
            />
          </span>
        </h2>
      </div>

      {/* Achievement counters */}
      <ScrollReveal delay={0.3}>
        <div className="mt-10 grid grid-cols-2 gap-4 border-y border-white/10 py-6 sm:gap-6 sm:py-8 md:mt-12 md:grid-cols-4">
          {achievements.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <Counter
                value={item.value}
                suffix={item.suffix}
                className="text-3xl font-semibold text-white sm:text-4xl md:text-5xl"
              />
              <span className="text-[11px] uppercase tracking-wider text-white/50 sm:text-xs">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Timeline */}
      <div ref={timelineRef} className="relative mt-16 md:mt-20">
        {/* Background line */}
        <div className="absolute left-4 top-0 h-full w-px bg-white/10 md:left-1/2 md:-translate-x-1/2" />

        {/* Animated progress line */}
        <motion.div
          style={{ height: lineHeight }}
          className="absolute left-4 top-0 w-px origin-top bg-gradient-to-b from-[var(--color-accent)] via-[var(--color-accent-2)] to-transparent md:left-1/2 md:-translate-x-1/2"
        />

        <ul className="flex flex-col gap-12 md:gap-16">
          {experience.map((item, i) => {
            const isRight = i % 2 === 1;
            return (
              <li key={item.id} className="relative pl-12 md:pl-0">
                {/* Timeline dot */}
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-15% 0px" }}
                  transition={{ duration: 0.5, ease: EASING.outExpo }}
                  className="absolute left-4 top-6 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-gradient-signature shadow-[0_0_20px_rgba(99,102,241,0.6)] md:left-1/2"
                />

                <motion.article
                  initial={{ opacity: 0, x: isRight ? 40 : -40, y: 20 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: "-15% 0px" }}
                  transition={{ duration: 0.8, ease: EASING.outExpo }}
                  className={cn(
                    "glass gradient-border relative rounded-2xl p-6 md:w-[calc(50%-2rem)] md:p-8",
                    isRight ? "md:ml-auto" : "md:mr-auto",
                  )}
                >
                  <div className="flex flex-col gap-1 pb-4">
                    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-accent-hover)]">
                      {item.kind === "education" ? (
                        <GraduationCap size={12} aria-hidden="true" />
                      ) : null}
                      <span>{item.kind === "education" ? "Education" : "Work"}</span>
                      <span className="text-white/20">|</span>
                      <span className="tracking-wider normal-case">
                        {item.startDate} — {item.endDate}
                      </span>
                    </span>
                    <h3 className="text-xl font-semibold text-white md:text-2xl">{item.role}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                      <span className="font-medium text-white/80">{item.company}</span>
                      {item.location && (
                        <>
                          <span className="text-white/20">•</span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} />
                            {item.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-white/70 md:text-base">
                    {item.description}
                  </p>

                  {item.achievements && (
                    <ul className="mt-4 flex flex-col gap-2">
                      {item.achievements.map((ach) => (
                        <li
                          key={ach}
                          className="flex gap-2 text-sm text-white/60 before:mt-2 before:block before:h-[1px] before:w-3 before:flex-none before:bg-[var(--color-accent)]"
                        >
                          {ach}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.article>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
