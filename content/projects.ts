/**
 * Project catalogue — edit here to add, remove, or reorder projects.
 * Components consume this array directly; no rebuilds outside content needed.
 *
 * Order in this array is the render order (top → bottom on the site).
 */

export interface Project {
  /** Stable kebab-case id used for keys and URLs */
  id: string;
  /** Display title */
  title: string;
  /** Short tagline shown on the card (2-3 lines max) */
  description: string;
  /** Longer description shown in the detail modal */
  longDescription?: string;
  /** Technology tags */
  tags: string[];
  /** Preview image path (relative to /public) or CSS gradient string */
  image: string;
  /** Live demo URL */
  liveUrl?: string;
  /** GitHub / source repository URL */
  githubUrl?: string;
  /** Highlight in a featured section */
  featured: boolean;
  /** Year shipped, for sorting */
  year: number;
}

export const projects: Project[] = [
  {
    id: "reviewer-fhua",
    title: "Reviewer Fhua",
    description:
      "AI-powered academic reviewer matching for legal journals. Semantic embeddings pick the right reviewer for every manuscript — not just keyword guesses.",
    longDescription:
      "Built for Fakultas Hukum Universitas Airlangga to find the perfect peer reviewer for every journal submission. The system converts manuscript abstracts and reviewer profiles into vector embeddings via Google Gemini's text-embedding-004, then ranks candidates by cosine similarity. Gemini 2.0 Flash explains why each top reviewer fits, and Fonnte's WhatsApp API lets editors reach out in one click. Supports three Airlangga law journals (Yuridika, Notaire, Jurist-Diction), six legal expertise areas, a reviewer verification workflow, and an embeddable registration form that drops into WordPress via iframe.",
    tags: ["Next.js", "Gemini AI", "Embeddings", "Cosine Similarity", "Fonnte API", "WhatsApp"],
    image: "url('/images/reviewer-fhua.png') center/cover, #0f172a",
    liveUrl: "https://reviewerfhua.my.id/",
    featured: true,
    year: 2026,
  },
  {
    id: "workshop-laravel-pos",
    title: "Workshop Laravel — POS & Canteen System",
    description:
      "Full-stack Laravel build: point-of-sale + admin dashboard with Midtrans payments, Google OAuth, email OTP, PDF reports, and an AI chatbot assistant.",
    longDescription:
      "A feature-dense Laravel application originally spun up as a workshop exercise and grown into a production-style build. Covers merchant-facing POS with pending-order queue and receipt printing, an admin dashboard for books / categories / items / vendors with activity-log audit trail, full auth stack (login, register, email verification, OTP, Google OAuth, password reset), Midtrans payment integration with scheduled status sync, PDF generation for reports, and an AI-powered chatbot service layer. Built with Laravel's expressive ORM and service providers, structured into Controllers / Models / Services with Blade templates driving both the admin UI and customer-facing POS layout.",
    tags: [
      "Laravel",
      "PHP",
      "POS",
      "Midtrans",
      "Google OAuth",
      "OTP Email",
      "PDF",
      "AI Chatbot",
      "Blade",
    ],
    image: "url('/images/Workshop-Laravel.png') center/cover, #0f172a",
    githubUrl: "https://github.com/ZaganJade/Workshop-Laravel",
    featured: true,
    year: 2026,
  },
  {
    id: "investease",
    title: "InvestEase",
    description:
      "High-fidelity mobile design for a personal investment companion — onboarding, portfolio tracking, and frictionless deposit flows.",
    longDescription:
      "InvestEase is a high-fidelity mobile application design focused on making investing approachable for first-time users. Built end-to-end in Figma: auth and KYC, portfolio dashboards, asset detail sheets, buy/sell flows, and an onboarding educational track. Includes a full component library, interactive prototype, and handoff-ready specs. The work emphasizes clear financial hierarchy, trust signals, and a calm visual language that keeps dense numeric data legible.",
    tags: ["Figma", "Fintech", "Mobile App", "UI/UX", "Prototype", "Design System"],
    image: "url('/images/InvestEase.png') center/cover, #0f172a",
    liveUrl: "https://www.figma.com/design/ZDl0ujZEbieNjVHgSy550g/InvestEase",
    featured: true,
    year: 2025,
  },
  {
    id: "inswift",
    title: "InSwift",
    description:
      "High-fidelity mobile app design — sold to a paying client. Full flow, component library, and interactive prototype delivered handoff-ready.",
    longDescription:
      "InSwift is a high-fidelity mobile application design crafted end-to-end in Figma — flow, component library, motion specs, and an interactive prototype. The design was acquired by a paying client and is now a shipped, closed project. Scope covered auth, core transactional flows, settings, and onboarding, with a cohesive design system that could hand off cleanly to a development team.",
    tags: ["Figma", "Mobile App", "UI/UX", "Prototype", "Design System"],
    image: "url('/images/InSwift.png') center/cover, #0f172a",
    liveUrl: "https://www.figma.com/design/ikl7BoNBcGcn7uabkZDtAF/InSwift--Sold-",
    featured: true,
    year: 2025,
  },
  {
    id: "resq",
    title: "ResQ — Disaster Response Platform",
    description:
      "Hackathon build: location-based disaster risk analysis with AI assist and WhatsApp alerts. Laravel backend deployed to Kubernetes. Demo server retired; source on GitHub.",
    longDescription:
      "ResQ is a disaster-response platform built during a hackathon sprint. Users share their location and receive risk analysis powered by Google Maps geospatial data and an AI-assist layer (Fireworks) that reasons over current conditions. Alerts go out via WhatsApp using Fonnte-style webhooks, with per-user notification preferences and a mitigation content library (articles and guides). Backend is Laravel with PostgreSQL, structured around clean service layers — external API monitor, circuit breaker, rate limiter, and fallback manager. Shipped to a Kubernetes cluster with dedicated scheduler, cronjob, and deployment manifests. Hackathon demo server has been retired; source remains on GitHub.",
    tags: [
      "Laravel",
      "PHP",
      "PostgreSQL",
      "Kubernetes",
      "Fireworks AI",
      "Google Maps",
      "WhatsApp",
      "Hackathon",
    ],
    image: "url('/images/ResQ.png') center/cover, #0f172a",
    githubUrl: "https://github.com/ZaganJade/Hackathon-ResQ",
    featured: true,
    year: 2025,
  },
  {
    id: "eticketing-helpdesk",
    title: "E-Ticketing Helpdesk",
    description:
      "Flutter mobile app with a Go + Supabase backend for IT / service-desk ticketing. Clean architecture, realtime updates, and attachment + comment threads.",
    longDescription:
      "Mobile-first helpdesk ticketing system. Flutter app on the front, Go backend on the back, Supabase as the data and auth layer. Supports the full ticket lifecycle — create, assign, comment, attach files, notify, and resolve — with realtime updates via Supabase channels. The Go backend follows clean architecture (entities / interfaces / usecases / delivery), with Supabase auth middleware, JWT layering, and a typed repository per entity (tiket, komentar, lampiran, notifikasi, pengguna). Ships with a dashboard stats endpoint and per-role flows for staff vs. requesters.",
    tags: [
      "Flutter",
      "Dart",
      "Go",
      "Supabase",
      "PostgreSQL",
      "Mobile App",
      "Realtime",
      "Clean Architecture",
    ],
    image: "url('/images/E-Ticketing_Helpdesk.png') center/cover, #0f172a",
    githubUrl: "https://github.com/ZaganJade/E-Ticketing_Helpdesk-MobileApp",
    featured: true,
    year: 2025,
  },
];
