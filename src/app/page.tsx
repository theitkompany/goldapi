"use client";

import Link from "next/link";
import { useState } from "react";
import Dock from "@/components/Dock";
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
    <main className="min-h-screen bg-[#07090c] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-6 sm:px-8 lg:px-12">
        <header className="border-b border-white/[0.08] py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b7f34b]">Golden API</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Simple Tools. Instant Conversions.</h1>
        </header>

        {activeTab === "Home" ? (
          <>
            <section className="relative mt-6 min-h-[250px] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#05070d] px-6 py-8 sm:min-h-[300px] sm:px-10 lg:min-h-[340px]" aria-labelledby="hero-title">
              <div className="relative z-10 flex max-w-md flex-col justify-center sm:min-h-[250px] lg:min-h-[290px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b7f34b]">Live market toolkit</p>
                <h2 id="hero-title" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Make every number count.</h2>
                <p className="mt-4 max-w-sm text-sm leading-6 text-[#9ba3af]">Explore fast, focused tools for precious metals, money, and everyday calculations.</p>
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-[-4%] w-[62%] min-w-[270px] sm:right-[2%] sm:w-[52%] lg:right-[5%] lg:w-[42%]"><ParticleSphere /></div>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_50%,rgba(255,255,255,0.08),transparent_32%),linear-gradient(90deg,#05070d_8%,rgba(5,7,13,0.84)_38%,transparent_78%)]" />
            </section>
            <div className="flex items-end justify-between pt-8">
              <div><p className="text-sm text-[#7b8493]">Everything you need,</p><p className="mt-1 text-lg font-semibold">all in one place.</p></div>
              <span className="rounded-full border border-white/10 bg-[#11151b] px-3 py-1.5 text-xs text-[#9ba3af]">{TOOLS.length} tools</span>
            </div>
            <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Available tools">
              {TOOLS.map(([id, title, description, category, icon, href]) => (
                <div key={id} className="group flex min-h-[190px] items-start gap-3 rounded-2xl border border-white/[0.08] bg-[#101318] p-5 transition hover:border-[#b7f34b]/40 hover:bg-[#141920]">
                  <Link href={href} className="flex min-w-0 flex-1 items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b7f34b]">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#1c331e] text-xl font-bold text-[#b7f34b]">{icon}</span>
                    <span className="min-w-0"><span className="block truncate font-semibold text-white">{title}</span><span className="mt-1 block truncate text-sm text-[#7b8493]">{description}</span><span className="mt-2 inline-flex rounded-md bg-[#1b3020] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#b7f34b]">{category}</span></span>
                  </Link>
                  <Link href={href} aria-label={`Open ${title}`} className="rounded-lg p-2 text-2xl leading-none text-[#7b8493] hover:text-white">›</Link>
                </div>
              ))}
            </section>
          </>
        ) : (
          <section className="mx-auto mt-10 w-full max-w-xl rounded-3xl border border-white/[0.08] bg-[#101318] p-6 sm:p-8" aria-labelledby="about-title">
            <h2 id="about-title" className="text-2xl font-bold">About Golden API</h2>
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
              <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
                <div><p className="text-xs uppercase tracking-wide text-[#697281]">UPI ID fallback</p><p className="mt-1 break-all font-mono text-sm text-[#b7f34b]">{UPI_ID}</p><button type="button" onClick={() => copyText(UPI_ID, "id")} className="mt-2 text-xs font-semibold text-[#d9dee7]">{copied === "id" ? "Copied" : "Copy UPI ID"}</button><button type="button" onClick={() => copyText(upiLink, "uri")} className="ml-4 mt-2 text-xs font-semibold text-[#d9dee7]">{copied === "uri" ? "Copied" : "Copy payment link"}</button></div>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(upiLink)}`} alt="QR code for selected UPI donation" width="140" height="140" className="rounded-lg bg-white p-2" />
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
