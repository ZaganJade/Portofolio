"use client";

import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Magnetic } from "@/components/effects/Magnetic";
import { useSmoothScroll } from "@/components/effects/SmoothScrollProvider";
import { SceneErrorBoundary } from "@/components/three/SceneErrorBoundary";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { EASING, SECTIONS, SITE } from "@/lib/constants";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { hasWebGL } from "@/lib/utils";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => null,
});

const nameVariants = {
  hidden: { y: "110%" },
  visible: (i: number) => ({
    y: 0,
    transition: {
      duration: 1,
      delay: 0.3 + i * 0.06,
      ease: EASING.outExpo,
    },
  }),
};

export function Hero() {
  const { scrollTo } = useSmoothScroll();
  const prefersReduced = useReducedMotion();
  const parts = SITE.fullName.split(" ");
  const firstName = parts.slice(0, 2).join(" ");
  const lastName = parts.slice(2).join(" ") || "Name";

  // Check WebGL support on mount — some Android devices lack it
  const [webglOk, setWebglOk] = useState(false);
  useEffect(() => {
    const ok = hasWebGL();
    setWebglOk(ok);
    if (!ok) console.warn("[Hero] WebGL not available — 3D scene skipped");
  }, []);

  // Defer Canvas mount so hydration + initial paint complete before
  // Three.js starts evaluating. Main thread gets breathing room.
  const [mountScene, setMountScene] = useState(false);
  useEffect(() => {
    // Mount at 800ms — early enough to sync with text reveal (text
    // starts at 0.3s, settles ~1.8s). Fade-in overlaps the tail end
    // so 3D and text feel simultaneous.
    // NOTE: We intentionally still mount when prefersReduced is true
    // because MIUI/HyperOS (Poco, Xiaomi) enables reduced motion by
    // default, which would completely hide the 3D character otherwise.
    // The HeroCharacter component handles reduced-motion internally by
    // skipping breathing/cursor animations.
    const timer = window.setTimeout(() => setMountScene(true), prefersReduced ? 0 : 800);
    return () => window.clearTimeout(timer);
  }, [prefersReduced]);

  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) scrollTo(el, { offset: -80 });
  };

  return (
    <Section
      id={SECTIONS.hero}
      fullHeight
      noPadding
      noContainer
      className="relative overflow-hidden"
    >
      {/* Animated gradient mesh background */}
      <div aria-hidden="true" className="absolute inset-0 gradient-mesh" />

      {/* 3D scene layer — mounts 500ms after paint, uses opacity+scale
          only (compositor-cheap properties). Duration matches the text
          stagger so reveal feels coordinated. Perf target: ~80. */}
      {webglOk && mountScene && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <SceneErrorBoundary fallback={null}>
            <HeroScene />
          </SceneErrorBoundary>
        </motion.div>
      )}

      {/* Content overlay */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-2 text-center sm:px-6 md:px-10">
        <div className="flex w-full max-w-none flex-col items-center justify-center gap-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASING.outExpo }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md"
          >
            <Sparkles size={14} className="text-[var(--color-accent)]" />
            <span>Available for new projects</span>
          </motion.div>

          <h1 className="w-full max-w-none font-sans font-semibold leading-[1.02] tracking-tight text-white text-[clamp(2.35rem,9.6vw,9rem)] sm:text-[clamp(3rem,8vw,9rem)]">
            <span className="block overflow-hidden sm:whitespace-nowrap">
              <motion.span
                custom={0}
                variants={nameVariants}
                initial="hidden"
                animate="visible"
                className="block"
              >
                {firstName}
              </motion.span>
            </span>
            <span className="block overflow-hidden sm:whitespace-nowrap">
              <motion.span
                custom={1}
                variants={nameVariants}
                initial="hidden"
                animate="visible"
                className="block text-gradient"
              >
                {lastName}
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: EASING.outExpo }}
            className="mx-auto max-w-2xl text-lg text-white/70 md:text-xl"
          >
            {SITE.role} crafting cinematic digital experiences with modern tooling, 3D interactions,
            and performance-first design.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: EASING.outExpo }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Magnetic>
              <Button variant="primary" size="lg" onClick={() => goTo(SECTIONS.projects)}>
                View Projects
              </Button>
            </Magnetic>
            <Magnetic>
              <Button variant="secondary" size="lg" onClick={() => goTo(SECTIONS.contact)}>
                Contact Me
              </Button>
            </Magnetic>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.button
          type="button"
          onClick={() => goTo(SECTIONS.about)}
          aria-label="Scroll to next section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2, ease: EASING.outExpo }}
          className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/50 transition-colors hover:text-white md:flex"
        >
          <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={18} />
          </motion.span>
        </motion.button>
      </div>
    </Section>
  );
}
