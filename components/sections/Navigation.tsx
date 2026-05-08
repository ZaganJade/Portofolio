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
        className="fixed left-0 right-0 top-0 z-50 flex justify-center px-2 pt-2 sm:px-4 sm:pt-4 md:pt-6"
      >
        <nav
          aria-label="Primary"
          className="glass-strong mx-auto flex w-full max-w-5xl items-center justify-between overflow-hidden rounded-full px-3 py-2 sm:gap-2 sm:px-5 sm:py-2.5 md:gap-4 md:px-6 md:py-3"
        >
          {/* Logo */}
          <button
            type="button"
            onClick={() => scrollTo(0)}
            className="min-w-0 shrink truncate text-left font-mono text-xs font-bold tracking-tight text-white sm:text-sm"
          >
            <span>{SITE.author}</span>
            <span className="text-[var(--color-accent)]">.</span>
          </button>

          {/* Desktop nav links */}
          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className={cn(
                    "relative whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors",
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

          {/* Desktop CTA */}
          <button
            type="button"
            onClick={() => handleNavClick("contact")}
            className="hidden whitespace-nowrap rounded-full bg-gradient-signature px-5 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-shadow hover:shadow-[0_0_30px_rgba(99,102,241,0.55)] md:inline-flex"
          >
            Let's talk
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASING.outExpo }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 overflow-y-auto bg-black/95 px-6 py-24 backdrop-blur-xl md:hidden"
          >
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
              }}
              className="flex flex-col items-center gap-5"
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
                      "text-2xl font-semibold transition-colors",
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
