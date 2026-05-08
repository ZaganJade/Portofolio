"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Loader2, Send, Sparkles } from "lucide-react";
import {
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export interface ChatbotCardProps {
  className?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hai 👋 aku Arsa AI — asisten di portofolio Muhammad. Tanya apa aja: skill, project, lomba, atau cara kontak paling cepet.",
};

const QUICK_PROMPTS = [
  "Kerjaan paling keren apa?",
  "Stack AI yang kamu pakai?",
  "Cara kontak WhatsApp?",
  "Apa itu Reviewer Fhua?",
];

// Visual identity \u2014 reused tokens so the card reads as a sibling of
// the Capabilities cards (Web Dev, Mobile, etc.). Indigo family matches
// the AI / Frontend palette used site-wide.
const ACCENT = "129, 140, 248";
const GRADIENT = "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #22d3ee 100%)";
const TAGS = ["MiniMax LLM", "Context-aware", "Private", "Realtime"];

/**
 * ChatbotCard \u2014 built in the "What I Build" capability-card language.
 *
 * Layout mirrors CapabilityCard exactly:
 *   \u2022 Rounded 2rem outer shell with subtle border + blur
 *   \u2022 Cursor-tracked radial spotlight (accent-colored)
 *   \u2022 Oversized gradient glow blob in the top-right corner
 *   \u2022 Animated gradient border on hover
 *   \u2022 Two-column grid: copy on the left, chat surface on the right
 *   \u2022 Number badge, tagline, description, tag row
 *   \u2022 Accent underline bar that grows on hover
 *
 * The right column hosts the live chat interface (message list + input)
 * instead of the decorative numeral + orbital ring that CapabilityCard
 * uses. The chat ui is framed so it reads as "part of the card", not a
 * widget pasted on top.
 */
export function ChatbotCard({ className }: ChatbotCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReduced = useReducedMotion();

  const [spot, setSpot] = useState({ x: 50, y: 50 });
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSpot({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || pending) return;

      setError(null);
      const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: trimmed };
      const next = [...messages, userMsg];
      setMessages(next);
      setDraft("");
      setPending(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next
              .filter((m) => m.id !== "welcome")
              .map(({ role, content }) => ({ role, content })),
          }),
        });
        const data = (await res.json()) as { reply?: string; error?: string };
        if (!res.ok || !data.reply) throw new Error(data.error ?? "Request failed");
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: "assistant", content: data.reply ?? "" },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setPending(false);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [messages, pending],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void send(draft);
  };

  const style: CSSProperties = {
    "--cap-accent": ACCENT,
    "--cap-gradient": GRADIENT,
  } as CSSProperties;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: decorative cursor-spotlight on a card wrapper; actual controls are buttons/inputs
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      role="presentation"
      className={cn(
        "group relative mx-auto w-full overflow-hidden rounded-[2rem] border border-white/10",
        "transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "will-change-transform",
        "bg-[rgba(10,10,12,0.88)] backdrop-blur-xl",
        "shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]",
        "hover:scale-[1.008] hover:border-[rgba(var(--cap-accent),0.4)]",
        "hover:shadow-[0_40px_100px_-30px_rgba(var(--cap-accent),0.45)]",
        className,
      )}
      style={style}
    >
      {/* Cursor-tracked radial spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle 420px at ${spot.x}% ${spot.y}%, rgba(var(--cap-accent), 0.22), transparent 65%)`,
        }}
      />

      {/* Ambient gradient blob top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full opacity-40 blur-[120px] transition-opacity duration-700 group-hover:opacity-70"
        style={{ background: GRADIENT }}
      />

      {/* Fine-grain animated gradient border on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          padding: "1px",
          background: GRADIENT,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Body grid: copy left, chat panel right */}
      <div className="relative z-10 grid gap-6 p-6 sm:p-8 md:grid-cols-[1.1fr_1fr] md:gap-10 md:p-12 lg:p-16">
        {/* Left: copy */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center justify-between gap-4">
            <span
              className="font-mono text-sm tracking-[0.2em]"
              style={{ color: "rgba(var(--cap-accent), 0.9)" }}
            >
              AI / 01
            </span>
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors group-hover:border-[rgba(var(--cap-accent),0.5)]"
              style={{ color: "rgb(var(--cap-accent))" }}
            >
              <Sparkles size={18} strokeWidth={1.75} />
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-semibold leading-[1.1] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
              Talk to <span className="text-gradient">Arsa AI</span>
            </h3>
            <p
              className="font-mono text-xs uppercase tracking-[0.2em] sm:text-sm"
              style={{ color: "rgb(var(--cap-accent))" }}
            >
              Portfolio assistant, always on
            </p>
          </div>

          <p className="max-w-lg text-sm leading-relaxed text-white/80 sm:text-base md:text-lg">
            A lightweight AI that knows my portfolio inside-out. Ask about projects, my stack, the
            fastest way to reach me — or anything you're curious about.
          </p>

          <ul className="mt-auto flex flex-wrap gap-1.5 pt-2 sm:gap-2 sm:pt-4">
            {TAGS.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 text-[11px] font-medium text-white transition-colors group-hover:border-white/30 sm:px-3 sm:py-1 sm:text-xs"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: chat surface */}
        <div className="relative flex min-h-[360px] flex-col">
          {/* Arrow CTA hint (matches CapabilityCard) */}
          <ArrowUpRight
            className="absolute -right-2 -top-2 text-white/30 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/80"
            size={18}
            strokeWidth={1.5}
            aria-hidden="true"
          />

          <div
            className={cn(
              "relative flex min-h-[360px] flex-1 flex-col overflow-hidden rounded-2xl border",
              "border-white/10 bg-black/40 backdrop-blur-md",
            )}
          >
            {/* Terminal-style header strip */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/50 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-400/70" />
                  <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
                </span>
                <span
                  className="ml-2 font-mono text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: "rgb(var(--cap-accent))" }}
                >
                  arsa-ai
                </span>
              </div>
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                live
              </span>
            </div>

            {/* Message list */}
            <div
              ref={listRef}
              className="chat-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4 text-[13px] leading-relaxed text-white/85"
            >
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {pending && (
                <div className="flex items-center gap-2 font-mono text-[11px] text-white/50">
                  <Loader2 size={12} className="animate-spin" />
                  Arsa is thinking…
                </div>
              )}
              {error && (
                <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 font-mono text-[11px] text-rose-200">
                  {error}
                </div>
              )}
            </div>

            {/* Quick prompts visible only before the first user message */}
            {messages.length === 1 && (
              <div className="shrink-0 border-t border-white/10 bg-black/30 px-4 py-3">
                <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">
                  Try asking
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void send(q)}
                      disabled={pending}
                      className={cn(
                        "rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70 transition-colors",
                        "hover:border-[color:rgb(var(--cap-accent))]/50 hover:bg-[rgba(var(--cap-accent),0.1)] hover:text-white",
                        "disabled:opacity-50",
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="shrink-0 border-t border-white/10 bg-black/30 px-3.5 py-3"
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="font-mono text-sm"
                  style={{ color: "rgba(var(--cap-accent), 0.85)" }}
                >
                  ›
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask about projects, skills, contact…"
                  disabled={pending}
                  className="flex-1 bg-transparent font-mono text-[13px] text-white placeholder:text-white/35 focus:outline-none disabled:opacity-60"
                  aria-label="Ask Arsa AI"
                />
                <motion.button
                  type="submit"
                  disabled={pending || !draft.trim()}
                  whileTap={{ scale: 0.94 }}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md border transition-colors",
                    "border-[color:rgb(var(--cap-accent))]/40 bg-[rgba(var(--cap-accent),0.12)]",
                    "text-[rgb(var(--cap-accent))] hover:bg-[rgba(var(--cap-accent),0.22)]",
                    "disabled:opacity-40",
                  )}
                  aria-label="Send message"
                >
                  {pending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Accent underline bar — grows on hover (matches CapabilityCard) */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
        style={{ background: GRADIENT }}
      />

      <style jsx>{`
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

/**
 * Render a simple subset of markdown inline inside a chat bubble:
 *   **bold**, *italic*, `code`, and literal newlines.
 *
 * Kept minimal on purpose — we don't want heavy markdown parsers in
 * a sub-200-char assistant reply. Everything is escaped first, then
 * formatting tokens are applied to plain text, so XSS is not possible.
 */
function renderInline(text: string): ReactNode[] {
  // Split on \n first so paragraphs separate visually
  const lines = text.split(/\n/);
  const output: ReactNode[] = [];
  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) output.push(<br key={`br-${lineIdx}`} />);

    // Tokenize: **bold**, *italic*, `code`
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    const parts = line.split(regex);
    parts.forEach((part, i) => {
      if (!part) return;
      const key = `t-${lineIdx}-${i}`;
      if (part.startsWith("**") && part.endsWith("**")) {
        output.push(
          <strong key={key} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>,
        );
      } else if (
        part.startsWith("*") &&
        part.endsWith("*") &&
        part.length > 2 &&
        !part.startsWith("**")
      ) {
        output.push(
          <em key={key} className="italic text-white/90">
            {part.slice(1, -1)}
          </em>,
        );
      } else if (part.startsWith("`") && part.endsWith("`")) {
        output.push(
          <code
            key={key}
            className="rounded bg-black/40 px-1 py-0.5 font-mono text-[11px] text-[rgb(var(--cap-accent))]"
          >
            {part.slice(1, -1)}
          </code>,
        );
      } else {
        output.push(part);
      }
    });
  });
  return output;
}

/** Chat bubble — user aligned right with accent, assistant left neutral. */
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed",
          isUser
            ? "border border-[rgba(var(--cap-accent),0.3)] bg-[rgba(var(--cap-accent),0.18)] text-white"
            : "border border-white/10 bg-white/5 text-white/85",
        )}
      >
        {isUser ? message.content : renderInline(message.content)}
      </div>
    </motion.div>
  );
}
