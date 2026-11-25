"use client";

import Link from "next/link";
import { useState } from "react";
import Dock from "@/components/Dock";
import GhostFibers from "@/components/GhostFibers";
import ParticleSphere from "@/components/ParticleSphere";

const UPI_ID = "saveen.salah@federal";
const TOOLS = [
  ["gold", "Gold Converter", "Live prices, purity rates and sovereign value", "Precious Metals", "◆", "/gold-converter"],
  ["currency", "Currency Converter", "Convert currencies with up-to-date exchange rates", "Financial", "$", "/tools/currency-converter"],
  ["metals", "Silver & Precious Metals", "Track silver and other precious metal prices", "Precious Metals", "◈", "/tools/silver-precious-metals"],
  ["interest", "Interest Calculator", "Estimate simple and compound interest returns", "Financial", "%", "/tools/interest-calculator"],
  ["loan", "Loan & EMI Calculator", "Plan monthly payments and total loan costs", "Financial", "▣", "/tools/loan-emi-calculator"],
  ["unit", "Unit Converter", "Quickly convert common weights and measurements", "Utilities", "↔", "/tools/unit-converter"],
] as const;

function NavigationIcon({ name }: { name: "home" | "about" }) {
  const paths = {
    home: "M3 10.8 12 3l9 7.8v9.2a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.2Z",
    about: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-10v6m0-9h.01",
  };
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"Home" | "About">("Home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDonation, setSelectedDonation] = useState("25");
  const [customDonation, setCustomDonation] = useState("");
  const [copied, setCopied] = useState<"id" | "uri" | null>(null);
  const donationAmount = customDonation.trim() || selectedDonation;
  const numericDonation = Number(donationAmount);
  const validDonation = Number.isFinite(numericDonation) && numericDonation > 0;
  const upiLink = `upi://pay?${new URLSearchParams({
    pa: UPI_ID,
    pn: "Saveen",
    ...(validDonation ? { am: numericDonation.toFixed(2) } : {}),
    cu: "INR",
    tn: "Donation",
  }).toString()}`;

  const copyText = async (value: string, type: "id" | "uri") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07100a] text-[#edf8df]">
      <GhostFibers color="#86a982" glowColor="#b7f34b" speed={0.2} scale={1.6} opacity={0.42} className="ghost-fibers-mobile-bounded opacity-80" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-24 sm:px-8 sm:pb-28 lg:px-12">
        <header className="flex items-center justify-between py-3 sm:py-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b7f34b]">Golden API</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-[#edf8df] sm:text-3xl">Simple Tools. Instant Conversions.</h1>
          </div>
        </header>

        {activeTab === "Home" ? (
          <>
            <section className="relative z-0 mt-0 h-0 overflow-visible sm:mt-3 sm:h-[400px] lg:h-[470px]" aria-label="Animated particle sphere">
              <div className="pointer-events-none absolute left-1/2 top-[-50px] z-0 flex -translate-x-1/2 items-center justify-center opacity-40 sm:opacity-100 sm:inset-0 sm:translate-x-0">
                <div className="h-[200px] w-[200px] sm:h-[350px] sm:w-[350px] lg:h-[415px] lg:w-[415px]">
                  <ParticleSphere />
                </div>
              </div>
            </section>
            <div className="relative z-10 flex items-end justify-between pt-2">
              <div>
                <p className="text-xs sm:text-sm text-[#9db59b]">Everything you need,</p>
                <p className="mt-0.5 sm:mt-1 text-base sm:text-lg font-semibold text-[#edf8df]">all in one place.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-[#b8cdb7]">{TOOLS.length} tools</span>
            </div>
            <label htmlFor="tool-search" className="sr-only">Search tools</label>
            <input
              id="tool-search"
              placeholder="Search tools and calculators..."
              onChange={(event) => setSearchQuery(event.target.value)}
              className="relative z-10 mt-4 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-[#9db59b] focus:border-[#b7f34b]"
            />
            <section className="relative z-10 mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3" aria-label="Available tools">
              {TOOLS.filter(([, title, description, category]) => `${title} ${description} ${category}`.toLowerCase().includes(searchQuery.toLowerCase())).map(([id, title, description, category, icon, href]) => (
                <Link
                  key={id}
                  href={href}
                  className="group relative flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/10 p-3.5 transition hover:border-[#b7f34b]/50 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b7f34b] sm:min-h-[148px] sm:flex-col sm:items-center sm:justify-center sm:p-5 sm:text-center sm:gap-2.5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#315c35] text-lg font-bold text-[#dcefc1] transition group-hover:scale-105 sm:h-12 sm:w-12 sm:text-xl">
                    {icon}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col sm:items-center">
                    <div className="flex flex-wrap items-center gap-2 sm:justify-center">
                      <span className="font-semibold text-sm sm:text-base text-[#edf8df]">{title}</span>
                      <span className="inline-flex rounded-md bg-[#c3dfa8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#315c35]">
                        {category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#b8cdb7] sm:text-sm sm:max-w-[260px] leading-relaxed">
                      {description}
                    </p>
                  </div>
                  <span aria-hidden="true" className="shrink-0 text-xl font-light text-[#b8cdb7] transition group-hover:text-[#b7f34b] group-hover:translate-x-0.5 sm:absolute sm:right-3.5 sm:top-1/2 sm:-translate-y-1/2 sm:text-2xl">
                    ›
                  </span>
                </Link>
              ))}
            </section>
          </>
        ) : (
          <section className="mx-auto mt-6 w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#101318] p-5 sm:mt-10 sm:rounded-3xl sm:p-8" aria-labelledby="about-title">
            <h2 id="about-title" className="text-xl sm:text-2xl font-bold">About Golden API</h2>
            <p className="mt-3 text-sm leading-6 text-[#7b8493]">Golden API brings live precious-metal prices and practical calculators into one simple toolkit for everyday decisions.</p>
            <div className="mt-8 border-t border-white/10 pt-6">
              <h3 className="text-lg font-semibold">Support / Donate</h3>
              <p className="mt-2 text-sm leading-6 text-[#7b8493]">Support continued development through a secure UPI donation.</p>
              <div className="mt-5 grid grid-cols-4 gap-2">
                {["10", "25", "50", "100"].map((preset) => <button key={preset} type="button" onClick={() => { setSelectedDonation(preset); setCustomDonation(""); }} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${selectedDonation === preset && !customDonation ? "border-[#b7f34b] bg-[#1b3020] text-[#b7f34b]" : "border-white/10 bg-[#0b0d10] text-[#d9dee7]"}`}>₹{preset}</button>)}
              </div>
              <label htmlFor="custom-donation" className="mt-5 block text-sm font-medium text-[#d9dee7]">Custom amount (INR)</label>
              <input id="custom-donation" inputMode="decimal" min="1" step="0.01" type="number" value={customDonation} onChange={(event) => setCustomDonation(event.target.value)} placeholder="Enter a positive amount" className="mt-2 w-full rounded-xl border border-white/10 bg-[#161a20] px-4 py-3 text-white outline-none focus:border-[#b7f34b]" />
              <a aria-disabled={!validDonation} href={validDonation ? upiLink : undefined} className={`mt-5 flex w-full items-center justify-center rounded-xl px-5 py-3 font-bold ${validDonation ? "bg-[#b7f34b] text-[#101318]" : "cursor-not-allowed bg-[#273126] text-[#72806b]"}`}>Donate / Pay with UPI</a>
              <div className="mt-6 flex flex-col gap-4 sm:grid sm:grid-cols-[1fr_auto]">
                <div><p className="text-xs uppercase tracking-wide text-[#697281]">UPI ID fallback</p><p className="mt-1 break-all font-mono text-sm text-[#b7f34b]">{UPI_ID}</p><button type="button" onClick={() => copyText(UPI_ID, "id")} className="mt-2 text-xs font-semibold text-[#d9dee7]">{copied === "id" ? "Copied" : "Copy UPI ID"}</button><button type="button" onClick={() => copyText(upiLink, "uri")} className="ml-4 mt-2 text-xs font-semibold text-[#d9dee7]">{copied === "uri" ? "Copied" : "Copy payment link"}</button></div>
                <div className="flex justify-center sm:justify-end">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(upiLink)}`} alt="QR code for selected UPI donation" width="140" height="140" className="rounded-lg bg-white p-2" />
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#697281]">Opening a UPI app only starts the payment. Confirm the transaction inside your UPI app; this website does not claim payment success.</p>
            </div>
          </section>
        )}

        <Dock items={[
          { label: "Home", icon: <NavigationIcon name="home" />, onClick: () => setActiveTab("Home"), className: activeTab === "Home" ? "dock-item-active" : "" },
          { label: "About", icon: <NavigationIcon name="about" />, onClick: () => setActiveTab("About"), className: activeTab === "About" ? "dock-item-active" : "" },
        ]} panelHeight={68} baseItemSize={50} magnification={70} className="dock-panel-app" />
      </div>
    </main>
  );
}
