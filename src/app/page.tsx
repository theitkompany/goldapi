"use client";

import Link from "next/link";
import { useState } from "react";
import Dock from "@/components/Dock";
import ParticleSphere from "@/components/ParticleSphere";

const UPI_ID = "saveen.salah@federal";

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
  {
    id: "unit",
    title: "Unit Converter",
    description: "Quickly convert common weights and measurements",
    category: "Utilities",
    icon: "↔",
    href: "/tools/unit-converter",
  },
];

function ToolIcon({ icon }: { icon: string }) {
  return <span aria-hidden="true" className="text-xl font-bold text-[#b7f34b]">{icon}</span>;
}

function NavigationIcon({ name }: { name: "home" | "upi" | "about" }) {
  const paths = {
    home: "M3 10.8 12 3l9 7.8v9.2a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.2Z",
    upi: "M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 4h8M8 12h8M8 16h4",
    about: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-10v6m0-9h.01",
  };
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Home");
  const [amount, setAmount] = useState("");

  const upiLink = `upi://pay?${new URLSearchParams({
    pa: UPI_ID,
    pn: "Golden API",
    cu: "INR",
    ...(amount && Number(amount) > 0 ? { am: amount } : {}),
  }).toString()}`;

  return (
    <main className="min-h-screen bg-[#07090c] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-24 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/[0.08] py-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b7f34b]">Golden API</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Simple Tools. Instant Conversions.</h1>
          </div>
        </header>

        <section className="relative mt-6 min-h-[250px] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#05070d] px-6 py-8 sm:min-h-[300px] sm:px-10 lg:min-h-[340px]" aria-labelledby="hero-title">
          <div className="relative z-10 flex max-w-md flex-col justify-center sm:min-h-[250px] lg:min-h-[290px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b7f34b]">Live market toolkit</p>
            <h2 id="hero-title" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Make every number count.</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#9ba3af]">Explore fast, focused tools for precious metals, money, and everyday calculations.</p>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-[-4%] w-[62%] min-w-[270px] sm:right-[2%] sm:w-[52%] lg:right-[5%] lg:w-[42%]">
            <ParticleSphere />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_50%,rgba(255,255,255,0.08),transparent_32%),linear-gradient(90deg,#05070d_8%,rgba(5,7,13,0.84)_38%,transparent_78%)]" />
        </section>

        <div className="flex items-end justify-between pt-8">
          <div>
            <p className="text-sm text-[#7b8493]">Everything you need,</p>
            <p className="mt-1 text-lg font-semibold">{activeTab === "Home" ? "all in one place." : activeTab === "UPI" ? "Pay securely with UPI." : "Built for simple, useful conversions."}</p>
          </div>
          {activeTab === "Home" ? <span className="rounded-full border border-white/10 bg-[#11151b] px-3 py-1.5 text-xs text-[#9ba3af]">{TOOLS.length} tools</span> : null}
        </div>

        {activeTab === "Home" ? <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Available tools">
          {TOOLS.map((tool) => (
            <div key={tool.id} className="group flex min-h-[190px] items-start gap-3 rounded-2xl border border-white/[0.08] bg-[#101318] p-5 transition hover:border-[#b7f34b]/40 hover:bg-[#141920] light:border-black/10 light:bg-white light:hover:bg-[#fbfcfd]">
              <Link href={tool.href} className="flex min-w-0 flex-1 items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b7f34b]">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#1c331e] light:bg-[#e9f5dc]"><ToolIcon icon={tool.icon} /></span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-white">{tool.title}</span>
                  <span className="mt-1 block truncate text-sm text-[#7b8493]">{tool.description}</span>
                  <span className="mt-2 inline-flex rounded-md bg-[#1b3020] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#b7f34b]">{tool.category}</span>
                </span>
              </Link>
              <Link href={tool.href} aria-label={`Open ${tool.title}`} className="rounded-lg p-2 text-[#7b8493] transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b7f34b]">
                <span aria-hidden="true" className="text-2xl leading-none">›</span>
              </Link>
            </div>
          ))}
        </section> : activeTab === "UPI" ? (
          <section className="mx-auto mt-8 w-full max-w-xl rounded-3xl border border-white/[0.08] bg-[#101318] p-6 sm:p-8" aria-labelledby="upi-title">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1c331e] text-xl font-bold text-[#b7f34b]">₹</div>
            <h2 id="upi-title" className="mt-5 text-2xl font-bold">Pay via UPI</h2>
            <p className="mt-2 text-sm leading-6 text-[#7b8493]">Open your preferred UPI app and pay directly. You do not need to copy the UPI ID.</p>
            <p className="mt-5 rounded-xl border border-white/10 bg-[#0b0d10] px-4 py-3 font-mono text-sm text-[#b7f34b]">{UPI_ID}</p>
            <label htmlFor="upi-amount" className="mt-6 block text-sm font-medium text-[#d9dee7]">Amount (optional)</label>
            <input id="upi-amount" inputMode="decimal" min="1" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Enter amount in INR" className="mt-2 w-full rounded-xl border border-white/10 bg-[#161a20] px-4 py-3 text-white outline-none focus:border-[#b7f34b]" />
            <a href={upiLink} className="mt-5 flex w-full items-center justify-center rounded-xl bg-[#b7f34b] px-5 py-3 font-bold text-[#101318] transition hover:bg-[#cdf878]">Open UPI app</a>
            <p className="mt-3 text-center text-xs text-[#697281]">Works on devices with a UPI app installed.</p>
          </section>
        ) : (
          <section className="mx-auto mt-8 w-full max-w-xl rounded-3xl border border-white/[0.08] bg-[#101318] p-6 sm:p-8" aria-labelledby="about-title">
            <h2 id="about-title" className="text-2xl font-bold">About Golden API</h2>
            <p className="mt-3 text-sm leading-6 text-[#7b8493]">Simple tools for everyday price checks, conversions, and financial calculations. Live market data is used where available.</p>
          </section>
        )}
      </div>

      <Dock
        items={[
          { label: "Home", icon: <NavigationIcon name="home" />, onClick: () => setActiveTab("Home"), className: activeTab === "Home" ? "dock-item-active" : "" },
          { label: "UPI", icon: <NavigationIcon name="upi" />, onClick: () => setActiveTab("UPI"), className: activeTab === "UPI" ? "dock-item-active" : "" },
          { label: "About", icon: <NavigationIcon name="about" />, onClick: () => setActiveTab("About"), className: activeTab === "About" ? "dock-item-active" : "" },
        ]}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
        className="dock-panel-app"
      />
    </main>
  );
}