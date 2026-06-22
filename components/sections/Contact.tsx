"use client";

import { ArrowUp, Github, Linkedin, Mail, MessageCircle, Twitter } from "lucide-react";
import type { ComponentType } from "react";
import { ChatbotCard } from "@/components/effects/ChatbotCard";
import { Magnetic } from "@/components/effects/Magnetic";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { useSmoothScroll } from "@/components/effects/SmoothScrollProvider";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Section } from "@/components/ui/Section";
import { type Social, socials } from "@/content/socials";
import { SECTIONS, SITE } from "@/lib/constants";

const ICONS: Record<Social["platform"], ComponentType<{ size?: number; className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  email: Mail,
  dribbble: Mail,
  whatsapp: MessageCircle,
};

export function Contact() {
  const { scrollTo } = useSmoothScroll();
  const whatsappLink = socials.find((s) => s.platform === "whatsapp");
  const emailLink = socials.find((s) => s.platform === "email");

  return (
    <Section id={SECTIONS.contact} className="relative overflow-hidden">
      {/* Ambient gradient blobs */}
      <div
        aria-hidden="true"
        className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-[var(--color-accent)]/20 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-[var(--color-accent-2)]/20 blur-[100px]"
      />

      <div className="relative flex flex-col items-center gap-10 text-center">
        <ScrollReveal>
          {/* Radio signal / morse pattern */}
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.35em]">
            <span
              aria-hidden="true"
              className="flex items-center gap-1.5 text-[var(--color-accent-hover)]"
            >
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-px w-3 bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-px w-3 bg-current" />
            </span>
            <span className="text-white/80">Signal Open</span>
            <span
              aria-hidden="true"
              className="flex items-center gap-1.5 text-[var(--color-accent-hover)]"
            >
              <span className="h-px w-3 bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-px w-3 bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
            </span>
          </div>
        </ScrollReveal>

        <h2 className="max-w-4xl text-4xl font-semibold leading-[1] tracking-tight text-white sm:text-5xl md:text-7xl lg:text-8xl">
          <AnimatedText text="Let's build" as="span" mode="words" stagger={0.06} />
          <br />
          <span className="text-gradient">
            <AnimatedText
              text="something amazing."
              as="span"
              mode="words"
              stagger={0.06}
              delay={0.3}
            />
          </span>
        </h2>

        <ScrollReveal delay={0.5}>
          <p className="max-w-xl text-base text-white/60 md:text-lg">
            I'm always open to new projects, collaborations, or just a good chat about craft. Reach
            out via any of these channels — or ask the AI assistant below.
          </p>
        </ScrollReveal>

        {/* Primary CTAs: Email + WhatsApp */}
        <ScrollReveal delay={0.7}>
          <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Magnetic strength={22}>
              <a
                href={emailLink?.url ?? "mailto:ikhsanarsalan@gmail.com"}
                className="group relative inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-signature px-6 text-base font-medium text-white shadow-[0_0_40px_rgba(99,102,241,0.35)] transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] sm:w-auto sm:px-8"
              >
                <Mail size={18} />
                Get in touch
              </a>
            </Magnetic>

            {whatsappLink && (
              <Magnetic strength={22}>
                <a
                  href={whatsappLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-6 text-base font-medium text-emerald-200 backdrop-blur-md transition-all duration-300 ease-out hover:scale-[1.02] hover:border-emerald-400/70 hover:bg-emerald-500/20 hover:text-white hover:shadow-[0_0_40px_rgba(16,185,129,0.45)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] sm:w-auto sm:px-8"
                >
                  <MessageCircle size={18} />
                  Chat on WhatsApp
                </a>
              </Magnetic>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.9}>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-4">
            {socials.map((social) => {
              const Icon = ICONS[social.platform];
              const isMail = social.platform === "email";
              return (
                <li key={social.platform}>
                  <a
                    href={social.url}
                    target={isMail ? undefined : "_blank"}
                    rel={isMail ? undefined : "noopener noreferrer"}
                    aria-label={social.label}
                    className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 hover:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                  >
                    <Icon size={18} />
                  </a>
                </li>
              );
            })}
          </ul>
        </ScrollReveal>
      </div>

      {/* === Arsa AI chatbot — stands alone as a "capability-style" card ==== */}
      <ScrollReveal delay={0.3} className="mt-20 md:mt-28">
        <ChatbotCard />
      </ScrollReveal>

      {/* Footer / scroll-to-top */}
      <div className="relative mt-24 flex flex-col items-center gap-6 border-t border-white/10 pt-10 text-center md:flex-row md:justify-between md:text-left">
        <p className="font-mono text-xs text-white/50">
          © {new Date().getFullYear()} {SITE.author}. Crafted with care.
        </p>

        <button
          type="button"
          onClick={() => scrollTo(0)}
          className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-white/50 transition-colors hover:text-white"
        >
          Back to top
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 transition-all group-hover:border-[var(--color-accent)] group-hover:bg-[var(--color-accent)]/10">
            <ArrowUp size={14} />
          </span>
        </button>
      </div>
    </Section>
  );
}
