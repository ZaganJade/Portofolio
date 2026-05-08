# Muhammad Ikhsanudin Arsalan — Portfolio

A cinematic, interactive portfolio for **Muhammad Ikhsanudin Arsalan**. Built with Next.js 15, React 19, Tailwind CSS v4, Framer Motion, GSAP, Lenis, and React Three Fiber.

The site presents projects, capabilities, skills, achievements, experience, GitHub activity, and contact links through a dark, motion-rich interface with 3D hero visuals and smooth section-based navigation.

## Highlights

- **Cinematic hero section** with layered gradient background, animated typography, and delayed 3D scene loading.
- **Smooth navigation** powered by Lenis for polished page transitions.
- **Interactive project cards** with featured project data managed from content files.
- **Capabilities and skills sections** designed as reusable, data-driven components.
- **Achievements and certifications split clearly** between awards and learning credentials.
- **GitHub activity section** for repository and contribution presentation.
- **Responsive dark UI** using Tailwind CSS v4 design tokens and custom utility classes.
- **Performance-conscious 3D loading** to avoid blocking initial page paint.

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 15 App Router |
| Runtime UI | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4, CSS custom properties |
| Animation | Framer Motion, GSAP ScrollTrigger |
| 3D | React Three Fiber, Drei, Three.js |
| Smooth Scroll | Lenis |
| Icons | Lucide React |
| Lint / Format | Biome |
| Deployment Target | Vercel |

## Project Structure

```txt
app/
  layout.tsx              Global app shell and metadata
  page.tsx                Homepage section composition
  globals.css             Design tokens, base styles, custom utilities

components/
  effects/                Motion, scroll, cursor, and reveal helpers
  sections/               Main page sections and section-specific cards
  three/                  Hero 3D scene and character components
  ui/                     Shared UI primitives

content/
  projects.ts             Project catalogue
  capabilities.ts         Service / capability cards
  skills.ts               Skill groups and technology data
  achievements.ts         Awards, wins, placements, recognitions
  certifications.ts       Learning credentials and participation certificates
  experience.ts           Experience timeline data
  socials.ts              Contact and social links

lib/
  constants.ts            Site metadata, section ids, navigation links
  hooks/                  Shared React hooks
  utils.ts                Utility helpers

public/
  images/                 Project images and visual assets
  Document/               Certificates and supporting documents
```

## Main Sections

The homepage is composed in `app/page.tsx` in this order:

1. `Navigation`
2. `Hero`
3. `About`
4. `Capabilities`
5. `Projects`
6. `Skills`
7. `Achievements`
8. `Experience`
9. `GitHubSection`
10. `Contact`

This makes the page easy to scan and easy to modify: section order is controlled from one file, while most displayed content lives in `/content`.

## Editing Content

Most portfolio updates do **not** require editing component code.

### Update personal metadata

Edit:

```txt
lib/constants.ts
```

Useful fields:

- `SITE.fullName`
- `SITE.role`
- `SITE.description`
- `SITE.url`
- `SITE.github`
- `NAV_LINKS`

### Add or edit projects

Edit:

```txt
content/projects.ts
```

Each project supports:

- title and description
- long modal description
- tags
- image or gradient background
- live URL
- GitHub URL
- featured flag
- year

### Add skills, capabilities, experience, and links

Edit the matching file inside `/content`:

```txt
content/capabilities.ts
content/skills.ts
content/experience.ts
content/socials.ts
```

### Add achievements or certificates

Use:

```txt
content/achievements.ts
content/certifications.ts
```

Rule of thumb:

- `achievements.ts` = wins, awards, placements, recognitions
- `certifications.ts` = learning credentials, participation certificates, course certificates

## Local Development

Install dependencies:

```bash
npm install
```

Create local environment file:

```bash
cp .env.example .env.local
```

Set your public site URL:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Run development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Create production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run Biome lint, format, and import checks |
| `npm run format` | Format files with Biome |

## Design System

The visual language is defined in:

```txt
app/globals.css
```

Important pieces:

- `@theme` contains Tailwind v4 design tokens.
- `.text-gradient` applies the signature indigo-to-cyan text treatment.
- `.glass` and `.glass-strong` power translucent cards and overlays.
- `.gradient-mesh` creates the animated background atmosphere.
- Global dark mode and scrollbar styling are applied in the base layer.

## Interaction Notes

The portfolio is designed to feel polished without making the page heavy:

- The hero text animates immediately.
- The 3D scene mounts after a short delay to protect initial load performance.
- Smooth scroll is centralized through `SmoothScrollProvider`.
- Buttons use magnetic hover behavior for a more tactile feel.
- Sections use reveal/stagger helpers to keep motion consistent.

## Deployment

Recommended deployment: **Vercel**.

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set environment variable:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

4. Deploy.

The project is static-friendly and works well with the Next.js App Router deployment flow.

## Maintenance Checklist

Before publishing updates:

```bash
npm run lint
npm run build
```

For content-only edits, verify:

- Project links work.
- Image paths exist in `/public`.
- Long descriptions are not too large for the modal.
- Certificates use correct paths under `/public/Document`.
- `NEXT_PUBLIC_SITE_URL` matches the deployed domain.

## Author

**Muhammad Ikhsanudin Arsalan**

- GitHub: [ZaganJade](https://github.com/ZaganJade)
