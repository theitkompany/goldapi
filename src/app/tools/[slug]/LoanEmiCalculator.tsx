"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";

const formatInr = (value: number) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value)
    : "—";

const LOAN_PRESETS = [
  { label: "₹1L", value: "100000" },
  { label: "₹5L", value: "500000" },
  { label: "₹10L", value: "1000000" },
  { label: "₹25L", value: "2500000" },
  { label: "₹50L", value: "5000000" },
] as const;

export default function LoanEmiCalculator() {
  const [principal, setPrincipal] = useState("1000000");
  const [annualRate, setAnnualRate] = useState("8.5");
  const [tenure, setTenure] = useState("10");
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years");

  const result = useMemo(() => {
    const p = Number(principal);
    const rAnnual = Number(annualRate);
    const t = Number(tenure);

    if (
      !Number.isFinite(p) ||
      !Number.isFinite(rAnnual) ||
      !Number.isFinite(t) ||
      p <= 0 ||
      rAnnual < 0 ||
      rAnnual > 100 ||
      t <= 0
    ) {
      return {
        error: "Enter a positive loan amount, interest rate (0–100%), and positive tenure.",
        emi: 0,
        totalInterest: 0,
        totalPayable: 0,
        months: 0,
        principalRatio: 100,
      };
    }

    const months = Math.round(tenureUnit === "years" ? t * 12 : t);
    if (months <= 0) {
      return {
        error: "Tenure must be at least 1 month.",
        emi: 0,
        totalInterest: 0,
        totalPayable: 0,
        months: 0,
        principalRatio: 100,
      };
    }

    const monthlyRate = rAnnual / 12 / 100;
    const emi =
      monthlyRate === 0
        ? p / months
        : (p * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);

    const totalPayable = emi * months;
    const totalInterest = Math.max(0, totalPayable - p);
    const principalRatio = totalPayable > 0 ? Math.min(100, Math.max(0, (p / totalPayable) * 100)) : 100;

    if (!Number.isFinite(emi) || !Number.isFinite(totalPayable)) {
      return {
        error: "Values are too large to calculate safely.",
        emi: 0,
        totalInterest: 0,
        totalPayable: 0,
        months: 0,
        principalRatio: 100,
      };
    }

    return { error: "", emi, totalInterest, totalPayable, months, principalRatio };
  }, [principal, annualRate, tenure, tenureUnit]);

  return (
    <ToolShell subtitle="Loan & EMI Calculator" accent="green">
      <div>
        <span className="bg-accent-badge text-accent-primary inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
          Financial
        </span>
        <h1 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-foreground">Loan &amp; EMI Calculator</h1>
        <p className="mt-1.5 text-xs sm:text-sm text-muted">
          Plan monthly EMIs, total interest cost, and repayment schedule.
        </p>
      </div>

      <div className="glass-subcard mt-6 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="loan-amount" className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            Loan Amount (₹)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {LOAN_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setPrincipal(preset.value)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                  principal === preset.value
                    ? "border-[#b7f34b]/60 bg-[#b7f34b]/20 text-accent-primary"
                    : "border-border bg-surface text-muted hover:text-foreground"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <input
          id="loan-amount"
          type="number"
          min="1"
          step="any"
          inputMode="decimal"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          className="theme-input mt-2.5 w-full rounded-xl px-4 py-3 text-xl sm:text-2xl font-semibold outline-none transition focus:border-[#b7f34b]"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="block text-xs font-medium text-muted">
            Interest Rate (% p.a.)
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              inputMode="decimal"
              value={annualRate}
              onChange={(e) => setAnnualRate(e.target.value)}
              className="theme-input mt-1.5 w-full rounded-xl px-4 py-3 text-base font-semibold outline-none transition focus:border-[#b7f34b]"
            />
          </label>

          <label className="block text-xs font-medium text-muted">
            Tenure
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              className="theme-input mt-1.5 w-full rounded-xl px-4 py-3 text-base font-semibold outline-none transition focus:border-[#b7f34b]"
            />
          </label>

          <label className="block text-xs font-medium text-muted">
            Unit
            <select
              value={tenureUnit}
              onChange={(e) => setTenureUnit(e.target.value as "years" | "months")}
              className="theme-select mt-1.5 w-full rounded-xl px-4 py-3 text-base font-medium outline-none transition focus:border-[#b7f34b]"
            >
              <option value="years">Years</option>
              <option value="months">Months</option>
            </select>
          </label>
        </div>

        <div className="mt-5 rounded-xl border border-[#b7f34b]/25 bg-[#b7f34b]/[0.08] p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Monthly EMI ({result.months} {result.months === 1 ? "month" : "months"})
          </p>
          <p className="mt-1.5 text-3xl sm:text-4xl font-bold text-accent-primary">
            {result.error ? "—" : formatInr(result.emi)}
          </p>
          {!result.error ? (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted mb-1.5">
                <span>Principal ({result.principalRatio.toFixed(1)}%)</span>
                <span>Interest ({(100 - result.principalRatio).toFixed(1)}%)</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-strong">
                <div
                  className="h-full rounded-full bg-[#315c35] transition-all duration-300"
                  style={{ width: `${result.principalRatio}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {result.error ? <p className="mt-4 text-sm text-red-400">{result.error}</p> : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="glass-subcard rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Principal</p>
          <p className="mt-2 text-xl sm:text-2xl font-semibold text-foreground">
            {result.error ? "—" : formatInr(Number(principal))}
          </p>
        </div>
        <div className="glass-subcard rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Total Interest</p>
          <p className="mt-2 text-xl sm:text-2xl font-semibold text-accent-primary">
            {result.error ? "—" : formatInr(result.totalInterest)}
          </p>
        </div>
        <div className="glass-subcard rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Total Payable</p>
          <p className="mt-2 text-xl sm:text-2xl font-semibold text-foreground">
            {result.error ? "—" : formatInr(result.totalPayable)}
          </p>
        </div>
      </div>
    </ToolShell>
  );
}
