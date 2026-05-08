"use client";

import { useEffect, useState } from "react";

/**
 * Detects whether the current device is touch-primary (no persistent cursor).
 * SSR-safe: always returns `false` during server render, updates on mount.
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const touch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(hover: none)").matches;
    setIsTouch(touch);
  }, []);

  return isTouch;
}
