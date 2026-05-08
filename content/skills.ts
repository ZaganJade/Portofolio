/**
 * Skills catalogue organized by category. Edit to add / remove skills.
 *
 * `iconSlug` is a Simple Icons slug (https://simpleicons.org) used to
 * render the brand logo. Skills without an iconSlug fall back to a
 * 2-letter monogram tile.
 */

export type SkillCategory = "Frontend" | "AI" | "Backend" | "Tools" | "Design";

export interface Skill {
  /** Display name */
  name: string;
  /** Category for grouping */
  category: SkillCategory;
  /** Optional proficiency level (0-100) */
  level?: number;
  /** Simple Icons slug — e.g. "typescript", "react", "nextdotjs" */
  iconSlug?: string;
  /**
   * Fallback Lucide icon name when no Simple Icons brand mark exists.
   * Only used when `iconSlug` is absent. Must match a key in the
   * `LUCIDE_ICON_MAP` inside SkillCard.tsx.
   */
  lucideIcon?: string;
}

export const skillCategories: SkillCategory[] = ["Frontend", "AI", "Backend", "Tools", "Design"];

export const skills: Skill[] = [
  // Frontend
  { name: "TypeScript", category: "Frontend", level: 95, iconSlug: "typescript" },
  { name: "React", category: "Frontend", level: 95, iconSlug: "react" },
  { name: "Next.js", category: "Frontend", level: 92, iconSlug: "nextdotjs" },
  { name: "Vue", category: "Frontend", level: 82, iconSlug: "vuedotjs" },
  { name: "Laravel", category: "Frontend", level: 88, iconSlug: "laravel" },
  { name: "Inertia.js", category: "Frontend", level: 80, iconSlug: "inertia" },
  { name: "Livewire", category: "Frontend", level: 82, iconSlug: "livewire" },
  { name: "Alpine.js", category: "Frontend", level: 80, iconSlug: "alpinedotjs" },
  { name: "Filament", category: "Frontend", level: 78, iconSlug: "filament" },
  { name: "Flutter", category: "Frontend", level: 78, iconSlug: "flutter" },
  { name: "Tailwind CSS", category: "Frontend", level: 95, iconSlug: "tailwindcss" },
  { name: "Three.js", category: "Frontend", level: 80, iconSlug: "threedotjs" },
  { name: "GSAP", category: "Frontend", level: 82, iconSlug: "greensock" },

  // AI / LLMs — conceptual skills use Lucide icons as fallback
  { name: "AI Integration", category: "AI", level: 90, lucideIcon: "Cpu" },
  { name: "Generative AI", category: "AI", level: 88, lucideIcon: "Sparkles" },
  { name: "Prompt Engineering", category: "AI", level: 88, lucideIcon: "MessageSquareCode" },
  { name: "AI Wrapping", category: "AI", level: 85, lucideIcon: "Package2" },
  { name: "AI CLI", category: "AI", level: 85, lucideIcon: "TerminalSquare" },
  { name: "OpenRouter", category: "AI", level: 82, iconSlug: "openrouter" },
  { name: "Gemini API", category: "AI", level: 88, iconSlug: "googlegemini" },
  { name: "OpenAI / GPT", category: "AI", level: 85, iconSlug: "openai" },
  { name: "Claude API", category: "AI", level: 85, iconSlug: "anthropic" },
  { name: "Kimi (Moonshot)", category: "AI", level: 72, lucideIcon: "Moon" },
  { name: "GLM", category: "AI", level: 70, lucideIcon: "Layers" },
  { name: "MiniMax", category: "AI", level: 68, lucideIcon: "Zap" },
  { name: "Vector Embeddings", category: "AI", level: 85, lucideIcon: "Network" },
  { name: "MCP Protocol", category: "AI", level: 80, lucideIcon: "Plug" },
  { name: "LM Studio", category: "AI", level: 75, lucideIcon: "MonitorDot" },

  // Backend
  { name: "Laravel", category: "Backend", level: 88, iconSlug: "laravel" },
  { name: "Node.js", category: "Backend", level: 90, iconSlug: "nodedotjs" },
  { name: "Go", category: "Backend", level: 72, iconSlug: "go" },
  { name: "Python", category: "Backend", level: 75, iconSlug: "python" },
  { name: "PostgreSQL", category: "Backend", level: 85, iconSlug: "postgresql" },
  { name: "MySQL", category: "Backend", level: 85, iconSlug: "mysql" },
  { name: "Supabase", category: "Backend", level: 82, iconSlug: "supabase" },
  { name: "Firebase", category: "Backend", level: 78, iconSlug: "firebase" },
  { name: "Redis", category: "Backend", level: 72, iconSlug: "redis" },

  // Tools
  { name: "Git", category: "Tools", level: 92, iconSlug: "git" },
  { name: "Docker", category: "Tools", level: 82, iconSlug: "docker" },
  { name: "Vercel", category: "Tools", level: 90, iconSlug: "vercel" },
  { name: "GitHub Actions", category: "Tools", level: 85, iconSlug: "githubactions" },
  { name: "Biome", category: "Tools", level: 85, iconSlug: "biome" },
  { name: "Linux", category: "Tools", level: 80, iconSlug: "linux" },
  { name: "WSL", category: "Tools", level: 85, lucideIcon: "TerminalSquare" },
  { name: "cPanel", category: "Tools", level: 78, iconSlug: "cpanel" },
  { name: "aaPanel", category: "Tools", level: 75, lucideIcon: "Server" },
  { name: "pi CLI", category: "Tools", level: 82, lucideIcon: "Terminal" },
  { name: "Antigravity", category: "Tools", level: 70, lucideIcon: "Rocket" },
  { name: "OpenSpec", category: "Tools", level: 78, lucideIcon: "BookMarked" },
  { name: "BMAD", category: "Tools", level: 75, lucideIcon: "Atom" },

  // Design
  { name: "Figma", category: "Design", level: 82, iconSlug: "figma" },
  { name: "Motion Design", category: "Design", level: 78, lucideIcon: "Film" },
  { name: "UI/UX", category: "Design", level: 85, lucideIcon: "Layout" },
  { name: "Design Systems", category: "Design", level: 88, lucideIcon: "Component" },
];
