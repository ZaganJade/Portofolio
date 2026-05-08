"use client";

import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { CapabilityCard } from "@/components/sections/CapabilityCard";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Section } from "@/components/ui/Section";
import { capabilities } from "@/content/capabilities";

/**
 * "What I Build" — sticky-stack capability cards.
 *
 * Each card gets its own 100vh scroll-room inside a tall outer container.
 * As the user scrolls, the current card pins near the top of the viewport;
 * when the next card arrives it lands on top of the previous one with a
 * small vertical offset, creating a deck-stacking effect (à la devin.ai).
 *
 * The effect is 100% CSS `position: sticky` — no JS scroll handlers, no
 * pinning libraries, no layout thrash. Smooth on mobile and keyboard nav.
 */
export function Capabilities() {
  return (
    <Section id="capabilities" className="relative" noPadding>
      <div className="relative py-20 md:py-32">
        {/* Section header — editorial chapter mark */}
        <div className="mb-16 flex flex-col gap-8 md:mb-20">
          <ScrollReveal>
            <div className="relative flex items-end gap-6">
              {/* Enormous outline chapter numeral */}
              <span
                aria-hidden="true"
                className="select-none font-mono text-[6rem] font-bold leading-[0.75] tracking-tighter text-transparent md:text-[9rem]"
                style={{
                  WebkitTextStroke: "1.5px rgba(129, 140, 248, 0.5)",
                }}
              >
                02.
              </span>
              <div className="flex flex-col gap-1 pb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
                  Chapter
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-accent-hover)]">
                  What I Build
                </span>
              </div>
            </div>
          </ScrollReveal>

          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              <AnimatedText text="From idea to" as="span" mode="words" stagger={0.06} />{" "}
              <span className="text-gradient">
                <AnimatedText
                  text="production-ready"
                  as="span"
                  mode="words"
                  stagger={0.06}
                  delay={0.3}
                />
              </span>
            </h2>
            <ScrollReveal delay={0.3}>
              <p className="max-w-md text-base text-white/60 md:text-right md:text-lg">
                Five disciplines I draw from to ship polished products — scroll through each to see
                how they fit together.
              </p>
            </ScrollReveal>
          </div>
        </div>

        {/* Sticky stack — all cards are siblings in the same containing block.
         * Each card has position:sticky with staggered `top`, so newer cards
         * slide in and pin on top of older ones as the user scrolls.
         * CapabilityCard itself handles margin-bottom for scroll room. */}
        <div className="relative">
          {capabilities.map((capability, index) => (
            <CapabilityCard
              key={capability.id}
              capability={capability}
              index={index}
              total={capabilities.length}
            />
          ))}
        </div>

        {/* Tail spacer — generous room so the last card stays pinned
         * all the way until the very end of the section. */}
        <div aria-hidden="true" className="h-screen" />
      </div>
    </Section>
  );
}
