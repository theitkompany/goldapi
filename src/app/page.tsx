"use client";

import Link from "next/link";
import { useState } from "react";

type Tool = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  href: string;
};

const TOOLS: Tool[] = [
  {
    id: "gold",
    title: "Gold Converter",
    description: "Live prices, purity rates and sovereign value",
    category: "Precious Metals",
    icon: "◆",
    href: "/gold-converter",
  },
  {
    id: "currency",
    title: "Currency Converter",
    description: "Convert currencies with up-to-date exchange rates",
    category: "Financial",
    icon: "$",
    href: "/tools/currency-converter",
  },
  {
    id: "metals",
    title: "Silver & Precious Metals",
    description: "Track silver and other precious metal prices",
    category: "Precious Metals",
    icon: "◈",
    href: "/tools/silver-precious-metals",
  },
  {
    id: "interest",
    title: "Interest Calculator",
    description: "Estimate simple and compound interest returns",
    category: "Financial",
    icon: "%",
    href: "/tools/interest-calculator",
  },
  {
    id: "loan",
    title: "Loan & EMI Calculator",
    description: "Plan monthly payments and total loan costs",
    category: "Financial",
    icon: "▣",
    href: "/tools/loan-emi-calculator",
  },
];

function ToolIcon({ icon }: { icon: string }) {
  return <span aria-hidden="true" className="text-xl font-bold text-[#b7f34b]">{icon}</span>;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${filled ? "fill-[#b7f34b] text-[#b7f34b]" : "text-[#7b8493]"}`} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z" />
    </svg>
  );
}

function BottomIcon({ name }: { name: "home" | "categories" | "favorites" | "settings" }) {
  const paths = {
    home: "M3 10.8 12 3l9 7.8v9.2a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.2Z",
    categories: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    favorites: "m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z",
    settings: "M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm8.2-3.2a8.6 8.6 0 0 0-.1-1.2l2-1.55-2-3.46-2.35.95a8.7 8.7 0 0 0-2.05-1.2L15.35 3h-4l-.35 2.54a8.7 8.7 0 0 0-2.05 1.2L6.6 5.79l-2 3.46 2 1.55A8.6 8.6 0 0 0 6.5 12c0 .41.04.81.1 1.2l-2 1.55 2 3.46 2.35-.95c.63.5 1.32.9 2.05 1.2l.35 2.54h4l.35-2.54a8.7 8.7 0 0 0 2.05-1.2l2.35.95 2-3.46-2-1.55c.06-.39.1-.79.1-1.2Z",
  };
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}

export default function HomePage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("Home");
  const visibleTools = activeTab === "Favorites" ? TOOLS.filter((tool) => favorites.includes(tool.id)) : TOOLS;

  const toggleFavorite = (id: string) => {
    setFavorites((current) => current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id]);
  };

  return (
    <main className="min-h-screen bg-[#07090c] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 pb-24 sm:px-8">
        <header className="flex items-center justify-between border-b border-white/[0.08] py-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b7f34b]">Gold API</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Tools &amp; Calculators</h1>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#11151b] text-lg font-bold text-[#b7f34b]">G</div>
        </header>

        <div className="flex items-end justify-between pt-8">
          <div>
            <p className="text-sm text-[#7b8493]">Everything you need,</p>
            <p className="mt-1 text-lg font-semibold">all in one place.</p>
          </div>
          <span className="rounded-full border border-white/10 bg-[#11151b] px-3 py-1.5 text-xs text-[#9ba3af]">{visibleTools.length} tools</span>
        </div>

        <section className="mt-6 space-y-3" aria-label="Available tools">
          {visibleTools.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-14 text-center text-sm text-[#7b8493]">Tap the star on a tool to save it here.</div>
          ) : visibleTools.map((tool) => (
            <div key={tool.id} className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#101318] p-3.5 transition hover:border-[#b7f34b]/40 hover:bg-[#141920]">
              <Link href={tool.href} className="flex min-w-0 flex-1 items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b7f34b]">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#1c331e]"><ToolIcon icon={tool.icon} /></span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-white">{tool.title}</span>
                  <span className="mt-1 block truncate text-sm text-[#7b8493]">{tool.description}</span>
                  <span className="mt-2 inline-flex rounded-md bg-[#1b3020] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#b7f34b]">{tool.category}</span>
                </span>
              </Link>
              <button type="button" onClick={() => toggleFavorite(tool.id)} aria-label={`${favorites.includes(tool.id) ? "Remove" : "Add"} ${tool.title} ${favorites.includes(tool.id) ? "from" : "to"} favorites`} className="rounded-lg p-2 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b7f34b]">
                <StarIcon filled={favorites.includes(tool.id)} />
              </button>
              <Link href={tool.href} aria-label={`Open ${tool.title}`} className="rounded-lg p-2 text-[#7b8493] transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b7f34b]">
                <span aria-hidden="true" className="text-2xl leading-none">›</span>
              </Link>
            </div>
          ))}
        </section>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/[0.08] bg-[#0b0d10]/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl" aria-label="Main navigation">
        <div className="mx-auto grid max-w-2xl grid-cols-4">
          {(["Home", "Categories", "Favorites", "Settings"] as const).map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`flex flex-col items-center gap-1 text-[11px] transition ${activeTab === tab ? "text-[#b7f34b]" : "text-[#697281] hover:text-white"}`}>
              <BottomIcon name={tab.toLowerCase() as "home" | "categories" | "favorites" | "settings"} />
              <span>{tab}</span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
