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
    id: "hermes-panel",
    title: "Hermes Panel — VPS Control Panel",
    description:
      "A self-hosted control panel for running multiple Laravel projects on a headless VPS. Database manager, file browser, sandboxed terminal, and live host monitoring — one quiet cockpit instead of a dozen SSH tabs.",
    longDescription:
      "Hermes Panel is a lightweight web layer over a headless VPS, built for the developer who runs their own box and juggles two or three Laravel projects side by side. It auto-discovers Laravel apps under a managed folder and makes the active project drive every module: a multi-connection database manager (browse, inline-edit, paginate, raw SQL editor with history, soft-delete trash with restore, JSON/CSV export); a sandboxed file manager with inline editor, drag-and-drop upload, zip download, and strict path-traversal protection; a built-in web terminal scoped to the project with a command policy that blocks interactive and chained commands; and Laravel tooling for artisan, queues, logs, seeders, Composer, and NPM. The terminal is being upgraded to async streaming over Laravel Reverb WebSockets (v3.1), and a built-in VPS monitor (v3.2) samples CPU, memory, disk, network, services, and ports every five seconds with threshold alerts. Security is defense-in-depth: an auth chain — session login, header password, and WhatsApp-sender header — is enforced by default, and the panel refuses to boot in production if auth is disabled without an explicit dev-bypass. Ships as a single supervisord-managed Docker image (PHP-FPM + Nginx), with a Blade + Alpine.js UI, Tailwind CSS v4, and an editorial dark theme with copper accents.",
    tags: [
      "Laravel",
      "PHP",
      "Docker",
      "Alpine.js",
      "Tailwind CSS",
      "Laravel Reverb",
      "WebSockets",
      "VPS",
    ],
    image: "url('/images/Server%20Hermes-Panel.png') center/cover, #0f172a",
    liveUrl: "https://hermes-panel.vibedev.web.id/",
    githubUrl: "https://github.com/ZaganJade/Server_Hermes-Panel",
    featured: true,
    year: 2026,
  },
  {
    id: "desakta",
    title: "DESAKTA — Village Letter & E-Archive System",
    description:
      "A digital service platform that replaces the manual letter-request flow at a village office. Residents apply online, officials verify and issue signed PDF letters with QR codes, and every archive is managed automatically with a full audit trail.",
    longDescription:
      "DESAKTA is a digital administration system for Desa Kedungbako, Kabupaten Pasuruan, built to remove the queues and paperwork of requesting official letters at the village office. It splits into three access-separated portals: a public landing page with live village statistics and the active letter catalogue; a resident portal where citizens register or claim an admin-created account via WhatsApp OTP, log in with either their NIK or WhatsApp number, fill a dynamic per-letter form, upload supporting documents, and draw a digital signature on canvas; and an admin console where officials verify requests, generate the final PDF (template-filled, with the resident's signature and a validation QR code), and manage residents, the 10-type letter catalogue, and PDF templates with automatic form-field detection. Superadmins manage admin accounts and review resident password-reset tickets. Every meaningful action is written to an immutable activity log, and a scheduled monthly retention sweep purges physical files older than a year while keeping the database history intact for audit. The codebase is layered Clean Architecture — Domain, Application (use cases + ports), Infrastructure (Eloquent repositories, PDF, storage, OTP adapters), and Interfaces — with the dependency rule enforced automatically by an architecture test in CI, plus dual authentication guards for admins and residents.",
    tags: [
      "Laravel",
      "Vue 3",
      "Inertia.js",
      "Tailwind CSS",
      "MySQL",
      "Clean Architecture",
      "PDF",
      "WhatsApp OTP",
    ],
    image: "url('/images/Desakta.png') center/cover, #0f172a",
    liveUrl: "https://desakta.vibedev.web.id/",
    featured: true,
    year: 2026,
  },
  {
    id: "reviewer-fhua",
    title: "Reviewer Fhua",
    description:
      "AI-powered academic reviewer matching for legal journals. Semantic embeddings pick the right reviewer for every manuscript — not just keyword guesses.",
    longDescription:
      "Built for Fakultas Hukum Universitas Airlangga to find the perfect peer reviewer for every journal submission. The system converts manuscript abstracts and reviewer profiles into vector embeddings via Google Gemini's text-embedding-004, then ranks candidates by cosine similarity. Gemini 2.0 Flash explains why each top reviewer fits, and Fonnte's WhatsApp API lets editors reach out in one click. Supports three Airlangga law journals (Yuridika, Notaire, Jurist-Diction), six legal expertise areas, a reviewer verification workflow, and an embeddable registration form that drops into WordPress via iframe.",
    tags: ["Laravel", "Gemini AI", "Embeddings", "Cosine Similarity", "Fonnte API", "WhatsApp"],
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
    year: 2026,
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
    year: 2026,
  },
];
