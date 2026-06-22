"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Github, X } from "lucide-react";
import { useEffect } from "react";
import type { Project } from "@/content/projects";
import { EASING } from "@/lib/constants";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-md"
          onClick={onClose}
          role="presentation"
          data-lenis-prevent
        >
          <motion.article
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.5, ease: EASING.outExpo }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`project-modal-title-${project.id}`}
            className="glass-strong relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close project details"
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <X size={20} />
            </button>

            <div className="overflow-y-auto overscroll-contain">
              <div
                className="aspect-[2/1] w-full shrink-0"
                style={{ background: project.image }}
                aria-hidden="true"
              />

              <div className="flex flex-col gap-6 p-8 md:p-10">
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-white/50">
                    {project.year}
                  </span>
                  <h3
                    id={`project-modal-title-${project.id}`}
                    className="text-3xl font-semibold tracking-tight text-white md:text-4xl"
                  >
                    {project.title}
                  </h3>
                </div>

                <p className="text-base text-white/70 md:text-lg">
                  {project.longDescription ?? project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-signature px-5 py-2 text-sm font-medium text-white transition-shadow hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                    >
                      <ExternalLink size={16} />
                      Live demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                      <Github size={16} />
                      Source code
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
