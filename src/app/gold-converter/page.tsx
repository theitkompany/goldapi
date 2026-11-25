"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const PURITIES = ["18K", "22K", "24K"] as const;
type Purity = (typeof PURITIES)[number];

const WEIGHT_UNITS = [
  { id: "gram", label: "Grams (g)", gramsPerUnit: 1 },
  { id: "sovereign", label: "Sovereign / Pavan (8g)", gramsPerUnit: 8 },
  { id: "ounce", label: "Troy Ounce (31.10g)", gramsPerUnit: 31.1034768 },
  { id: "kg", label: "Kilogram (1000g)", gramsPerUnit: 1000 },
] as const;
type WeightUnit = (typeof WEIGHT_UNITS)[number]["id"];

const PRESET_WEIGHTS = [
  { label: "1g", value: "1", unit: "gram" as WeightUnit },
  { label: "4g", value: "4", unit: "gram" as WeightUnit },
  { label: "8g (1 Pavan)", value: "8", unit: "gram" as WeightUnit },
  { label: "10g", value: "10", unit: "gram" as WeightUnit },
  { label: "100g", value: "100", unit: "gram" as WeightUnit },
];

type PriceResponse = {
  prices: { "24K": number; "22K": number; "18K": number };
  updatedTime: string;
};

type GoldApiResponse = {
  updatedDate: string;
  updatedTime: string;
  rates: {
    "18k": number;
    "22k": number;
    "24k": number;
  };
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const RefreshIcon = ({ rotating }: { rotating: boolean }) => (
  <motion.span animate={rotating ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.75, ease: "easeInOut" }}>
    <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 12a7.5 7.5 0 0112.75-5.75" />
      <path d="M19.5 6.5V2.5H15.5" />
      <path d="M19.5 12a7.5 7.5 0 01-12.75 5.75" />
      <path d="M4.5 17.5V21.5H8.5" />
    </svg>
  </motion.span>
);

const StatisticCard = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all hover:border-[#d4af37]/30">
    <p className="text-[11px] uppercase tracking-[0.24em] text-muted">{label}</p>
    <p className={`mt-2 text-xl sm:text-2xl font-semibold ${accent ? "text-[#d4af37]" : "text-foreground"}`}>{value}</p>
  </div>
);

