import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** HTML id used for anchor links / active-section tracking */
  id: string;
  /** Remove default vertical padding (useful for hero) */
  noPadding?: boolean;
  /** Use full-viewport min height */
  fullHeight?: boolean;
  /** Skip the inner max-w container (for full-bleed sections) */
  noContainer?: boolean;
}

/**
 * Consistent section wrapper: centers content, applies max-width,
 * and exposes an id for anchor-based navigation.
 */
export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      id,
      noPadding = false,
      fullHeight = false,
      noContainer = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn(
          "relative w-full",
          !noPadding && "py-16 md:py-28 lg:py-32",
          fullHeight && "min-h-screen flex items-center",
          className,
        )}
        {...rest}
      >
        {noContainer ? (
          children
        ) : (
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 md:px-10">{children}</div>
        )}
      </section>
    );
  },
);

Section.displayName = "Section";
