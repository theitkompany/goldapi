import { NextResponse } from "next/server";

const SILVER_PRICES_URL = "https://api.oropocket.com/public/prices";

type SilverPriceResponse = {
  data?: {
    silver?: {
      buy?: number;
      sell?: number;
      currency?: string;
      unit?: string;
      change24h?: { buy?: number; sell?: number };
    };
    timestamp?: string;
  };
};

export async function GET() {
  try {
    const response = await fetch(SILVER_PRICES_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Unable to fetch silver prices from upstream." }, { status: 502 });
    }

    const payload = (await response.json()) as SilverPriceResponse;
    const silver = payload.data?.silver;
    if (!silver || typeof silver.sell !== "number" || !Number.isFinite(silver.sell)) {
      return NextResponse.json({ message: "Silver price was missing from the upstream response." }, { status: 502 });
    }

    return NextResponse.json({
      price: silver.sell,
      buyPrice: silver.buy ?? null,
      currency: silver.currency ?? "INR",
      unit: silver.unit ?? "gram",
      change24h: silver.change24h?.sell ?? null,
      timestamp: payload.data?.timestamp ?? null,
    });
  } catch {
    return NextResponse.json({ message: "Unable to load silver prices. Please try again." }, { status: 500 });
  }
}
