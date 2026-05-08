"use client";

import Lenis from "lenis";
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number }) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: () => {
    /* noop before init */
  },
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

/**
 * Wraps the app in a Lenis smooth-scroll instance and exposes a
 * `scrollTo` method for programmatic navigation. Respects
 * `prefers-reduced-motion` by falling back to native browser scroll.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const rafRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setLenis(null);
      return;
    }

    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
      wheelMultiplier: 1,
    });

    setLenis(instance);

    // Integrate with GSAP ScrollTrigger when available
    const integrate = async () => {
      try {
        const gsapMod = await import("gsap");
        const stMod = await import("gsap/ScrollTrigger");
        const gsap = gsapMod.default ?? gsapMod.gsap;
        const ScrollTrigger = stMod.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        instance.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time: number) => {
          instance.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      } catch {
        // GSAP not yet loaded — fall back to a manual RAF loop
        const raf = (time: number) => {
          instance.raf(time);
          rafRef.current = requestAnimationFrame(raf);
        };
        rafRef.current = requestAnimationFrame(raf);
      }
    };

    integrate();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      instance.destroy();
    };
  }, [prefersReducedMotion]);

  const scrollTo: SmoothScrollContextValue["scrollTo"] = (target, options) => {
    if (lenis) {
      lenis.scrollTo(target, { offset: options?.offset ?? -80 });
    } else if (typeof document !== "undefined") {
      // Fallback when Lenis is disabled (reduced motion)
      if (typeof target === "string") {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: "smooth" });
      }
    }
  };

  return (
    <SmoothScrollContext.Provider value={{ lenis, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
