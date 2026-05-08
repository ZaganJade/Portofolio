"use client";

import { useEffect, useState } from "react";

/**
 * Reads the user's `prefers-reduced-motion` media query and stays in sync
 * with OS-level changes. Returns `true` when the user prefers reduced motion.
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);

    const handler = (event: MediaQueryListEvent) => setPrefersReduced(event.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}
