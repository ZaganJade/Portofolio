/**
 * Achievements catalogue — competition wins, awards, notable placements.
 *
 * Distinct from `certifications.ts`: certificates prove *learning*,
 * achievements prove *performance*. Keep competition wins, hackathon
 * placements, olympiads, and industry awards here.
 */

export type AchievementCategory =
  | "Hackathon"
  | "Competition"
  | "Award"
  | "Scholarship"
  | "Recognition";

export type AchievementLevel = "International" | "National" | "Regional" | "University";

export type AchievementPlacement =
  | "1st"
  | "2nd"
  | "3rd"
  | "Finalist"
  | "Semifinalist"
  | "Winner"
  | "Honorable Mention";

export interface Achievement {
  /** Full title of the award / achievement */
  title: string;
  /** Issuing competition, org, or event */
  organizer: string;
  /** Year or YYYY-MM of the win */
  date: string;
  /** Placement / rank — rendered as a prominent badge */
  placement: AchievementPlacement;
  /** Geographic / organizational scope */
  level: AchievementLevel;
  /** One-line context: what the competition was about */
  description?: string;
  /** Category for grouping / color theming */
  category: AchievementCategory;
  /** Optional public link (news article, certificate, winners page) */
  url?: string;
  /** Optional tech / topic tags */
  tags?: string[];
}

/**
 * Real achievements data — sourced from actual certificates in
 * public/Document.
 *
 * NOTE: Participation-only certificates (no placement / ranking) belong
 * in `certifications.ts` under the Skills sub-section, not here. This
 * section is reserved for wins, placements, and recognized honors.
 */
export const achievements: Achievement[] = [];
