"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";

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
    <ToolShell subtitle="Live Currency Converter" accent="green">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="bg-accent-badge text-accent-primary inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
            Financial
          </span>
          <h1 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-foreground">Currency Converter</h1>
          <p className="mt-1.5 text-xs sm:text-sm text-muted">
            Convert 160+ world currencies using live mid-market exchange rates.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRates}
          disabled={loading}
          className="theme-toggle-btn inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition disabled:opacity-50"
        >
          <span className={loading ? "animate-spin" : ""}>↻</span>
          {loading ? "Updating..." : "Refresh rates"}
        </button>
      </div>

      <div className="glass-subcard mt-6 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="currency-amount" className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
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
                    ? "border-[#b7f34b]/60 bg-[#b7f34b]/20 text-accent-primary"
                    : "border-border bg-surface text-muted hover:text-foreground"
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
          className="theme-input mt-2.5 w-full rounded-xl px-4 py-3 text-xl sm:text-2xl font-semibold outline-none transition focus:border-[#b7f34b]"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <label className="block text-xs font-medium text-muted">
            From
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="theme-select mt-1.5 w-full rounded-xl px-3.5 py-3 text-sm sm:text-base font-medium outline-none transition focus:border-[#b7f34b]"
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
              className="theme-toggle-btn w-full sm:w-auto rounded-xl border px-4 py-2.5 sm:py-3 text-sm font-semibold text-accent-primary transition"
            >
              <span className="sm:hidden">⇅ Swap</span>
              <span className="hidden sm:inline">⇄</span>
            </button>
          </div>

          <label className="block text-xs font-medium text-muted">
            To
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="theme-select mt-1.5 w-full rounded-xl px-3.5 py-3 text-sm sm:text-base font-medium outline-none transition focus:border-[#b7f34b]"
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

        <div className="mt-5 rounded-xl border border-[#b7f34b]/25 bg-[#b7f34b]/[0.08] p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {amount || "0"} {from} equals
          </p>
          <p className="mt-1.5 break-words text-3xl sm:text-4xl font-bold text-accent-primary">
            {loading && !data ? "Loading..." : convertedValue !== null ? formatCurrencyValue(convertedValue, to) : "—"}
          </p>
          {exchangeRate !== null ? (
            <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
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
              className="glass-subcard rounded-2xl p-3.5 text-left transition hover:border-[#b7f34b]/50"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{item.code}</p>
              <p className="mt-1.5 truncate text-base sm:text-lg font-semibold text-foreground">
                {formatCurrencyValue(item.value, item.code)}
              </p>
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>{data?.updatedAt ? `Rates updated: ${data.updatedAt}` : "Fetching live rates..."}</span>
        {data?.source ? <span>Source: {data.source}</span> : null}
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      ) : null}
    </ToolShell>
  );
}
