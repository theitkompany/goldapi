"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const numberFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const frequencyOptions = [
  ["1", "Annually"],
  ["2", "Half-yearly"],
  ["4", "Quarterly"],
  ["12", "Monthly"],
  ["365", "Daily"],
] as const;

function money(value: number) {
  return Number.isFinite(value) ? `₹${numberFormat.format(value)}` : "—";
}

export default function InterestCalculator() {
  const [mode, setMode] = useState<"simple" | "compound">("simple");
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("8");
  const [time, setTime] = useState("1");
  const [timeUnit, setTimeUnit] = useState("years");
  const [frequency, setFrequency] = useState("1");

  const result = useMemo(() => {
    const p = Number(principal);
    const r = Number(rate);
    const duration = Number(time);
    if (!Number.isFinite(p) || !Number.isFinite(r) || !Number.isFinite(duration) || p < 0 || r < 0 || r > 100 || duration <= 0) {
      return { error: "Enter a principal, a rate from 0–100%, and a positive duration.", interest: 0, total: 0 };
    }
    const years = duration / (timeUnit === "months" ? 12 : timeUnit === "days" ? 365 : 1);
    const n = Number(frequency);
    const total = mode === "simple" ? p * (1 + (r / 100) * years) : p * Math.pow(1 + r / 100 / n, n * years);
    const interest = total - p;
    if (!Number.isFinite(total) || !Number.isFinite(interest)) return { error: "These values are too large to calculate safely.", interest: 0, total: 0 };
    return { error: "", interest, total };
  }, [principal, rate, time, timeUnit, frequency, mode]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07090c] px-5 py-10 text-white">
      <section className="w-full max-w-2xl rounded-3xl border border-white/[0.08] bg-[#101318] p-6 sm:p-8">
        <Link href="/" className="text-sm text-[#b7f34b] hover:underline">← All tools</Link>
        <span className="mt-8 inline-flex rounded-full bg-[#1b3020] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#b7f34b]">Financial</span>
        <h1 className="mt-4 text-3xl font-bold">Interest Calculator</h1>
        <p className="mt-2 text-sm text-[#7b8493]">Compare simple and compound interest with Indian-number formatting.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="text-sm text-[#d9dee7]">Calculation mode
            <select value={mode} onChange={(e) => setMode(e.target.value as "simple" | "compound")} className="mt-2 w-full rounded-xl border border-white/10 bg-[#161a20] px-4 py-3 text-white">
              <option value="simple">Simple interest</option><option value="compound">Compound interest</option>
            </select>
          </label>
          <label className="text-sm text-[#d9dee7]">Principal (₹)
            <input type="number" min="0" step="any" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#161a20] px-4 py-3 text-white outline-none focus:border-[#b7f34b]" />
          </label>
          <label className="text-sm text-[#d9dee7]">Annual interest rate (%)
            <input type="number" min="0" max="100" step="any" value={rate} onChange={(e) => setRate(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#161a20] px-4 py-3 text-white outline-none focus:border-[#b7f34b]" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-[#d9dee7]">Duration
              <input type="number" min="0" step="any" value={time} onChange={(e) => setTime(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#161a20] px-4 py-3 text-white outline-none focus:border-[#b7f34b]" />
            </label>
            <label className="text-sm text-[#d9dee7]">Time unit
              <select value={timeUnit} onChange={(e) => setTimeUnit(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#161a20] px-3 py-3 text-white"><option value="years">Years</option><option value="months">Months</option><option value="days">Days</option></select>
            </label>
          </div>
          {mode === "compound" ? <label className="text-sm text-[#d9dee7]">Compounding frequency
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#161a20] px-4 py-3 text-white">{frequencyOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          </label> : <div />}
        </div>
        {result.error ? <p className="mt-5 text-sm text-red-300">{result.error}</p> : null}
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#0b0d10] p-5"><p className="text-sm text-[#7b8493]">Interest earned</p><p className="mt-2 text-2xl font-bold text-[#b7f34b]">{money(result.interest)}</p></div>
          <div className="rounded-2xl border border-white/10 bg-[#0b0d10] p-5"><p className="text-sm text-[#7b8493]">Total amount</p><p className="mt-2 text-2xl font-bold text-[#b7f34b]">{money(result.total)}</p></div>
        </div>
      </section>
    </main>
  );
}
