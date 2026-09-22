"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SilverResponse = {
  price: number;
  currency: string;
  unit: string;
  change24h: number | null;
};

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
  const total = silver && Number.isFinite(amount) ? amount * silver.price : 0;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07090c] px-5 py-10 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/[0.08] bg-[#101318] p-6 sm:p-8">
        <Link href="/" className="text-sm text-[#b7f34b] hover:underline">← All tools</Link>
        <span className="mt-8 inline-flex rounded-full bg-[#1b3020] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#b7f34b]">Precious Metals</span>
        <h1 className="mt-4 text-3xl font-bold">Silver Converter</h1>
        <p className="mt-2 text-sm text-[#7b8493]">Calculate silver value using the current live INR price per gram.</p>
        <div className="mt-8 rounded-2xl border border-white/10 bg-[#0b0d10] p-5">
          <div className="flex items-center justify-between text-sm text-[#9ba3af]">
            <span>Live silver sell price</span>
            <span className="font-semibold text-[#b7f34b]">{silver ? `₹${silver.price.toFixed(2)} / ${silver.unit}` : "Loading..."}</span>
          </div>
          {silver?.change24h !== null && silver?.change24h !== undefined ? <p className="mt-2 text-xs text-[#7b8493]">24h change: {silver.change24h > 0 ? "+" : ""}{silver.change24h.toFixed(2)}%</p> : null}
          <label className="mt-6 block text-sm font-medium text-[#d9dee7]" htmlFor="silver-grams">Weight in grams</label>
          <input id="silver-grams" type="number" min="0" step="0.01" value={grams} onChange={(event) => setGrams(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#161a20] px-4 py-3 text-lg text-white outline-none focus:border-[#b7f34b]" />
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-sm text-[#7b8493]">Estimated value</p>
            <p className="mt-1 text-3xl font-bold text-[#b7f34b]">{silver ? `₹${total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "—"}</p>
          </div>
          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}
