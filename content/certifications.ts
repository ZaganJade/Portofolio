/**
 * Certifications & credentials catalogue.
 *
 * Edit this file to add / update your certificates. Use `iconSlug`
 * (Simple Icons slug) for brand logos \u2014 same pattern as skills.ts.
 * Credentials without an iconSlug fall back to a monogram tile.
 *
 * This file is for *learning credentials* and *participation certificates*.
 * Competition wins / hackathon placements go in `achievements.ts`.
 */

export type CertificationCategory =
  | "AI / ML"
  | "Cloud"
  | "Frontend"
  | "Backend"
  | "Security"
  | "Design"
  | "Hackathon"
  | "General";

export interface Certification {
  /** Full certification name */
  name: string;
  /** Issuing organization */
  issuer: string;
  /** Year or YYYY-MM issue date */
  issueDate: string;
  /** Optional expiry (e.g. "2027" or "Does not expire") */
  expiresAt?: string;
  /** Optional credential reference number */
  credentialId?: string;
  /** Optional public verify URL */
  verifyUrl?: string;
  /** One-line context */
  description?: string;
  /** Categorization for grouping/filtering */
  category: CertificationCategory;
  /** Simple Icons slug for issuer logo */
  iconSlug?: string;
}

export const certifications: Certification[] = [
  {
    name: "Refactory Hackathon \u2014 Participant",
    issuer: "Refactory",
    issueDate: "2025",
    description:
      "Collaborative hackathon, Universitas Airlangga\u2013Surabaya chapter. Real-world problem solving through teamwork and technical execution.",
    category: "Hackathon",
    verifyUrl: "/Document/Muhammad%20Ikhsanudin%20Arsalan.pdf",
  },
];
