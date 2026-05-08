/**
 * Live GitHub data fetcher. Runs on the server at build time (SSG) and
 * revalidates every hour. No token required for public data at our scale.
 *
 * Returns `null` for any field that fails — callers should render sensible
 * fallbacks rather than crashing the page.
 */

import { SITE } from "@/lib/constants";

const BASE = "https://api.github.com";
const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
// Cache GitHub responses for 60 seconds. Balances two concerns:
//   • Near-realtime — push a commit, watch portfolio update within a min.
//   • Rate limit safety — authenticated token gives 5000/hr; 60s cache
//     keeps us well under even with many visitors.
// To make it hit the API on every request, set this to 0 (not recommended).
const REVALIDATE_SECONDS = 60;

/** Shape we care about from /users/{user} */
export interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  avatarUrl: string;
  htmlUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  stars: number;
  forks: number;
  watchers: number;
  language: string | null;
  topics: string[];
  updatedAt: string;
  pushedAt: string;
  archived: boolean;
  fork: boolean;
}

export interface LanguageBreakdown {
  /** Language name */
  name: string;
  /** Percentage 0-100 */
  percent: number;
  /** Display color (from GitHub's color scheme) */
  color: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  /** 0–4 matching GitHub's heatmap levels */
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionStats {
  /** All days in the last year, oldest first */
  days: ContributionDay[];
  /** Total contributions in the last year */
  totalLastYear: number;
  /** Current streak (consecutive days ending today with count > 0) */
  currentStreak: number;
  /** Longest streak in the dataset */
  longestStreak: number;
  /** Max daily contribution in the dataset */
  maxDay: number;
}

export interface GitHubSummary {
  profile: GitHubProfile | null;
  repos: GitHubRepo[];
  totalStars: number;
  totalForks: number;
  languages: LanguageBreakdown[];
  contributions: ContributionStats | null;
  /** ISO timestamp of when this summary was fetched */
  fetchedAt: string;
}

/** Minimal language → color map covering the most common languages. */
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  PHP: "#4F5D95",
  Go: "#00ADD8",
  Rust: "#dea584",
  "C#": "#178600",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  Swift: "#F05138",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Elixir: "#6e4a7e",
  Lua: "#000080",
  Zig: "#ec915c",
  Haskell: "#5e5086",
  "Jupyter Notebook": "#DA5B0B",
};

async function gh<T>(path: string, base = BASE): Promise<T | null> {
  try {
    const res = await fetch(`${base}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        // Authenticated requests get higher rate limits (5000/hr vs 60/hr)
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Fetch the user's pinned repositories via GitHub GraphQL.
 * Returns the pinned repo names (e.g. ["Hackathon-ResQ", "Workshop-Laravel"])
 * in the order the user pinned them on their profile.
 *
 * Requires `GITHUB_TOKEN` env var (classic or fine-grained PAT with
 * `public_repo` read scope is enough — no write permissions needed).
 * Returns `null` when the token is missing or the request fails so the
 * caller can fall back to a stars-based sort.
 *
 * Why GraphQL: the REST API has NO endpoint for pinned items. GraphQL's
 * `User.pinnedItems` is the only first-party way to read them.
 */
async function fetchPinnedRepoNames(username: string): Promise<string[] | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const query = `
    query PinnedRepos($login: String!) {
      user(login: $login) {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { login: username } }),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      data?: {
        user?: {
          pinnedItems?: { nodes?: { name?: string }[] };
        };
      };
    };
    const names = data.data?.user?.pinnedItems?.nodes
      ?.map((n) => n.name)
      .filter((n): n is string => typeof n === "string" && n.length > 0);
    return names && names.length > 0 ? names : null;
  } catch {
    return null;
  }
}

/**
 * Fetches contribution calendar data from the jogruber.de proxy
 * (unofficial but stable, scrapes GitHub's public profile page).
 * Returns null on failure so callers can hide the widget.
 */
async function fetchContributions(username: string): Promise<ContributionStats | null> {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as {
      total?: { lastYear?: number };
      contributions?: { date: string; count: number; level: number }[];
    };
    const days: ContributionDay[] = (raw.contributions ?? []).map((d) => ({
      date: d.date,
      count: d.count,
      level: Math.min(4, Math.max(0, d.level)) as 0 | 1 | 2 | 3 | 4,
    }));
    if (days.length === 0) return null;

    // Compute streaks (walk backwards for current streak, scan for longest)
    let currentStreak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      const day = days[i];
      if (!day) break;
      if (day.count > 0) currentStreak++;
      else break;
    }
    let longestStreak = 0;
    let running = 0;
    for (const d of days) {
      if (d.count > 0) {
        running++;
        if (running > longestStreak) longestStreak = running;
      } else {
        running = 0;
      }
    }
    const maxDay = days.reduce((m, d) => (d.count > m ? d.count : m), 0);

    return {
      days,
      totalLastYear: raw.total?.lastYear ?? days.reduce((s, d) => s + d.count, 0),
      currentStreak,
      longestStreak,
      maxDay,
    };
  } catch {
    return null;
  }
}

