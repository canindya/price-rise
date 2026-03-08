/**
 * Fetches / provides Brent crude oil benchmark price data.
 * Global series (not per-country), keyed under "WORLD".
 * Indexed to 2015=100.
 * Outputs to public/data/energy_benchmark.json
 */

import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import type { CategoryDataFile, DataPoint } from "../src/types/index.js";

const BASE_YEAR = 2015;
const OUT_DIR = resolve(import.meta.dirname, "..", "public", "data");
const OUT_FILE = resolve(OUT_DIR, "energy_benchmark.json");

/**
 * Brent crude oil annual average prices (USD/barrel).
 * Sources: EIA, World Bank Commodity Price Data (Pink Sheet).
 */
const BRENT_ANNUAL_PRICES: Record<number, number> = {
  2000: 28.50,
  2001: 24.44,
  2002: 25.02,
  2003: 28.83,
  2004: 38.27,
  2005: 54.52,
  2006: 65.14,
  2007: 72.39,
  2008: 97.26,
  2009: 61.67,
  2010: 79.61,
  2011: 111.26,
  2012: 111.67,
  2013: 108.66,
  2014: 98.97,
  2015: 52.32,
  2016: 43.73,
  2017: 54.19,
  2018: 71.34,
  2019: 64.21,
  2020: 41.84,
  2021: 70.68,
  2022: 99.04,
  2023: 82.49,
  2024: 80.75,
  2025: 74.50,
};

async function tryWorldBankCommodity(): Promise<Record<number, number> | null> {
  console.log("  Trying World Bank commodity API...");
  try {
    // World Bank crude oil price indicator
    const url =
      "https://api.worldbank.org/v2/country/WLD/indicator/EP.CRD.PPER.CD?format=json&date=2000:2025&per_page=500";
    const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!resp.ok) return null;

    const json = await resp.json() as [unknown, Array<{
      date: string;
      value: number | null;
    }> | null];

    const data = json[1];
    if (!data || data.length === 0) return null;

    const prices: Record<number, number> = {};
    for (const entry of data) {
      if (entry.value != null) {
        prices[parseInt(entry.date)] = entry.value;
      }
    }

    if (Object.keys(prices).length < 10) return null;
    console.log(`  Got ${Object.keys(prices).length} years from World Bank`);
    return prices;
  } catch {
    return null;
  }
}

export async function fetchEnergyBenchmark(): Promise<void> {
  console.log("[Energy] Fetching Brent crude benchmark data...");

  // Try live API first, fall back to static data
  let prices = await tryWorldBankCommodity();

  if (!prices) {
    console.log("  Using static Brent crude price data");
    prices = BRENT_ANNUAL_PRICES;
  }

  const baseValue = prices[BASE_YEAR];
  if (!baseValue) {
    console.error("[Energy] No base year value for 2015!");
    return;
  }

  const points: DataPoint[] = [];
  for (let year = 2000; year <= 2025; year++) {
    const value = prices[year] ?? null;
    points.push({
      year,
      value,
      indexed:
        value != null
          ? Math.round((value / baseValue) * 100 * 100) / 100
          : null,
    });
  }

  const output: CategoryDataFile = {
    baseYear: BASE_YEAR,
    lastUpdated: new Date().toISOString().split("T")[0],
    source: "Brent Crude Oil Annual Average (USD/barrel) - EIA / World Bank",
    countries: {
      WORLD: points,
    },
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(`  Wrote energy benchmark to ${OUT_FILE}`);
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  fetchEnergyBenchmark();
}
