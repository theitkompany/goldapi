import { NextResponse } from "next/server";
import { readHistoryStore } from "../historyStorage";

export async function GET() {
  const store = await readHistoryStore();
  return NextResponse.json(store);
}
