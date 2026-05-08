"use client";

import { forwardRef, type HTMLAttributes, type MouseEvent, useRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Show gradient border permanently (vs. on hover only) */
  activeGradient?: boolean;
  /** Enable spotlight effect that follows the cursor */
  spotlight?: boolean;
}

/**
 * Glassmorphism card with optional gradient border and cursor-following
 * radial spotlight on hover. Use for project cards, experience cards, etc.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ activeGradient = false, spotlight = true, className, children, ...rest }, ref) => {
    const innerRef = useRef<HTMLDivElement | null>(null);

    const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
      if (!spotlight) return;
      const el = innerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
      el.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
    };

    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: onMouseMove is a non-interactive visual enhancement (cursor spotlight)
      <div
        ref={(node) => {
          innerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        data-active={activeGradient ? "true" : undefined}
        onMouseMove={handleMouseMove}
        role="presentation"
        className={cn(
          "gradient-border glass relative overflow-hidden rounded-2xl",
          "transition-[transform,box-shadow] duration-500 ease-out",
          "hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(99,102,241,0.4)]",
          className,
        )}
        {...rest}
      >
        {spotlight && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(circle 240px at var(--spot-x, 50%) var(--spot-y, 50%), rgba(99,102,241,0.15), transparent 70%)",
            }}
          />
        )}
        <div className="relative z-10 h-full">{children}</div>
      </div>
    );
  },
);

Card.displayName = "Card";
