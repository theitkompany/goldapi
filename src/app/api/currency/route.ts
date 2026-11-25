import { NextResponse } from "next/server";

type OpenErResponse = {
  result?: string;
  base_code?: string;
  time_last_update_utc?: string;
  rates?: Record<string, number>;
};

type FrankfurterResponse = {
  base?: string;
  date?: string;
  rates?: Record<string, number>;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawBase = (searchParams.get("base") ?? "USD").toUpperCase();
  const base = /^[A-Z]{3}$/.test(rawBase) ? rawBase : "USD";

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
      next: { revalidate: 1800 },
    });

    if (response.ok) {
      const data = (await response.json()) as OpenErResponse;
      if (data.result === "success" && data.rates) {
        return NextResponse.json({
          base: data.base_code ?? base,
          updatedAt: data.time_last_update_utc ?? new Date().toUTCString(),
          rates: data.rates,
          source: "open.er-api.com",
        });
      }
    }
  } catch {
    // Fall through to secondary free API
  }

  try {
    const fallback = await fetch(`https://api.frankfurter.app/latest?from=${base}`, {
      next: { revalidate: 1800 },
    });

    if (fallback.ok) {
      const data = (await fallback.json()) as FrankfurterResponse;
      if (data.rates) {
        return NextResponse.json({
          base: data.base ?? base,
          updatedAt: data.date ?? new Date().toISOString(),
          rates: { [base]: 1, ...data.rates },
          source: "frankfurter.app",
        });
      }
    }
  } catch {
    // Both upstream providers failed
  }

  return NextResponse.json(
    { error: "Unable to fetch live exchange rates right now." },
    { status: 502 }
  );
}
