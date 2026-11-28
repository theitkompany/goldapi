"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";

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
    <ToolShell subtitle="Simple & Compound Interest" accent="green">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="bg-accent-badge text-accent-primary inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
            Financial
          </span>
          <h1 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-foreground">Interest Calculator</h1>
          <p className="mt-1.5 text-xs sm:text-sm text-muted">
            Compare simple and compound interest with Indian-number formatting.
          </p>
        </div>

        <div className="glass-subcard flex items-center gap-1.5 rounded-2xl p-1.5">
          {(["simple", "compound"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold capitalize transition ${
                mode === item
                  ? "bg-[#b7f34b] text-[#101318]"
                  : "text-foreground hover:bg-surface-hover"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-subcard mt-6 rounded-2xl p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-medium text-muted">
            Principal (₹)
            <input
              type="number"
              min="0"
              step="any"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="theme-input mt-1.5 w-full rounded-xl px-4 py-3 text-base font-semibold outline-none transition focus:border-[#b7f34b]"
            />
          </label>
          <label className="text-xs font-medium text-muted">
            Annual interest rate (%)
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="theme-input mt-1.5 w-full rounded-xl px-4 py-3 text-base font-semibold outline-none transition focus:border-[#b7f34b]"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-medium text-muted">
              Duration
              <input
                type="number"
                min="0"
                step="any"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="theme-input mt-1.5 w-full rounded-xl px-4 py-3 text-base font-semibold outline-none transition focus:border-[#b7f34b]"
              />
            </label>
            <label className="text-xs font-medium text-muted">
              Time unit
              <select
                value={timeUnit}
                onChange={(e) => setTimeUnit(e.target.value)}
                className="theme-select mt-1.5 w-full rounded-xl px-3 py-3 text-base font-medium outline-none transition focus:border-[#b7f34b]"
              >
                <option value="years">Years</option>
                <option value="months">Months</option>
                <option value="days">Days</option>
              </select>
            </label>
          </div>
          {mode === "compound" ? (
            <label className="text-xs font-medium text-muted">
              Compounding frequency
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="theme-select mt-1.5 w-full rounded-xl px-4 py-3 text-base font-medium outline-none transition focus:border-[#b7f34b]"
              >
                {frequencyOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </div>

      {result.error ? <p className="mt-4 text-sm text-red-400">{result.error}</p> : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="glass-subcard rounded-2xl p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Interest earned</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-accent-primary">{money(result.interest)}</p>
        </div>
        <div className="glass-subcard rounded-2xl p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Total amount</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">{money(result.total)}</p>
        </div>
      </div>
    </ToolShell>
  );
}
