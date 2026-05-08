/**
 * Social links — edit here to update the contact section and footer.
 * `icon` references a lucide-react icon name at the component level.
 */

export type SocialPlatform = "github" | "linkedin" | "twitter" | "email" | "dribbble" | "whatsapp";

export interface Social {
  platform: SocialPlatform;
  label: string;
  url: string;
  handle?: string;
}

/**
 * WhatsApp link is built from the env-configured number so you never
 * have to hardcode your phone number in source control. Falls back to
 * a placeholder if the env var is missing in development.
 */
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281234567890";

export const socials: Social[] = [
  {
    platform: "whatsapp",
    label: "WhatsApp",
    url: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
      "Halo Muhammad, saya lihat portofolio kamu — mau ngobrol terkait project.",
    )}`,
    handle: `+${WA_NUMBER}`,
  },
  {
    platform: "github",
    label: "GitHub",
    url: "https://github.com/ZaganJade",
    handle: "@ZaganJade",
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    url: "https://linkedin.com/in/yourname",
    handle: "/yourname",
  },
  {
    platform: "twitter",
    label: "Twitter",
    url: "https://twitter.com/yourname",
    handle: "@yourname",
  },
  {
    platform: "email",
    label: "Email",
    url: "mailto:hello@yourdomain.dev",
    handle: "hello@yourdomain.dev",
  },
];
