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
  /** Number of public repositories the user has forked from others */
  forkedRepos: number;
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

/** GitHub GraphQL contributionLevel enum → our 0–4 heatmap levels. */
const CONTRIBUTION_LEVELS: Record<string, 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

/**
 * Derive streak + max-day stats from a day series (oldest first) and wrap it
 * into a ContributionStats. Shared by both the GraphQL and proxy fetchers so
 * the numbers are computed identically regardless of source.
 */
function buildContributionStats(days: ContributionDay[], total: number): ContributionStats {
  // Current streak: walk backwards from today until the first zero day.
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];
    if (!day) break;
    if (day.count > 0) currentStreak++;
    else break;
  }
  // Longest streak: scan forward tracking the running run length.
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
  return { days, totalLastYear: total, currentStreak, longestStreak, maxDay };
}

/**
 * Official source: GitHub's GraphQL `contributionsCollection`. Queried with the
 * user's OWN token, the calendar includes private/restricted contributions, so
 * the total matches the "N contributions in the last year" GitHub shows the
 * signed-in user on github.com. (The public scraper proxy below only ever sees
 * public contributions, which is why it undercounts.)
 *
 * Returns `null` when the token is missing or the request fails, so the caller
 * can fall back to the proxy.
 */
async function fetchContributionsGraphQL(username: string): Promise<ContributionStats | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const query = `
    query Contributions($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
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
          contributionsCollection?: {
            contributionCalendar?: {
              totalContributions?: number;
              weeks?: {
                contributionDays?: {
                  date: string;
                  contributionCount: number;
                  contributionLevel: string;
                }[];
              }[];
            };
          };
        };
      };
    };
    const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar?.weeks) return null;
    const days: ContributionDay[] = calendar.weeks
      .flatMap((w) => w.contributionDays ?? [])
      .map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: CONTRIBUTION_LEVELS[d.contributionLevel] ?? 0,
      }));
    if (days.length === 0) return null;
    const total = calendar.totalContributions ?? days.reduce((s, d) => s + d.count, 0);
    return buildContributionStats(days, total);
  } catch {
    return null;
  }
}

/**
 * Fallback source: the jogruber.de proxy, which scrapes the PUBLIC profile page
 * and therefore counts public contributions only. Used when no GITHUB_TOKEN is
 * configured (e.g. local dev without secrets).
 */
async function fetchContributionsProxy(username: string): Promise<ContributionStats | null> {
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
    const total = raw.total?.lastYear ?? days.reduce((s, d) => s + d.count, 0);
    return buildContributionStats(days, total);
  } catch {
    return null;
  }
}

/**
 * Contribution calendar for the last year. Prefers the official GraphQL API
 * (matches github.com, includes private contributions) and falls back to the
 * public scraper proxy when no token is configured. Returns `null` only if both
 * sources fail, so the caller can hide the widget.
 */
async function fetchContributions(username: string): Promise<ContributionStats | null> {
  return (await fetchContributionsGraphQL(username)) ?? (await fetchContributionsProxy(username));
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
 * Lightweight fetch of just the public-repo count (for the Experience stats).
 * Reuses the same cached `/users/{username}` request as `getGitHubSummary`, so
 * it adds no extra network round-trip. Returns `null` on failure so the caller
 * can omit the stat rather than render a misleading 0.
 */
export async function getPublicRepoCount(username = SITE.github): Promise<number | null> {
  const raw = await gh<Record<string, unknown>>(`/users/${username}`);
  if (!raw) return null;
  return Number(raw.public_repos ?? 0);
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
  const mappedRepos = (rawRepos ?? []).map(mapRepo);
  const allRepos = mappedRepos.filter((r) => !r.fork);

  const totalStars = allRepos.reduce((sum, r) => sum + r.stars, 0);
  // Count repos the USER has forked (their activity), not forks their own repos
  // received from others (which is typically 0). The forked repos are excluded
  // from `allRepos` above, so count them from the full mapped list.
  const forkedRepos = mappedRepos.filter((r) => r.fork).length;

  // Language breakdown — counts repos per language (simple, fast, no extra API calls)
  const langCount = new Map<string, number>();
  for (const repo of allRepos) {
    if (!repo.language) continue;
    langCount.set(repo.language, (langCount.get(repo.language) ?? 0) + 1);
  }
  const totalLangs = Array.from(langCount.values()).reduce((s, n) => s + n, 0) || 1;
  const rankedLangs: LanguageBreakdown[] = Array.from(langCount.entries())
    .map(([name, count]) => ({
      name,
      percent: Math.round((count / totalLangs) * 1000) / 10,
      color: LANGUAGE_COLORS[name] ?? "#8b5cf6",
    }))
    .sort((a, b) => b.percent - a.percent);

  const languages: LanguageBreakdown[] = rankedLangs.slice(0, 6);
  // The top 6 are computed as a share of ALL languages, so when more than 6
  // exist they sum to <100% and leave a gap at the end of the bar. Append an
  // "Other" segment for the remaining share so the bar fills its full width
  // without misrepresenting the individual language percentages.
  if (rankedLangs.length > languages.length) {
    const shown = languages.reduce((sum, l) => sum + l.percent, 0);
    const otherPercent = Math.round((100 - shown) * 10) / 10;
    if (otherPercent > 0) {
      languages.push({ name: "Other", percent: otherPercent, color: "#6b7280" });
    }
  }

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
    forkedRepos,
    languages,
    contributions,
    fetchedAt: new Date().toISOString(),
  };
}
