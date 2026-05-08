"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import type { ContributionStats } from "@/lib/github";
import { cn } from "@/lib/utils";

export interface ContributionGraphProps {
  stats: ContributionStats;
}
const LEVEL_COLORS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "rgba(255,255,255,0.04)",
  1: "rgba(99,102,241,0.35)",
  2: "rgba(99,102,241,0.6)",
  3: "rgba(129,140,248,0.85)",
  4: "rgba(34,211,238,1)",
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Renders the contribution calendar as a GitHub-style heatmap —
 * 7 rows (weekdays) × ~53 columns (weeks). Fades each cell in on scroll.
 */
export function ContributionGraph({ stats }: ContributionGraphProps) {
  // Bucket the days into weeks of 7, anchored so the last column ends today
  const weeks = useMemo(() => {
    const firstDay = stats.days[0];
    if (!firstDay) return [];
    const startOffset = new Date(firstDay.date).getUTCDay(); // 0 = Sun
    const padded = [...Array(startOffset).fill(null), ...stats.days];
    const result: ((typeof stats.days)[number] | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      result.push(padded.slice(i, i + 7));
    }
    return result;
  }, [stats.days]);

  // Month labels: emit at the column where each month first appears
  const monthLabels = useMemo(() => {
    const labels: { week: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIdx) => {
      const firstWithDate = week.find((d) => d !== null);
      if (!firstWithDate) return;
      const month = new Date(firstWithDate.date).getUTCMonth();
      if (month !== lastMonth) {
        labels.push({ week: weekIdx, label: MONTH_LABELS[month] ?? "" });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div className="flex flex-col gap-3">
      {/* Month labels */}
      <div className="relative hidden h-4 pl-8 sm:block">
        {monthLabels.map(({ week, label }) => (
          <span
            key={`${week}-${label}`}
            className="absolute font-mono text-[10px] uppercase tracking-wider text-white/40"
            style={{ left: `calc(${(week / weeks.length) * 100}% + 2rem)` }}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        {/* Weekday labels */}
        <div className="hidden flex-col gap-[3px] sm:flex">
          {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
            <span
              key={`${d}-${i}`}
              className="flex h-[11px] items-center font-mono text-[10px] uppercase tracking-wider text-white/30"
              style={{ width: "1.5rem" }}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Heatmap grid — single motion wrapper that reveals the whole grid at once */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid w-full flex-1 gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
        >
          {weeks.map((week, weekIdx) => (
            <div
              key={`w-${weekIdx}-${week[0]?.date ?? "pad"}`}
              className="grid grid-rows-7 gap-[3px]"
            >
              {week.map((day, dayIdx) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${weekIdx}-${dayIdx}`}
                      className="aspect-square w-full rounded-[2px]"
                    />
                  );
                }
                const tip = `${day.count} contribution${day.count === 1 ? "" : "s"} on ${formatDate(day.date)}`;
                return (
                  <div
                    key={day.date}
                    title={tip}
                    className={cn(
                      "aspect-square w-full rounded-[2px] transition-[box-shadow] duration-200",
                      "hover:ring-1 hover:ring-white/40",
                    )}
                    style={{
                      backgroundColor: LEVEL_COLORS[day.level],
                      boxShadow: day.level >= 3 ? `0 0 6px ${LEVEL_COLORS[day.level]}` : "none",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pl-0 sm:pl-8">
        <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
          {stats.totalLastYear.toLocaleString()} contributions in the last year
        </span>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white/40">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <span
              key={lvl}
              className="h-3 w-3 rounded-[2px]"
              style={{ backgroundColor: LEVEL_COLORS[lvl as 0 | 1 | 2 | 3 | 4] }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
