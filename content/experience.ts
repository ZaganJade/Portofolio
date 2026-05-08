/**
 * Work experience & education — listed newest first.
 *
 * The Experience section renders a single unified timeline:
 *   • `kind: "work"`       → job / freelance / client project
 *   • `kind: "education"`  → formal schooling
 *
 * Order here is visual timeline order top→bottom. Present / ongoing
 * items first.
 */

export type ExperienceKind = "work" | "education";

export interface Experience {
  id: string;
  kind: ExperienceKind;
  /** Institution (school / university) or employer / client org */
  company: string;
  /** Role / program title */
  role: string;
  /** Human-readable start date */
  startDate: string;
  /** Human-readable end date, or "Present" for ongoing */
  endDate: string;
  /** Short paragraph summary */
  description: string;
  /** Optional bullet highlights */
  achievements?: string[];
  /** City / region or "Remote" */
  location?: string;
}

export const experience: Experience[] = [
  {
    id: "airlangga",
    kind: "education",
    company: "Universitas Airlangga",
    role: "D4 Teknik Informatika",
    startDate: "Aug 2024",
    endDate: "Present",
    location: "Surabaya, ID",
    description:
      "Pursuing a D4 Applied Bachelor in Informatics Engineering while building real software on the side. Focused on software engineering fundamentals, AI/ML applications, and the intersection of product design with code.",
    achievements: [
      "Joined Refactory Hackathon (Airlangga chapter) in 2025 as a participant",
      "Self-directed study in LLMs, RAG systems, and MCP-based agent tooling",
    ],
  },
  {
    id: "freelance",
    kind: "work",
    company: "Independent",
    role: "Freelance Developer",
    startDate: "2023",
    endDate: "Present",
    location: "Remote",
    description:
      "Partnering with clients on end-to-end builds — web apps, landing pages, data tooling, and mobile prototypes — with a focus on modern stacks (Next.js, TypeScript, Tailwind, Laravel) and AI-assisted workflows. Started with a data-entry automation engagement for student achievement records at Universitas Brawijaya and grew into full product work.",
    achievements: [
      "Delivered 4 client engagements end-to-end across web and mobile",
      "Sold InSwift — a complete high-fidelity mobile app design — to a paying client",
      "Shipped InvestEase — high-fidelity mobile design for a personal investment app",
      "Built ResQ at a hackathon: Laravel + AI + WhatsApp alerts, deployed to Kubernetes",
      "Shipped E-Ticketing Helpdesk: Flutter mobile + Go/Supabase backend, clean architecture",
      "Built a full POS + canteen admin system in Laravel: Midtrans payments, Google OAuth, OTP, PDF reports, AI chatbot",
      "Designed 3 high-fidelity mobile application prototypes (handoff-ready)",
      "Built first revenue project at UB: student achievement data pipeline",
      "Tech stack: Laravel, PostgreSQL, MySQL, Supabase, Figma",
      "AI-forward build process using LLM tooling for spec, scaffolding, and review",
    ],
  },
  {
    id: "man-mojokerto",
    kind: "education",
    company: "MAN 1 Mojokerto",
    role: "Senior Secondary — IPA (Multimedia sub-track)",
    startDate: "2021",
    endDate: "2024",
    location: "Mojokerto, ID",
    description:
      "Graduated from IPA stream with a Multimedia specialization. Taught myself web development, UI design, and programming fundamentals outside the curriculum — the foundation for later freelance work.",
    achievements: [
      "Multimedia sub-track — design + production fundamentals",
      "Built first portfolio websites and client landing pages during school years",
      "Started freelancing in the final year, leading straight into university work",
    ],
  },
];

/**
 * Counter stats rendered above the timeline. Numbers grounded in actual
 * progress as of early 2026. Update as the count grows.
 */
export const achievements = [
  { label: "Years coding", value: 4, suffix: "+" },
  { label: "Client projects", value: 4, suffix: "" },
  { label: "High-fi prototypes", value: 3, suffix: "" },
  { label: "Ongoing degree", value: 1, suffix: "" },
] as const;
