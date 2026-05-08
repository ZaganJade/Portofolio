"use client";

import { type MouseEvent, type ReactNode, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export interface MagneticProps {
  children: ReactNode;
  /** Max distance the element will translate toward the cursor (px) */
  strength?: number;
  /** Proximity radius inside which the magnetic effect kicks in (px) */
  radius?: number;
  /** Wrapper className */
  className?: string;
}

/**
 * Makes its child follow the cursor when the cursor enters the element's
 * bounding box, creating a subtle "magnetic" pull. Perfect for hero CTAs
 * and contact buttons.
 */
export function Magnetic({ children, strength = 18, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();

  const handleMove = (event: MouseEvent<HTMLSpanElement>) => {
    if (prefersReduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (event.clientX - cx) / (rect.width / 2);
    const dy = (event.clientY - cy) / (rect.height / 2);
    el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: decorative magnetic wrapper, not a button
    <span onMouseMove={handleMove} onMouseLeave={reset} className={cn("inline-block", className)}>
      <span
        ref={ref}
        className="inline-block transition-transform duration-300 ease-out will-change-transform"
      >
        {children}
      </span>
    </span>
  );
}
