"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import ThemeToggle from "@/components/ThemeToggle";

type ToolShellProps = {
  brand?: string;
  subtitle: string;
  accent?: "green" | "gold";
  children: ReactNode;
};

export default function ToolShell({
  brand = "Golden API",
  subtitle,
  accent = "green",
  children,
}: ToolShellProps) {
  const accentText = accent === "gold" ? "text-[#d4af37]" : "text-accent-primary";
  const backRing =
    accent === "gold"
      ? "text-[#d4af37] shadow-[inset_0_0_0_1px_rgba(212,175,55,0.22)]"
      : "text-accent-primary shadow-[inset_0_0_0_1px_rgba(183,243,75,0.22)]";

  return (
    <main className="relative min-h-screen overflow-hidden text-foreground">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[980px] flex-col justify-start px-3 py-3 sm:px-6 sm:pt-10 sm:pb-12 lg:pt-12">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="glass-header sticky top-2 z-20 mb-4 rounded-2xl sm:rounded-[24px] px-3.5 py-2.5 sm:px-5 sm:py-3.5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/"
                aria-label="Back to all tools"
                className={`glass-back-btn flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl text-base font-semibold transition ${backRing}`}
              >
                ←
              </Link>
              <div className="min-w-0">
                <p className={`text-[10px] uppercase tracking-[0.3em] sm:text-xs ${accentText}`}>{brand}</p>
                <p className="truncate text-xs sm:text-sm font-semibold text-foreground">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
              <Link
                href="/"
                className="theme-toggle-btn hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition"
              >
                All tools
              </Link>
            </div>
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="glass-card rounded-2xl sm:rounded-[28px] p-4 sm:p-7"
        >
          {children}
        </motion.section>
      </div>
    </main>
  );
}
