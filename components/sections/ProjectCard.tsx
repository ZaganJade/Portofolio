"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { type MouseEvent, useRef, useState } from "react";
import type { Project } from "@/content/projects";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export interface ProjectCardProps {
  project: Project;
  index: number;
  onOpen: (project: Project) => void;
}

export function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  const prefersReduced = useReducedMotion();

  const handleMove = (event: MouseEvent<HTMLButtonElement>) => {
    if (prefersReduced) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const px = (x / rect.width) * 2 - 1;
    const py = (y / rect.height) * 2 - 1;
    setRotation({ x: -py * 8, y: px * 12 });
    setSpotlight({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ perspective: "1200px" }}
    >
      <button
        ref={cardRef}
        type="button"
        onClick={() => onOpen(project)}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        aria-label={`Open ${project.title} details`}
        className={cn(
          "group gradient-border glass relative w-full overflow-hidden rounded-3xl text-left",
          "transition-shadow duration-500 ease-out",
          "hover:shadow-[0_30px_80px_-20px_rgba(99,102,241,0.45)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: "transform 180ms ease-out",
        }}
      >
        {/* Cursor-tracking spotlight overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle 300px at ${spotlight.x}% ${spotlight.y}%, rgba(99,102,241,0.22), transparent 70%)`,
          }}
        />

        {/* Preview image / gradient */}
        <div
          className="relative h-48 w-full overflow-hidden md:h-56"
          style={{ background: project.image }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <ArrowUpRight
            className="absolute right-5 top-5 text-white/70 transition-all duration-500 group-hover:text-white group-hover:-translate-y-1 group-hover:translate-x-1"
            size={22}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-3 p-6 md:p-8">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-white/50">
              {project.year}
            </span>
            {project.featured && (
              <span className="rounded-full bg-[var(--color-accent)]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent-hover)]">
                Featured
              </span>
            )}
          </div>

          <h3 className="text-xl font-semibold text-white md:text-2xl">{project.title}</h3>

          <p className="text-sm leading-relaxed text-white/60 md:text-base">
            {project.description}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {project.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/70"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 4 && (
              <span className="rounded-full px-2.5 py-0.5 text-xs text-white/50">
                +{project.tags.length - 4}
              </span>
            )}
          </div>
        </div>
      </button>
    </motion.div>
  );
}
