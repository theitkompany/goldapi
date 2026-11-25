"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type CurrencyApiResponse = {
  base: string;
  updatedAt: string;
  rates: Record<string, number>;
  source?: string;
};

const POPULAR_CURRENCIES: Array<{ code: string; name: string }> = [
  { code: "USD", name: "US Dollar" },
  { code: "INR", name: "Indian Rupee" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "KWD", name: "Kuwaiti Dinar" },
  { code: "QAR", name: "Qatari Riyal" },
  { code: "OMR", name: "Omani Rial" },
  { code: "BHD", name: "Bahraini Dinar" },
];

const QUICK_AMOUNTS = ["1", "100", "1000", "10000"] as const;

function formatCurrencyValue(value: number, currency: string) {
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: value < 1 ? 4 : 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString("en-IN", { maximumFractionDigits: 4 })} ${currency}`;
  }
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [data, setData] = useState<CurrencyApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/currency?base=USD", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load exchange rates.");
      }
      const json = (await response.json()) as CurrencyApiResponse;
      setData(json);
    } catch {
      setError("Unable to load live exchange rates. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const currencyOptions = useMemo(() => {
    const popularSet = new Set(POPULAR_CURRENCIES.map((c) => c.code));
    const availableCodes = data?.rates ? Object.keys(data.rates) : POPULAR_CURRENCIES.map((c) => c.code);
    const others = availableCodes
      .filter((code) => !popularSet.has(code))
      .sort()
      .map((code) => ({ code, name: code }));

    const popularAvailable = POPULAR_CURRENCIES.filter((c) => availableCodes.includes(c.code));
    return { popular: popularAvailable, others };
  }, [data]);

  const exchangeRate = useMemo(() => {
    if (!data?.rates) return null;
    const fromRate = data.rates[from];
    const toRate = data.rates[to];
    if (!fromRate || !toRate) return null;
    return toRate / fromRate;
  }, [data, from, to]);

  const convertedValue = useMemo(() => {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric < 0 || exchangeRate === null) return null;
    return numeric * exchangeRate;
  }, [amount, exchangeRate]);

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
  };

  const quickBoard = useMemo(() => {
    if (!data?.rates || !data.rates[from]) return [];
    const fromRate = data.rates[from];
    const baseAmount = Number(amount);
    const multiplier = Number.isFinite(baseAmount) && baseAmount > 0 ? baseAmount : 1;
    const targets = ["INR", "USD", "EUR", "GBP", "AED", "SGD"].filter((code) => code !== from && data.rates[code]);
    return targets.slice(0, 4).map((code) => ({
      code,
      value: multiplier * (data.rates[code] / fromRate),
    }));
  }, [data, from, amount]);

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
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
                className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 text-base font-semibold text-[#b7f34b] shadow-[inset_0_0_0_1px_rgba(183,243,75,0.18)] transition hover:bg-white/20 hover:text-white"
              >
                ←
              </Link>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#b7f34b] sm:text-xs">Golden API</p>
                <p className="text-xs sm:text-sm font-semibold text-white">Live Currency Converter</p>
              </div>
            </div>
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:border-[#b7f34b]/40 hover:bg-white/10"
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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="inline-flex rounded-full bg-[#1b3020] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b7f34b]">
                Financial
              </span>
              <h1 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-white">Currency Converter</h1>
              <p className="mt-1.5 text-xs sm:text-sm text-[#9db59b]">
                Convert 160+ world currencies using live mid-market exchange rates.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchRates}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition hover:border-[#b7f34b]/40 hover:bg-white/10 disabled:opacity-50"
            >
              <span className={loading ? "animate-spin" : ""}>↻</span>
              {loading ? "Updating..." : "Refresh rates"}
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="currency-amount" className="text-xs font-medium uppercase tracking-[0.2em] text-[#9db59b]">
                Amount
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                      amount === preset
                        ? "border-[#b7f34b]/60 bg-[#b7f34b]/20 text-[#b7f34b]"
                        : "border-white/10 bg-white/5 text-[#9db59b] hover:text-white"
                    }`}
                  >
                    {Number(preset).toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>

            <input
              id="currency-amount"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="mt-2.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xl sm:text-2xl font-semibold text-white outline-none transition focus:border-[#b7f34b]"
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
              <label className="block text-xs font-medium text-[#9db59b]">
                From
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0d120f] px-3.5 py-3 text-sm sm:text-base font-medium text-white outline-none transition focus:border-[#b7f34b]"
                >
                  <optgroup label="Popular">
                    {currencyOptions.popular.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </optgroup>
                  {currencyOptions.others.length > 0 ? (
                    <optgroup label="All Currencies">
                      {currencyOptions.others.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                </select>
              </label>

              <div className="flex justify-center sm:block">
                <button
                  type="button"
                  onClick={swapCurrencies}
                  aria-label="Swap currencies"
                  className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 sm:py-3 text-sm font-semibold text-[#b7f34b] transition hover:border-[#b7f34b]/40 hover:bg-white/10"
                >
                  <span className="sm:hidden">⇅ Swap</span>
                  <span className="hidden sm:inline">⇄</span>
                </button>
              </div>

              <label className="block text-xs font-medium text-[#9db59b]">
                To
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0d120f] px-3.5 py-3 text-sm sm:text-base font-medium text-white outline-none transition focus:border-[#b7f34b]"
                >
                  <optgroup label="Popular">
                    {currencyOptions.popular.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </optgroup>
                  {currencyOptions.others.length > 0 ? (
                    <optgroup label="All Currencies">
                      {currencyOptions.others.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                </select>
              </label>
            </div>

            <div className="mt-5 rounded-xl border border-[#b7f34b]/20 bg-[#b7f34b]/[0.06] p-4 sm:p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#9db59b]">
                {amount || "0"} {from} equals
              </p>
              <p className="mt-1.5 break-words text-3xl sm:text-4xl font-bold text-[#b7f34b]">
                {loading && !data ? "Loading..." : convertedValue !== null ? formatCurrencyValue(convertedValue, to) : "—"}
              </p>
              {exchangeRate !== null ? (
                <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#b8cdb7]">
                  <span>1 {from} = {exchangeRate.toFixed(4)} {to}</span>
                  <span>1 {to} = {(1 / exchangeRate).toFixed(4)} {from}</span>
                </div>
              ) : null}
            </div>
          </div>

          {quickBoard.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickBoard.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setTo(item.code)}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 text-left transition hover:border-[#b7f34b]/40 hover:bg-white/[0.07]"
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#9db59b]">{item.code}</p>
                  <p className="mt-1.5 truncate text-base sm:text-lg font-semibold text-white">
                    {formatCurrencyValue(item.value, item.code)}
                  </p>
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#9db59b]">
            <span>{data?.updatedAt ? `Rates updated: ${data.updatedAt}` : "Fetching live rates..."}</span>
            {data?.source ? <span>Source: {data.source}</span> : null}
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
