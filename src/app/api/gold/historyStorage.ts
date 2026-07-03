import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";

export type GoldRates = {
  "18k": number;
  "22k": number;
  "24k": number;
};

export type HistoryRecord = {
  date: string;
  updatedTime: string;
  rates: GoldRates;
};

export type HistoryStore = {
  latest: HistoryRecord | null;
  previous: HistoryRecord | null;
};

const HISTORY_FILE_PATH = path.join(tmpdir(), "gold-price-history.json");

const emptyRates: GoldRates = {
  "18k": 0,
  "22k": 0,
  "24k": 0,
};

const emptyStore: HistoryStore = {
  latest: null,
  previous: null,
};

export async function readHistoryStore(): Promise<HistoryStore> {
  try {
    const raw = await fs.readFile(HISTORY_FILE_PATH, "utf8");
    return JSON.parse(raw) as HistoryStore;
  } catch {
    return emptyStore;
  }
}

export async function writeHistoryStore(store: HistoryStore): Promise<void> {
  await fs.writeFile(HISTORY_FILE_PATH, JSON.stringify(store), "utf8");
}

export async function updateHistoryStore(record: HistoryRecord): Promise<void> {
  const store = await readHistoryStore();
  if (!store.latest || store.latest.date !== record.date) {
    await writeHistoryStore({ latest: record, previous: store.latest ?? store.previous });
    return;
  }

  await writeHistoryStore({ latest: record, previous: store.previous });
}

export async function getPreviousHistoryRecord(): Promise<HistoryRecord | null> {
  const store = await readHistoryStore();
  return store.previous;
}
