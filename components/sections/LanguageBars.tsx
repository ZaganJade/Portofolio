"use client";

import { motion } from "framer-motion";
import type { LanguageBreakdown } from "@/lib/github";

export interface LanguageBarsProps {
  languages: LanguageBreakdown[];
}

export function LanguageBars({ languages }: LanguageBarsProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Single combined bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/5">
        {languages.map((lang, i) => (
          <motion.div
            key={lang.name}
            initial={{ width: 0 }}
            whileInView={{ width: `${lang.percent}%` }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{
              duration: 1,
              delay: 0.1 + i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ backgroundColor: lang.color }}
            className="h-full"
          />
        ))}
      </div>

      {/* Legend */}
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {languages.map((lang, i) => (
          <motion.li
            key={lang.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
            className="flex items-center gap-2 text-sm"
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: lang.color }}
            />
            <span className="text-white/80">{lang.name}</span>
            <span className="font-mono text-xs text-white/40">{lang.percent}%</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
