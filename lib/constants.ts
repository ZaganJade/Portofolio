/**
 * Global constants — single source of truth for shared values.
 */

export const SITE = {
  name: "Portfolio",
  title: "Muhammad Ikhsanudin Arsalan — Developer",
  description:
    "Scholar and developer from Airlangga University. Building mobile apps, web interfaces, and whatever else feels interesting.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://zagandijade.dev",
  author: "Muhammad Ikhsanudin Arsalan",
  fullName: "Muhammad Ikhsanudin Arsalan",
  role: "Developer",
  locale: "en_US",
  github: "ZaganJade",
} as const;

export const SECTIONS = {
  hero: "hero",
  about: "about",
  projects: "projects",
  skills: "skills",
  achievements: "achievements",
  experience: "experience",
  github: "github",
  contact: "contact",
} as const;

export const NAV_LINKS = [
  { id: SECTIONS.about, label: "About" },
  { id: SECTIONS.projects, label: "Projects" },
  { id: SECTIONS.skills, label: "Skills" },
  { id: SECTIONS.achievements, label: "Achievements" },
  { id: SECTIONS.experience, label: "Experience" },
  { id: SECTIONS.github, label: "GitHub" },
  { id: SECTIONS.contact, label: "Contact" },
] as const;

/** Animation timing constants (ms) */
export const DURATIONS = {
  fast: 200,
  normal: 400,
  slow: 800,
  cinematic: 1200,
} as const;

/** Shared easing curves (GSAP / Framer Motion compatible) */
export const EASING = {
  outExpo: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOutCubic: [0.65, 0, 0.35, 1] as [number, number, number, number],
  outQuart: [0.25, 1, 0.5, 1] as [number, number, number, number],
} as const;

/** Viewport breakpoints (matches Tailwind defaults) */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
