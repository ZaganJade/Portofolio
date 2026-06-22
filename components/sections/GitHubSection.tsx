import { ExternalLink, Flame, GitFork, Github, MapPin, Trophy, Users } from "lucide-react";
import Image from "next/image";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { ContributionGraph } from "@/components/sections/ContributionGraph";
import { GitHubRepoCard } from "@/components/sections/GitHubRepoCard";
import { LanguageBars } from "@/components/sections/LanguageBars";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Counter } from "@/components/ui/Counter";
import { Section } from "@/components/ui/Section";
import { SECTIONS } from "@/lib/constants";
import { getGitHubSummary } from "@/lib/github";

// Next.js ISR: re-render this server component at most every 60s.
// Matches REVALIDATE_SECONDS in lib/github.ts so the whole stack
// (profile, repos, languages, contributions, pinned) stays in sync.
export const revalidate = 60;

/**
 * Format an ISO timestamp as a relative "X ago" string for the
 * "last synced" badge. Server-rendered, so it reflects the moment
 * the data was fetched, not the moment the user loads the page.
 */
function formatSyncedAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const secs = Math.max(0, Math.round((now - then) / 1000));
  if (secs < 60) return `just now`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export async function GitHubSection() {
  const summary = await getGitHubSummary();

  // Graceful fallback — render nothing if the API was unreachable
  // (keeps the page structure intact without broken UI)
  if (!summary.profile) return null;

  const { profile, repos, totalStars, forkedRepos, languages, contributions, fetchedAt } = summary;
  const syncedAgo = formatSyncedAgo(fetchedAt);

  return (
    <Section id={SECTIONS.github} className="relative overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-[var(--color-accent)]/15 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-40 bottom-1/3 h-96 w-96 rounded-full bg-[var(--color-accent-2)]/15 blur-[120px]"
      />

      <div className="relative flex flex-col gap-6">
        <ScrollReveal>
          {/* Live broadcast signal marker */}
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
            </span>
            <span className="text-emerald-300">Live</span>
            <span className="text-white/20">│</span>
            <span className="text-white/60">Transmitting</span>
            <span className="ml-2 hidden h-px w-20 bg-gradient-to-r from-emerald-400/60 to-transparent md:block" />
            <span className="hidden text-[10px] text-white/30 md:inline">
              06 · open source · synced {syncedAgo}
            </span>
          </div>
        </ScrollReveal>

        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            <AnimatedText text="Public work on" as="span" mode="words" stagger={0.06} />{" "}
            <span className="text-gradient">
              <AnimatedText text="GitHub" as="span" mode="chars" stagger={0.04} delay={0.3} />
            </span>
          </h2>
          <ScrollReveal delay={0.3}>
            <a
              href={profile.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[var(--color-accent)]/50 hover:bg-white/10 hover:text-white"
            >
              <Github size={16} />
              View profile
              <ExternalLink size={14} />
            </a>
          </ScrollReveal>
        </div>
      </div>

      {/* Profile card */}
      <ScrollReveal delay={0.2}>
        <div className="mt-12 flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md md:flex-row md:items-center md:p-8">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 md:h-28 md:w-28">
            <Image
              src={profile.avatarUrl}
              alt={`${profile.login} avatar`}
              fill
              sizes="112px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="text-2xl font-semibold text-white md:text-3xl">
                {profile.name ?? profile.login}
              </h3>
              <span className="font-mono text-sm text-white/50">@{profile.login}</span>
            </div>
            {profile.bio && (
              <p className="max-w-xl text-sm text-white/70 md:text-base">{profile.bio}</p>
            )}
            <div className="mt-1 flex flex-wrap gap-4 text-xs text-white/50">
              {profile.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={12} />
                  {profile.location}
                </span>
              )}
              {profile.company && (
                <span className="inline-flex items-center gap-1.5">
                  <Users size={12} />
                  {profile.company}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-2)] shadow-[0_0_8px_var(--color-accent-2)]" />
                Active since {new Date(profile.createdAt).getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Stats grid */}
      <ScrollReveal delay={0.4}>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Public Repos" value={profile.publicRepos} />
          <StatCard label="Total Stars" value={totalStars} />
          <StatCard
            label="Followers"
            value={profile.followers}
            icon={<Users size={14} className="text-white/40" />}
          />
          <StatCard
            label="Forked Repos"
            value={forkedRepos}
            icon={<GitFork size={14} className="text-white/40" />}
          />
        </div>
      </ScrollReveal>

      {/* Contribution graph */}
      {contributions && (
        <ScrollReveal delay={0.45}>
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md md:p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h4 className="font-mono text-xs uppercase tracking-wider text-white/60">
                  Contribution activity
                </h4>
                <span className="text-2xl font-semibold text-white md:text-3xl">
                  <Counter value={contributions.totalLastYear} />{" "}
                  <span className="text-base font-normal text-white/50">in the last year</span>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/80">
                  <Flame size={13} className="text-[var(--color-accent-2)]" />
                  <span className="font-mono tabular-nums">{contributions.currentStreak}d</span>
                  <span className="text-white/50">current</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/80">
                  <Trophy size={13} className="text-[var(--color-accent-hover)]" />
                  <span className="font-mono tabular-nums">{contributions.longestStreak}d</span>
                  <span className="text-white/50">longest</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/80">
                  <span className="font-mono tabular-nums">{contributions.maxDay}</span>
                  <span className="text-white/50">max day</span>
                </span>
              </div>
            </div>
            <ContributionGraph stats={contributions} />
          </div>
        </ScrollReveal>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <ScrollReveal delay={0.5}>
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md md:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h4 className="font-mono text-xs uppercase tracking-wider text-white/60">
                Languages
              </h4>
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/30">
                By bytes across all public repos
              </span>
            </div>
            <LanguageBars languages={languages} />
          </div>
        </ScrollReveal>
      )}

      {/* Top repositories */}
      {repos.length > 0 && (
        <div className="mt-10">
          <ScrollReveal delay={0.5}>
            <div className="mb-5 flex items-center justify-between">
              <h4 className="font-mono text-xs uppercase tracking-wider text-white/60">
                Top repositories
              </h4>
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/30">
                Live from github.com
              </span>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {repos.map((repo, i) => (
              <GitHubRepoCard key={repo.id} repo={repo} index={i} />
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="gradient-border glass flex flex-col gap-2 rounded-2xl p-5">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs uppercase tracking-wider text-white/50">{label}</span>
      </div>
      <Counter value={value} className="text-3xl font-semibold text-white md:text-4xl" />
    </div>
  );
}
