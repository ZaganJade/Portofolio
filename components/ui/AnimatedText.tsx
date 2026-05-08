"use client";

import { type HTMLMotionProps, motion } from "framer-motion";
import { EASING } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Mode = "words" | "lines" | "chars";

export interface AnimatedTextProps extends Omit<HTMLMotionProps<"span">, "children"> {
  /** Text content to animate */
  text: string;
  /** How to split the text */
  mode?: Mode;
  /** Stagger between each unit (seconds) */
  stagger?: number;
  /** Delay before the whole animation starts (seconds) */
  delay?: number;
  /** Animate once when it enters the viewport (default) or on every entry */
  once?: boolean;
  /** Render as a specific element */
  as?: "span" | "h1" | "h2" | "h3" | "p";
}

const container = (stagger: number, delay: number) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

const item = {
  hidden: { y: "110%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: EASING.outExpo,
    },
  },
};

/**
 * Reveal text word-by-word, line-by-line, or character-by-character
 * when it enters the viewport. Uses Framer Motion under the hood.
 */
export function AnimatedText({
  text,
  mode = "words",
  stagger = 0.08,
  delay = 0,
  once = true,
  as = "span",
  className,
  ...rest
}: AnimatedTextProps) {
  const units =
    mode === "chars" ? Array.from(text) : mode === "lines" ? text.split("\n") : text.split(" ");

  const MotionTag = motion[as as keyof typeof motion] as typeof motion.span;

  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px" }}
      variants={container(stagger, delay)}
      className={cn("inline-block", className)}
      {...rest}
    >
      {units.map((unit, i) => (
        <span
          key={`${unit}-${i}`}
          className="inline-block overflow-hidden whitespace-pre align-bottom"
        >
          <motion.span variants={item} className="inline-block">
            {unit}
            {mode === "words" && i < units.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
