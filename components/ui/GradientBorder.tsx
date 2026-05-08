import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface GradientBorderProps extends HTMLAttributes<HTMLDivElement> {
  /** Force gradient border visible (bypasses hover-only behavior) */
  active?: boolean;
  /** Border radius class (Tailwind) — defaults to rounded-2xl */
  radius?: string;
}

/**
 * Renders children wrapped in a 1px gradient border using the mask technique.
 * See `.gradient-border` in globals.css for the implementation.
 */
export const GradientBorder = forwardRef<HTMLDivElement, GradientBorderProps>(
  ({ active = false, radius = "rounded-2xl", className, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        data-active={active ? "true" : undefined}
        className={cn("gradient-border", radius, className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

GradientBorder.displayName = "GradientBorder";
