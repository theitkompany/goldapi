"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const PURITIES = ["18K", "22K", "24K"] as const;
type Purity = (typeof PURITIES)[number];

type PriceResponse = {
  prices: { "24K": number; "22K": number; "18K": number };
  previousPrices: { "24K": number; "22K": number; "18K": number };
  lastUpdated: string;
  updatedTime: string;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  yesterday: number;
};

type GoldApiResponse = {
  updatedDate: string;
  updatedTime: string;
  rates: {
    "18k": number;
    "22k": number;
    "24k": number;
  };
  previousDate: string;
  previousTime: string;
  previousRates: {
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

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatUpdateTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

const RefreshIcon = ({ rotating }: { rotating: boolean }) => (
  <motion.span animate={rotating ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.75, ease: "easeInOut" }}>
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 12a7.5 7.5 0 0112.75-5.75" />
      <path d="M19.5 6.5V2.5H15.5" />
      <path d="M19.5 12a7.5 7.5 0 01-12.75 5.75" />
      <path d="M4.5 17.5V21.5H8.5" />
    </svg>
  </motion.span>
);

const StatisticCard = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45 }}
    className="w-full rounded-[28px] border border-white/10 bg-white/5 p-4 sm:p-5 shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-xl hover:-translate-y-1 hover:border-[#d4af37]/30 hover:shadow-[0_30px_90px_rgba(212,175,55,0.18)] transition-all"
  >
    <p className="text-xs uppercase tracking-[0.32em] text-muted">{label}</p>
    <p className={`mt-4 text-2xl font-semibold ${accent ? "text-[#d4af37]" : "text-foreground"}`}>{value}</p>
  </motion.div>
);

export default function HomePage() {
  const [prices, setPrices] = useState<PriceResponse | null>(null);
  const [selectedPurity, setSelectedPurity] = useState<Purity>("22K");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justUpdated, setJustUpdated] = useState(false);

  const currentPrice = useMemo(
    () => (prices ? prices.prices[selectedPurity] : 0),
    [prices, selectedPurity]
  );
  const yesterdayPrice = useMemo(
    () => (prices ? prices.previousPrices[selectedPurity] : 0),
    [prices, selectedPurity]
  );
  const sovereignPrice = useMemo(() => currentPrice * 8, [currentPrice]);
  const changeValue = useMemo(
    () => (yesterdayPrice > 0 ? currentPrice - yesterdayPrice : 0),
    [currentPrice, yesterdayPrice]
  );

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
      const selectedKey = selectedPurity.toLowerCase() as keyof GoldApiResponse["rates"];
      const transformed: PriceResponse = {
        prices: {
          "18K": data.rates["18k"],
          "22K": data.rates["22k"],
          "24K": data.rates["24k"],
        },
        previousPrices: {
          "18K": data.previousRates["18k"],
          "22K": data.previousRates["22k"],
          "24K": data.previousRates["24k"],
        },
        lastUpdated: data.updatedDate ? `${data.updatedDate}T${data.updatedTime}` : "",
        updatedTime: data.updatedTime,
        change: 0,
        changePercent: 0,
        high: 0,
        low: 0,
        yesterday: data.previousRates[selectedKey] ?? 0,
      };

      setPrices(transformed);
      setJustUpdated(true);
      window.setTimeout(() => setJustUpdated(false), 2600);
    } catch (err) {
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
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Link
        href="/"
        className="fixed left-4 top-4 z-30 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-2 text-xs font-semibold text-foreground backdrop-blur-xl transition hover:border-[#d4af37]/40 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
      >
        <span aria-hidden="true" className="text-base leading-none">←</span>
        All tools
      </Link>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hidden sm:block absolute left-[-12%] top-10 h-96 w-96 rounded-full bg-[#d4af37]/25 blur-3xl" />
        <div className="hidden sm:block absolute right-[-18%] top-1/4 h-[380px] w-[380px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_20%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.04),_transparent_45%),linear-gradient(180deg,_transparent,_rgba(255,255,255,0.06))]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col items-center justify-start px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:justify-center">
        <div className="w-full mx-auto max-w-[980px]">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="sticky top-0 z-20 mb-3 rounded-[28px] border border-white/10 bg-black/40 px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.14)] backdrop-blur-xl backdrop-saturate-150 sm:px-5 sm:py-4"
          >
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-3xl bg-white/10 text-lg font-semibold text-[#d4af37] shadow-[inset_0_0_0_1px_rgba(212,175,55,0.14)] sm:h-12 sm:w-12 sm:text-2xl">
                G
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.34em] text-muted sm:text-xs">Gold API</p>
                <p className="text-sm font-semibold">Updated gold price in kerala</p>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="grid gap-2 xl:grid-cols-1">
          <section className="space-y-4 sm:space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-5 min-h-[320px] lg:min-h-[360px] flex flex-col items-start lg:items-center lg:justify-center"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[10px] uppercase tracking-[0.34em] text-muted">Today's price</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl xl:text-5xl lg:text-4xl">
                    {loading ? "—" : formatPrice(currentPrice)}
                  </h1>
                  <p className="mt-2 max-w-none text-sm leading-5 text-muted">
                    Live 18K / 22K / 24K bullion pricing with sovereign parity and market pulse.
                  </p>
                </div>

                <div className="grid w-full gap-2 rounded-[28px] border border-white/10 bg-black/20 p-2 xl:max-w-[26rem]">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
                    {PURITIES.map((purity) => (
                      <button
                        key={purity}
                        type="button"
                        onClick={() => setSelectedPurity(purity)}
                        className={`rounded-[20px] px-3 py-2 text-xs font-semibold transition-all ${
                          selectedPurity === purity
                            ? "bg-[#d4af37] text-black shadow-[0_18px_45px_rgba(212,175,55,0.22)]"
                            : "bg-white/5 text-foreground hover:bg-white/10"
                        }`}
                      >
                        {purity}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={fetchPrices}
                      className="inline-flex aspect-square h-10 items-center justify-center rounded-[20px] border border-white/10 bg-white/5 text-foreground transition-all hover:border-[#d4af37]/30 hover:bg-white/10"
                    >
                      <RefreshIcon rotating={loading} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid w-full grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <StatisticCard label="Change" value={loading ? "—" : formatPrice(changeValue)} accent={changeValue > 0} />
                <StatisticCard label="Yesterday" value={loading ? "—" : formatPrice(yesterdayPrice)} />
                <StatisticCard label="Sovereign" value={loading ? "—" : formatPrice(sovereignPrice)} />
                <StatisticCard label="Updated" value={loading ? "Loading" : justUpdated ? "Just now" : prices?.updatedTime ?? "—"} />
              </div>

              {error ? (
                <div className="mt-4 rounded-[24px] border border-red-500/10 bg-red-500/10 p-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}
            </motion.div>

          </section>
        </div>
      </div>
    </div>
    </main>
  );
}