function mapProfile(raw: Record<string, unknown>): GitHubProfile {
  return {
    login: String(raw.login ?? ""),
    name: (raw.name as string) ?? null,
    bio: (raw.bio as string) ?? null,
    location: (raw.location as string) ?? null,
    company: (raw.company as string) ?? null,
    avatarUrl: String(raw.avatar_url ?? ""),
    htmlUrl: String(raw.html_url ?? ""),
    publicRepos: Number(raw.public_repos ?? 0),
    followers: Number(raw.followers ?? 0),
    following: Number(raw.following ?? 0),
    createdAt: String(raw.created_at ?? ""),
  };
}

function mapRepo(raw: Record<string, unknown>): GitHubRepo {
  return {
    id: Number(raw.id ?? 0),
    name: String(raw.name ?? ""),
    fullName: String(raw.full_name ?? ""),
    description: (raw.description as string) ?? null,
    htmlUrl: String(raw.html_url ?? ""),
    homepage: (raw.homepage as string) ?? null,
    stars: Number(raw.stargazers_count ?? 0),
    forks: Number(raw.forks_count ?? 0),
    watchers: Number(raw.watchers_count ?? 0),
    language: (raw.language as string) ?? null,
    topics: Array.isArray(raw.topics) ? (raw.topics as string[]) : [],
    updatedAt: String(raw.updated_at ?? ""),
    pushedAt: String(raw.pushed_at ?? ""),
    archived: Boolean(raw.archived),
    fork: Boolean(raw.fork),
  };
}

/**
 * Fetches the user's public profile, repos, and derived stats.
 * Returns a best-effort summary — partial data on failure rather than throwing.
 */
export async function getGitHubSummary(username = SITE.github): Promise<GitHubSummary> {
  const [rawProfile, rawRepos, contributions, pinnedNames] = await Promise.all([
    gh<Record<string, unknown>>(`/users/${username}`),
    gh<Record<string, unknown>[]>(`/users/${username}/repos?per_page=100&type=owner&sort=updated`),
    fetchContributions(username),
    fetchPinnedRepoNames(username),
  ]);

  const profile = rawProfile ? mapProfile(rawProfile) : null;
  const allRepos = (rawRepos ?? []).map(mapRepo).filter((r) => !r.fork);

  const totalStars = allRepos.reduce((sum, r) => sum + r.stars, 0);
  const totalForks = allRepos.reduce((sum, r) => sum + r.forks, 0);

  // Language breakdown — counts repos per language (simple, fast, no extra API calls)
  const langCount = new Map<string, number>();
  for (const repo of allRepos) {
    if (!repo.language) continue;
    langCount.set(repo.language, (langCount.get(repo.language) ?? 0) + 1);
  }
  const totalLangs = Array.from(langCount.values()).reduce((s, n) => s + n, 0) || 1;
  const languages: LanguageBreakdown[] = Array.from(langCount.entries())
    .map(([name, count]) => ({
      name,
      percent: Math.round((count / totalLangs) * 1000) / 10,
      color: LANGUAGE_COLORS[name] ?? "#8b5cf6",
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 6);

  // Repo selection strategy:
  //   1. If GraphQL returned pinned repo names → use them in pinned order
  //      (so the portfolio mirrors what the user curated on their profile).
  //   2. Otherwise → fall back to top-by-stars, then most-recently-pushed.
  //
  // This means re-pinning on GitHub automatically updates the portfolio
  // on the next ISR revalidation (every ~1 hour) with no code changes.
  let topRepos: GitHubRepo[];
  if (pinnedNames && pinnedNames.length > 0) {
    const repoByName = new Map(allRepos.map((r) => [r.name, r]));
    topRepos = pinnedNames
      .map((n) => repoByName.get(n))
      .filter((r): r is GitHubRepo => r !== undefined);
  } else {
    topRepos = [...allRepos]
      .sort((a, b) => {
        if (b.stars !== a.stars) return b.stars - a.stars;
        return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
      })
      .slice(0, 6);
  }

  return {
    profile,
    repos: topRepos,
    totalStars,
    totalForks,
    languages,
    contributions,
    fetchedAt: new Date().toISOString(),
  };
}
