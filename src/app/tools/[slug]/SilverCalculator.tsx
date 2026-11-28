"use client";

import { useEffect, useState } from "react";
import ToolShell from "@/components/ToolShell";

type SilverResponse = {
  price: number;
  currency: string;
  unit: string;
  change24h: number | null;
};

const WEIGHT_PRESETS = ["10", "50", "100", "500", "1000"] as const;

export default function SilverCalculator() {
  const [grams, setGrams] = useState("10");
  const [silver, setSilver] = useState<SilverResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/silver", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load the live silver price.");
        return (await response.json()) as SilverResponse;
      })
      .then(setSilver)
      .catch((reason: Error) => setError(reason.message));
  }, []);

  const amount = Number(grams);
  const total = silver && Number.isFinite(amount) && amount >= 0 ? amount * silver.price : 0;

  return (
    <ToolShell subtitle="Live Silver Converter" accent="green">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="bg-accent-badge text-accent-primary inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
            Precious Metals
          </span>
          <h1 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-foreground">Silver Converter</h1>
          <p className="mt-1.5 text-xs sm:text-sm text-muted">
            Calculate silver value using the current live INR price per gram.
          </p>
        </div>
        <div className="glass-subcard rounded-2xl px-4 py-3 text-right">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Live Rate</p>
          <p className="mt-1 text-base sm:text-lg font-bold text-accent-primary">
            {silver ? `₹${silver.price.toFixed(2)} / ${silver.unit}` : "Loading..."}
          </p>
          {silver?.change24h !== null && silver?.change24h !== undefined ? (
            <p className="text-[11px] text-muted">
              24h: {silver.change24h > 0 ? "+" : ""}
              {silver.change24h.toFixed(2)}%
            </p>
          ) : null}
        </div>
      </div>

      <div className="glass-subcard mt-6 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-muted" htmlFor="silver-grams">
            Weight in grams
          </label>
          <div className="flex flex-wrap gap-1.5">
            {WEIGHT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setGrams(preset)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                  grams === preset
                    ? "border-[#b7f34b]/60 bg-[#b7f34b]/20 text-accent-primary"
                    : "border-border bg-surface text-muted hover:text-foreground"
                }`}
              >
                {preset === "1000" ? "1kg" : `${preset}g`}
              </button>
            ))}
          </div>
        </div>

        <input
          id="silver-grams"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={grams}
          onChange={(event) => setGrams(event.target.value)}
          className="theme-input mt-2.5 w-full rounded-xl px-4 py-3 text-xl sm:text-2xl font-semibold outline-none transition focus:border-[#b7f34b]"
        />

        <div className="mt-5 rounded-xl border border-[#b7f34b]/25 bg-[#b7f34b]/[0.08] p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Estimated value</p>
          <p className="mt-1.5 text-3xl sm:text-4xl font-bold text-accent-primary">
            {silver ? `₹${total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "—"}
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      ) : null}
    </ToolShell>
  );
}
