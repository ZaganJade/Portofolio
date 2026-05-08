#!/usr/bin/env node
/**
 * Generate a static poster image of the Herta hero scene.
 *
 * Produces an LCP-friendly WebP that Hero.tsx paints instantly while
 * the live Three.js canvas loads in the background. Once the live canvas
 * renders its first frame, Hero.tsx crossfades from poster → live 3D.
 *
 * Usage:
 *   1. Start production server:  npm run build && npm run start
 *   2. Run this script:          node scripts/generate-hero-poster.mjs
 *   3. Output:                   public/images/hero-poster.webp
 *
 * Options:
 *   GEN_URL=...  override capture URL (default http://localhost:3000)
 *   GEN_WAIT=ms  override settle-wait before capture (default 7000)
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public/images/hero-poster.webp");
const URL = process.env.GEN_URL ?? "http://localhost:3000";
const WAIT_MS = Number(process.env.GEN_WAIT ?? 7000);

// Matches Hero.tsx layout + most desktop/laptop viewports.
// deviceScaleFactor:2 produces a 2x image for retina clarity; Next.js
// <Image> will downscale on low-dpi displays.
const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 2 };

mkdirSync(dirname(OUT), { recursive: true });

console.log(`[poster] Launching headless Chrome...`);
const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  console.log(`[poster] Loading ${URL}`);
  await page.goto(URL, { waitUntil: "networkidle0", timeout: 30_000 });

  console.log(`[poster] Waiting ${WAIT_MS}ms for canvas to settle...`);
  await new Promise((r) => setTimeout(r, WAIT_MS));

  // Hide the gradient-mesh background — we only want the 3D character
  // layer as the poster. Hero.tsx keeps the gradient mesh as a separate
  // element so it can animate independently.
  await page.evaluate(() => {
    const mesh = document.querySelector(".gradient-mesh");
    if (mesh instanceof HTMLElement) mesh.style.display = "none";
    const scroll = document.querySelector('[aria-label="Scroll to next section"]');
    if (scroll instanceof HTMLElement) scroll.style.display = "none";
    // Hide all text content so the poster shows ONLY the character layer
    const content = document.querySelector(".relative.z-10");
    if (content instanceof HTMLElement) content.style.visibility = "hidden";
    document.body.style.background = "transparent";
    document.documentElement.style.background = "transparent";
  });

  // Wait one extra paint cycle after DOM mutation
  await new Promise((r) => setTimeout(r, 400));

  console.log(`[poster] Capturing hero section...`);
  const heroSection = await page.$("#hero");
  if (!heroSection) {
    throw new Error("Could not find #hero element on the page");
  }
  const buffer = await heroSection.screenshot({
    type: "webp",
    quality: 86,
    omitBackground: true,
  });

  writeFileSync(OUT, buffer);
  console.log(`[poster] ✓ Wrote ${OUT} (${(buffer.length / 1024).toFixed(1)} KB)`);
} finally {
  await browser.close();
}
