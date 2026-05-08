"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useSmoothScroll } from "@/components/effects/SmoothScrollProvider";
import { EASING, NAV_LINKS, SITE } from "@/lib/constants";
import { useActiveSection } from "@/lib/hooks/useActiveSection";
import { useScrollDirection } from "@/lib/hooks/useScrollDirection";
import { cn } from "@/lib/utils";

export function Navigation() {
  const scrollDir = useScrollDirection(12);
  const active = useActiveSection();
  const { scrollTo } = useSmoothScroll();
  const [mobileOpen, setMobileOpen] = useState(false);

  const hidden = scrollDir === "down" && !mobileOpen;

  const handleNavClick = (id: string) => {
    setMobileOpen(false);
    const target = document.getElementById(id);
    if (target) scrollTo(target, { offset: -80 });
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.5, ease: EASING.outExpo }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-2 pt-2 sm:px-4 sm:pt-4 md:pt-6"
      >
        <nav
          aria-label="Primary"
          className="glass-strong flex w-full max-w-5xl items-center justify-between gap-1 rounded-full px-2.5 py-2 sm:gap-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3"
        >
          <button
            type="button"
            onClick={() => scrollTo(0)}
            className="shrink-0 truncate text-left font-mono text-xs font-semibold tracking-tight text-white transition-colors hover:text-[var(--color-accent-hover)] sm:text-sm"
          >
            <span className="sm:hidden">
              {(SITE.author.split(" ")[0] ?? SITE.author).slice(0, 12)}
            </span>
            <span className="hidden sm:inline">{SITE.author}</span>
            <span className="text-[var(--color-accent)]">.</span>
          </button>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active === link.id ? "text-white" : "text-white/60 hover:text-white",
                  )}
                >
                  {active === link.id && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => handleNavClick("contact")}
            className="hidden rounded-full bg-gradient-signature px-5 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-shadow hover:shadow-[0_0_30px_rgba(99,102,241,0.55)] md:inline-flex"
          >
            Let's talk
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 md:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASING.outExpo }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 overflow-y-auto bg-[var(--color-bg)]/95 px-6 py-24 backdrop-blur-xl md:hidden"
          >
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
              }}
              className="flex flex-col items-center gap-4 sm:gap-6"
            >
              {NAV_LINKS.map((link) => (
                <motion.li
                  key={link.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: EASING.outExpo },
                    },
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleNavClick(link.id)}
                    className={cn(
                      "text-2xl font-semibold transition-colors sm:text-3xl",
                      active === link.id ? "text-gradient" : "text-white/70 hover:text-white",
                    )}
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
              <motion.li
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: EASING.outExpo },
                  },
                }}
                className="mt-4"
              >
                <button
                  type="button"
                  onClick={() => handleNavClick("contact")}
                  className="rounded-full bg-gradient-signature px-6 py-3 text-base font-medium text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]"
                >
                  Let's talk
                </button>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
