#!/usr/bin/env node
/**
 * Minimal Lighthouse runner: scores only, no HTML report.
 * Usage: node scripts/lighthouse-audit.mjs
 */

import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const URL = "http://localhost:3000";

const chrome = await launch({
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

try {
  const result = await lighthouse(URL, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    formFactor: "desktop",
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
  });

  const categories = result.lhr.categories;
  const audits = result.lhr.audits;

  console.log("\n=== Lighthouse (desktop) ===\n");
  for (const key of ["performance", "accessibility", "best-practices", "seo"]) {
    const cat = categories[key];
    const score = Math.round(cat.score * 100);
    const mark = score >= 90 ? "✓" : score >= 75 ? "~" : "✗";
    console.log(`${mark} ${cat.title.padEnd(16)} ${score}`);
  }

  console.log("\n=== Core Web Vitals ===\n");
  const vitals = {
    "first-contentful-paint": "FCP",
    "largest-contentful-paint": "LCP",
    "total-blocking-time": "TBT",
    "cumulative-layout-shift": "CLS",
    "speed-index": "SI",
    interactive: "TTI",
  };
  for (const [auditId, label] of Object.entries(vitals)) {
    const a = audits[auditId];
    if (a) console.log(`${label.padEnd(6)} ${a.displayValue ?? "n/a"}`);
  }

  console.log("\n=== A11y & Best-Practice issues (if any) ===\n");
  const problems = [];
  for (const key of ["accessibility", "best-practices"]) {
    for (const auditRef of categories[key].auditRefs) {
      const a = audits[auditRef.id];
      if (a && a.score !== null && a.score < 1) {
        problems.push(`  [${key}] ${a.title}`);
      }
    }
  }
  if (problems.length === 0) console.log("  (none)");
  else console.log(problems.join("\n"));
  console.log();
} finally {
  await chrome.kill();
}
