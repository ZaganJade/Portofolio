"use client";

import { useEffect, useRef, useState } from "react";
import { useIsTouchDevice } from "@/lib/hooks/useIsTouchDevice";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { lerp } from "@/lib/utils";

/**
 * A subtle cursor trail: a small dot follows the cursor 1:1, and a larger
 * blurred ring follows with lag. Hidden on touch devices and when the user
 * prefers reduced motion. Mounts lazily after first paint.
 */
export function CursorTrail() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const isTouch = useIsTouchDevice();
  const prefersReduced = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isTouch || prefersReduced) return;
    // Defer mount until after hydration settles to avoid blocking FCP/TTI
    const timer = window.setTimeout(() => setReady(true), 400);
    return () => window.clearTimeout(timer);
  }, [isTouch, prefersReduced]);

  useEffect(() => {
    if (!ready) return;

    const onMove = (event: MouseEvent) => {
      target.current.x = event.clientX;
      target.current.y = event.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${event.clientX - 4}px, ${event.clientY - 4}px)`;
      }
    };

    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const tick = () => {
      ring.current.x = lerp(ring.current.x, target.current.x, 0.12);
      ring.current.y = lerp(ring.current.y, target.current.y, 0.12);
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 16}px, ${ring.current.y - 16}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [ready]);

  if (isTouch || prefersReduced || !ready) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] h-2 w-2 rounded-full bg-white mix-blend-difference will-change-transform"
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[99] h-8 w-8 rounded-full border border-white/30 mix-blend-difference will-change-transform"
      />
    </>
  );
}
