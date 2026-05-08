"use client";

import { useEffect, useRef, useState } from "react";

export interface MousePosition {
  x: number;
  y: number;
}

/**
 * Tracks the global mouse position with optional smoothing (lerp).
 * - `smoothing: 0`  → raw position, updates on every move
 * - `smoothing: 0.15` → buttery-smooth lag, RAF-based
 */
export function useMousePosition(smoothing = 0): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const targetRef = useRef<MousePosition>({ x: 0, y: 0 });
  const currentRef = useRef<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMove = (event: MouseEvent) => {
      targetRef.current = { x: event.clientX, y: event.clientY };
      if (smoothing === 0) {
        setPosition(targetRef.current);
      }
    };

    window.addEventListener("mousemove", handleMove);

    let raf = 0;
    if (smoothing > 0) {
      const tick = () => {
        currentRef.current.x += (targetRef.current.x - currentRef.current.x) * smoothing;
        currentRef.current.y += (targetRef.current.y - currentRef.current.y) * smoothing;
        setPosition({ x: currentRef.current.x, y: currentRef.current.y });
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [smoothing]);

  return position;
}
