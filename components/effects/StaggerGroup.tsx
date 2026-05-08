"use client";

import { type HTMLMotionProps, motion } from "framer-motion";
import { Children, type ReactNode } from "react";
import { EASING } from "@/lib/constants";

export interface StaggerGroupProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Delay between each child entering (seconds) */
  stagger?: number;
  /** Initial delay before the first child enters (seconds) */
  delay?: number;
  /** Animate once on enter (default) or on every viewport entry */
  once?: boolean;
  /** Direction of entrance for children */
  direction?: "up" | "down" | "left" | "right";
}

const offsets = {
  up: { y: 30 },
  down: { y: -30 },
  left: { x: 30 },
  right: { x: -30 },
};

/**
 * Stagger-animates direct children into view. Each child gets wrapped
 * in a motion span to receive the entrance animation.
 */
export function StaggerGroup({
  children,
  stagger = 0.1,
  delay = 0,
  once = true,
  direction = "up",
  ...rest
}: StaggerGroupProps) {
  const offset = offsets[direction];
  const childArray = Children.toArray(children);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
      {...rest}
    >
      {childArray.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, ...offset },
            visible: {
              opacity: 1,
              x: 0,
              y: 0,
              transition: { duration: 0.8, ease: EASING.outExpo },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
