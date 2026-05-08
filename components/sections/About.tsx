"use client";

import { motion } from "framer-motion";
import { AIMarquee } from "@/components/effects/AIMarquee";
import { CharacterShowcase } from "@/components/effects/CharacterShowcase";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Section } from "@/components/ui/Section";
import { EASING, SECTIONS, SITE } from "@/lib/constants";

const LINES = [
  "Full-stack developer studying D4 Teknik Informatika at Universitas Airlangga, freelancing since 2023 — shipped 4 client projects across web, mobile, and data pipelines.",
  "I design in Figma and build in code: Laravel + Next.js on the back, Flutter + React on the front, with AI wrapped in wherever it earns its keep — embeddings, agents, or a well-tuned prompt.",
  "Comfortable from POS systems and hackathon deploys on Kubernetes to sold mobile designs — always obsessed with the detail that makes something feel crafted.",
];

export function About() {
  return (
    <Section id={SECTIONS.about} className="relative">
      {/* === DOSSIER-STYLE HEADER ============================ */}
      <div className="relative mb-20 flex flex-col gap-10 md:mb-28">
        {/* Corner brackets anchoring the section opener */}
        <div
          aria-hidden="true"
          className="absolute -left-2 -top-6 h-8 w-8 border-l-2 border-t-2 border-[var(--color-accent)]/60 md:-left-4"
        />
        <div
          aria-hidden="true"
          className="absolute -right-2 -top-6 h-8 w-8 border-r-2 border-t-2 border-[var(--color-accent)]/60 md:-right-4"
        />

        {/* Dossier number plate */}
        <ScrollReveal>
          <div className="flex items-center gap-4">
            <motion.span
              initial={{ width: 0 }}
              whileInView={{ width: 64 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1, ease: EASING.outExpo }}
              className="block h-[2px] bg-gradient-to-r from-[var(--color-accent)] to-transparent"
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/60">
              Dossier · <span className="text-[var(--color-accent-hover)]">01</span>
            </span>
            <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.35em] text-white/30 md:inline">
              <span aria-hidden="true">∕∕</span> subject profile
            </span>
          </div>
        </ScrollReveal>

        {/* Enormous opening headline — entirely different rhythm from Capabilities */}
        <h2 className="relative max-w-5xl font-sans text-[clamp(2.5rem,7vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.03em] text-white">
          <span className="block overflow-hidden pb-1">
            <AnimatedText
              text="The human"
              as="span"
              mode="words"
              stagger={0.06}
              className="block"
            />
          </span>
          <span className="block overflow-hidden pb-1">
            <span className="text-gradient">
              <AnimatedText
                text="behind the"
                as="span"
                mode="words"
                stagger={0.06}
                delay={0.2}
                className="block italic"
              />
            </span>
          </span>
          <span className="block overflow-hidden">
            <AnimatedText
              text="keyboard."
              as="span"
              mode="words"
              stagger={0.06}
              delay={0.4}
              className="block"
            />
          </span>
        </h2>

        {/* Small status strip — breaks the pure-type rhythm */}
        <ScrollReveal delay={0.6}>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-white/70">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              Status · online
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-white/70">
              <span className="text-white/40">Role ·</span> Full-Stack Dev × AI Enthusiast
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-white/70">
              <span className="text-white/40">Origin ·</span> Mojokerto, ID
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-white/70">
              <span className="text-white/40">Affiliation ·</span> Airlangga Univ.
            </span>
          </div>
        </ScrollReveal>
      </div>

      {/* AI stack marquee — the tech‑enthusiast signal */}
      <ScrollReveal className="mb-16 md:mb-20">
        <AIMarquee />
      </ScrollReveal>

      {/* === BODY (text + character card) ==================== */}
      <div className="grid gap-16 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <div className="flex flex-col gap-8">
          <ScrollReveal>
            <div
              aria-hidden="true"
              className="h-px w-12 bg-gradient-to-r from-[var(--color-accent)] to-transparent"
            />
          </ScrollReveal>

          <div className="flex flex-col gap-5 text-lg leading-relaxed text-white/75 md:text-xl">
            {LINES.map((line, i) => (
              <motion.p
                key={line}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + i * 0.15,
                  ease: EASING.outExpo,
                }}
              >
                {line}
              </motion.p>
            ))}
          </div>

          <ScrollReveal delay={0.8}>
            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 sm:gap-6 sm:pt-8">
              {[
                // Grounded numbers — matches Experience section.
                // Years coding: started in 2021 at MAN 1 Mojokerto (Multimedia sub-track).
                // AI integrations: Reviewer Fhua (Gemini), AI-forward freelance workflow,
                //   portfolio tooling, plus MCP / LangChain / RAG experiments.
                // Shipped: 4 client engagements + Reviewer Fhua + InSwift + InvestEase
                //   + this portfolio ≈ 6+ production artifacts.
                { label: "Years coding", value: "4+" },
                { label: "AI integrations", value: "10+" },
                { label: "Projects shipped", value: "6+" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <span className="text-2xl font-semibold text-white sm:text-3xl md:text-4xl">
                    {stat.value}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/50 sm:text-xs">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Character showcase — holographic dossier card */}
        <div className="relative flex items-center justify-center">
          <ScrollReveal delay={0.3} className="w-full">
            <div className="flex justify-center">
              <CharacterShowcase
                src="/images/Profile.jpg"
                name={SITE.fullName}
                title={`${SITE.role} · Airlangga Univ.`}
                tag="Operator"
                serial="01"
                accent="129, 140, 248"
                objectPosition="center 20%"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </Section>
  );
}
