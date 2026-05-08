"use client";

import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/constants";

/**
 * Tracks which section is currently the most visible in the viewport
 * via IntersectionObserver. Returns the section id as a string.
 */
export function useActiveSection(): string {
  const [active, setActive] = useState<string>(NAV_LINKS[0]?.id ?? "");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ids = [...NAV_LINKS.map((l) => l.id), "hero"] as string[];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the largest intersection ratio
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0 && visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const section of sections) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return active;
}
