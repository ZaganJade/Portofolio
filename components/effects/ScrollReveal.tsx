"use client";

import { type MotionProps, motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASING } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface ScrollRevealProps extends Omit<MotionProps, "children"> {
  children: ReactNode;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Starting translateY in pixels */
  y?: number;
  /** Direction of entrance */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Animate once (default) or on every entry */
  once?: boolean;
  /** Extra className for the wrapper */
  className?: string;
  /** Render as a specific element */
  as?: "div" | "section" | "article" | "ul" | "li" | "span";
}

const offsets = {
  up: { y: 30 },
  down: { y: -30 },
  left: { x: 30 },
  right: { x: -30 },
  none: {},
};

/**
 * Animates children into view when they enter the viewport.
 * Default: 30px upward motion + opacity fade, once per element.
 */
export function ScrollReveal({
  children,
  delay = 0,
  y,
  direction = "up",
  once = true,
  className,
  as = "div",
  ...rest
}: ScrollRevealProps) {
  const offset = y !== undefined ? { y } : offsets[direction];
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-10% 0px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: EASING.outExpo,
      }}
      className={cn(className)}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