export default function GoldConverterPage() {
  const [prices, setPrices] = useState<PriceResponse | null>(null);
  const [selectedPurity, setSelectedPurity] = useState<Purity>("22K");
  const [weight, setWeight] = useState("8");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("gram");
  const [includeGst, setIncludeGst] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justUpdated, setJustUpdated] = useState(false);

  const currentPrice = useMemo(
    () => (prices ? prices.prices[selectedPurity] : 0),
    [prices, selectedPurity]
  );
  const sovereignPrice = useMemo(() => currentPrice * 8, [currentPrice]);

  const totalGrams = useMemo(() => {
    const numeric = Number(weight);
    if (!Number.isFinite(numeric) || numeric < 0) return 0;
    const unitMeta = WEIGHT_UNITS.find((u) => u.id === weightUnit);
    return numeric * (unitMeta?.gramsPerUnit ?? 1);
  }, [weight, weightUnit]);

  const baseValue = useMemo(() => totalGrams * currentPrice, [totalGrams, currentPrice]);
  const gstAmount = useMemo(() => (includeGst ? baseValue * 0.03 : 0), [baseValue, includeGst]);
  const finalValue = useMemo(() => baseValue + gstAmount, [baseValue, gstAmount]);

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    setJustUpdated(false);

    try {
      const response = await fetch("/api/gold", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load gold prices.");
      }

      const data = (await response.json()) as GoldApiResponse;
      const transformed: PriceResponse = {
        prices: {
          "18K": data.rates["18k"],
          "22K": data.rates["22k"],
          "24K": data.rates["24k"],
        },
        updatedTime: data.updatedTime,
      };

      setPrices(transformed);
      setJustUpdated(true);
      window.setTimeout(() => setJustUpdated(false), 2600);
    } catch {
      setError("Unable to load gold prices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = window.setInterval(fetchPrices, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden text-foreground">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[980px] flex-col justify-start px-3 py-3 sm:px-6 sm:py-8">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="sticky top-2 z-20 mb-4 rounded-2xl sm:rounded-[24px] border border-white/10 bg-black/50 px-3.5 py-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-2xl sm:px-5 sm:py-3.5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                aria-label="Back to all tools"
                className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 text-base font-semibold text-[#d4af37] shadow-[inset_0_0_0_1px_rgba(212,175,55,0.18)] transition hover:bg-white/20 hover:text-white"
              >
                ←
              </Link>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] sm:text-xs">Gold API</p>
                <p className="text-xs sm:text-sm font-semibold text-white">Kerala Live Gold Converter</p>
              </div>
            </div>
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:border-[#d4af37]/40 hover:bg-white/10"
            >
              All tools
            </Link>
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl sm:rounded-[28px] border border-white/10 bg-black/45 p-4 sm:p-7 shadow-[0_28px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
        >
          {/* Live Rate + Purity Selector */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-[#d4af37]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                Precious Metals
              </span>
              <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-muted">
                Today&apos;s {selectedPurity} Rate (1 Gram)
              </p>
              <h1 className="mt-1 text-3xl sm:text-5xl font-bold tracking-tight text-white">
                {loading ? "—" : formatPrice(currentPrice)}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-muted">
                Live 18K, 22K &amp; 24K bullion pricing with instant weight conversion.
              </p>
            </div>

            <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 self-start md:self-auto">
              {PURITIES.map((purity) => (
                <button
                  key={purity}
                  type="button"
                  onClick={() => setSelectedPurity(purity)}
                  className={`rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                    selectedPurity === purity
                      ? "bg-[#d4af37] text-black shadow-[0_10px_30px_rgba(212,175,55,0.28)]"
                      : "text-foreground hover:bg-white/10"
                  }`}
                >
                  {purity}
                </button>
              ))}
              <button
                type="button"
                onClick={fetchPrices}
                aria-label="Refresh gold prices"
                className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-foreground transition hover:border-[#d4af37]/40 hover:bg-white/10"
              >
                <RefreshIcon rotating={loading} />
              </button>
            </div>
          </div>

          {/* Interactive Gold Weight Converter */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-white">Convert Gold Weight</h2>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_WEIGHTS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setWeight(preset.value);
                      setWeightUnit(preset.unit);
                    }}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                      weight === preset.value && weightUnit === preset.unit
                        ? "border-[#d4af37]/60 bg-[#d4af37]/20 text-[#d4af37]"
                        : "border-white/10 bg-white/5 text-muted hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-medium text-muted">
                Weight
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-[#d4af37]"
                />
              </label>

              <label className="block text-xs font-medium text-muted">
                Unit
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0d110e] px-4 py-3 text-sm sm:text-base font-medium text-white outline-none transition focus:border-[#d4af37]"
                >
                  {WEIGHT_UNITS.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  Estimated Value ({totalGrams.toLocaleString("en-IN", { maximumFractionDigits: 3 })} g · {selectedPurity})
                </p>
                <p className="mt-1 text-2xl sm:text-3xl font-bold text-[#d4af37]">
                  {loading ? "—" : formatPrice(finalValue)}
                </p>
                {includeGst && !loading ? (
                  <p className="mt-1 text-xs text-muted">
                    Base: {formatPrice(baseValue)} + 3% GST: {formatPrice(gstAmount)}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => setIncludeGst((prev) => !prev)}
                className={`self-start sm:self-auto rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                  includeGst
                    ? "border-[#d4af37] bg-[#d4af37] text-black"
                    : "border-white/15 bg-white/5 text-foreground hover:bg-white/10"
                }`}
              >
                {includeGst ? "✓ 3% GST Included" : "+ Add 3% GST"}
              </button>
            </div>
          </div>

          {/* Summary Stat Cards */}
          <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            <StatisticCard label="24K (1 Gram)" value={loading ? "—" : formatPrice(prices?.prices["24K"] ?? 0)} />
            <StatisticCard label={`1 Sovereign (8g · ${selectedPurity})`} value={loading ? "—" : formatPrice(sovereignPrice)} accent />
            <StatisticCard label="Updated" value={loading ? "Loading" : justUpdated ? "Just now" : prices?.updatedTime ?? "—"} />
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}
        </motion.section>
      </div>
    </main>
  );
}
