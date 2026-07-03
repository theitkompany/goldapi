import { NextResponse } from "next/server";
import { readHistoryStore, updateHistoryStore } from "./historyStorage";

const MALABAR_URL =
  "https://www.malabargoldanddiamonds.com/graphql-magento?query=query%20getMetalRate($filter%3A%20MetalRateFilterInput)%20%7B%20getMetalRate(filter%3A%20$filter)%20%7B%20items%20%7B%20entry_date%20entry_time%20purity%20unit%20rate%20country%20state%20%7D%20%7D%20%7D&variables=%7B%22filter%22%3A%7B%22metal_type%22%3A%22gold%22,%22country%22:%22India%22%7D%7D";

type MalabarItem = {
  purity?: string;
  rate?: string;
  entry_date?: string;
  entry_time?: string;
};

type MalabarResponse = {
  data?: {
    getMetalRate?: {
      items?: MalabarItem[];
    };
  };
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

export async function GET() {
  try {
    const response = await fetch(MALABAR_URL, {
      headers: {
        Accept: "application/json",
        Referer: "https://www.malabargoldanddiamonds.com/in/pan-india/en/live-gold-rate.html",
      },
      next: {
        revalidate: 60,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Unable to fetch gold prices from upstream." },
        { status: 502 }
      );
    }

    const data = (await response.json()) as MalabarResponse;
    const items = data?.data?.getMetalRate?.items ?? [];

    const rates: GoldApiResponse["rates"] = {
      "18k": 0,
      "22k": 0,
      "24k": 0,
    };

    let updatedDate = "";
    let updatedTime = "";

    for (const item of items) {
      if (!item.purity || !item.rate) continue;
      const key = item.purity.toLowerCase() as keyof GoldApiResponse["rates"];
      const value = Number(item.rate);
      if (Number.isFinite(value) && key in rates) {
        rates[key] = value;
      }
      if (!updatedDate && item.entry_date) {
        updatedDate = item.entry_date.split(" ")[0];
      }
      if (!updatedTime && item.entry_time) {
        updatedTime = item.entry_time;
      }
    }

    const previousStore = await readHistoryStore();
    const previous = previousStore.previous;

    const payload: GoldApiResponse = {
      updatedDate,
      updatedTime,
      rates,
      previousDate: previous?.date ?? "",
      previousTime: previous?.updatedTime ?? "",
      previousRates: previous?.rates ?? {
        "18k": 0,
        "22k": 0,
        "24k": 0,
      },
    };

    if (updatedDate && updatedTime) {
      await updateHistoryStore({
        date: updatedDate,
        updatedTime,
        rates,
      });
    }

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to load gold prices. Please try again." },
      { status: 500 }
    );
  }
}
