import type { LucideIcon } from "lucide-react";
import { Code2, Cpu, Layers, Smartphone, Wrench } from "lucide-react";

export interface Capability {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  icon: LucideIcon;
  /** CSS gradient used for the card accent blob and glow */
  gradient: string;
  /** Accent color used for the number & icon (rgb() string) */
  accent: string;
}

export const capabilities: Capability[] = [
  {
    id: "web",
    number: "01",
    title: "Web Development",
    tagline: "Cinematic web experiences",
    description:
      "Modern web applications with React and Next.js. Fluid animations, premium UI, performance tuned to the millisecond.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind", "Framer Motion"],
    icon: Code2,
    gradient: "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #22d3ee 100%)",
    // Brighter indigo — passes WCAG AA against near-black (>4.5:1)
    accent: "129, 140, 248",
  },
  {
    id: "mobile",
    number: "02",
    title: "Mobile Apps",
    tagline: "Cross-platform, native feel",
    description:
      "Production mobile apps with Flutter and Dart. One codebase, iOS and Android, polished down to the last gesture.",
    tags: ["Flutter", "Dart", "Firebase", "REST APIs", "State management"],
    icon: Smartphone,
    gradient: "linear-gradient(135deg, #22d3ee 0%, #67e8f9 50%, #34d399 100%)",
    // Bright cyan
    accent: "34, 211, 238",
  },
  {
    id: "backend",
    number: "03",
    title: "Full-Stack Systems",
    tagline: "From database to deployment",
    description:
      "End-to-end systems with clean APIs, reliable databases, and deploy pipelines that ship on the first try.",
    tags: ["Node.js", "PHP", "PostgreSQL", "MySQL", "REST", "GraphQL"],
    icon: Layers,
    gradient: "linear-gradient(135deg, #fb923c 0%, #f472b6 50%, #a78bfa 100%)",
    // Bright pink
    accent: "244, 114, 182",
  },
  {
    id: "design",
    number: "04",
    title: "UI/UX Design",
    tagline: "From Figma to production",
    description:
      "Thoughtful design systems that scale. I draft in Figma, prototype in code, and make sure every pixel has intent.",
    tags: ["Figma", "Design systems", "Prototyping", "Motion design"],
    icon: Cpu,
    gradient: "linear-gradient(135deg, #facc15 0%, #fb923c 50%, #f472b6 100%)",
    // Bright amber
    accent: "250, 204, 21",
  },
  {
    id: "devops",
    number: "05",
    title: "DevOps & Collab",
    tagline: "Ship with confidence",
    description:
      "Git workflows, automated testing, and one-click deploys. Good infrastructure is invisible — that's the point.",
    tags: ["Git", "GitHub Actions", "Docker", "Vercel", "CI/CD"],
    icon: Wrench,
    gradient: "linear-gradient(135deg, #34d399 0%, #22d3ee 50%, #818cf8 100%)",
    // Bright emerald
    accent: "52, 211, 153",
  },
];
