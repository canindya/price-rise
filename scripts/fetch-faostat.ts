/**
 * Fetches Food CPI from FAOSTAT.
 * Includes retry logic (3 attempts) and fallback to World Bank food price index.
 * Outputs to public/data/food_cpi.json
 */

import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { COUNTRIES, FAO_MAP } from "./country-list.js";
import type { CategoryDataFile, DataPoint } from "../src/types/index.js";

const BASE_YEAR = 2015;
const OUT_DIR = resolve(import.meta.dirname, "..", "public", "data");
const OUT_FILE = resolve(OUT_DIR, "food_cpi.json");
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function reindex(points: DataPoint[]): DataPoint[] {
  const basePoint = points.find(p => p.year === BASE_YEAR);
  const baseValue = basePoint?.value ?? null;

  return points.map(p => ({
    ...p,
    indexed:
      p.value != null && baseValue != null && baseValue !== 0
        ? Math.round((p.value / baseValue) * 100 * 100) / 100
        : null,
  }));
}

async function fetchWithRetry(url: string, attempt = 1): Promise<Response> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }
    return resp;
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      console.warn(`  Attempt ${attempt} failed: ${(err as Error).message}. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await sleep(RETRY_DELAY_MS);
      return fetchWithRetry(url, attempt + 1);
    }
    throw err;
  }
}

interface FAODataItem {
  Area_Code: number;
  Area: string;
  Year: number;
  Value: number | string | null;
}

async function fetchFAOSTAT(): Promise<Record<string, DataPoint[]> | null> {
  console.log("[FAOSTAT] Fetching Food CPI data...");

  // Build area codes list from our country list
  const areaCodes = COUNTRIES.map(c => c.faoCode).join(",");
  const years = Array.from({ length: 26 }, (_, i) => 2000 + i).join(",");

  // FAOSTAT CP domain, element 11 = Food CPI
  const url =
    `https://fenixservices.fao.org/faostat/api/v1/en/data/CP?area=${areaCodes}&element=11&year=${years}&output_type=objects`;

  try {
    const resp = await fetchWithRetry(url);
    const json = await resp.json() as { data: FAODataItem[] };

    if (!json.data || json.data.length === 0) {
      console.warn("[FAOSTAT] No data returned");
      return null;
    }

    console.log(`  Received ${json.data.length} data points from FAOSTAT`);

    // Group by FAO area code
    const byCountry = new Map<number, Map<number, number | null>>();

    for (const item of json.data) {
      const code = item.Area_Code;
      if (!FAO_MAP.has(code)) continue;

      if (!byCountry.has(code)) {
        byCountry.set(code, new Map());
      }

      const val = item.Value != null ? Number(item.Value) : null;
      byCountry.get(code)!.set(item.Year, isNaN(val as number) ? null : val);
    }

    // Convert to output format keyed by ISO-3
    const countries: Record<string, DataPoint[]> = {};

    for (const [faoCode, yearMap] of byCountry) {
      const info = FAO_MAP.get(faoCode);
      if (!info) continue;

      const points: DataPoint[] = [];
      for (let year = 2000; year <= 2025; year++) {
        const value = yearMap.get(year) ?? null;
        points.push({ year, value, indexed: null });
      }

      countries[info.iso3] = reindex(points);
    }

    return countries;
  } catch (err) {
    console.error("[FAOSTAT] Failed after retries:", (err as Error).message);
    return null;
  }
}

async function fetchWorldBankFoodFallback(): Promise<Record<string, DataPoint[]>> {
  console.log("[FAOSTAT Fallback] Trying World Bank food price index...");

  // World Bank food price indicator: try AG.PRD.FOOD.XD (food production index)
  // and FP.CPI.TOTL as a rough proxy
  const indicators = ["AG.PRD.FOOD.XD", "FP.CPI.TOTL"];
  const validIso2 = new Set(COUNTRIES.map(c => c.iso2));
  const countries: Record<string, DataPoint[]> = {};

  for (const indicator of indicators) {
    try {
      const url = `https://api.worldbank.org/v2/country/all/indicator/${indicator}?format=json&date=2000:2025&per_page=5000`;
      const resp = await fetch(url);
      if (!resp.ok) continue;

      const json = await resp.json() as [unknown, Array<{
        country: { id: string };
        date: string;
        value: number | null;
      }> | null];

      const data = json[1];
      if (!data || data.length === 0) continue;

      const byCountry = new Map<string, Map<number, number | null>>();
      for (const entry of data) {
        const iso2 = entry.country.id;
        if (!validIso2.has(iso2)) continue;
        if (!byCountry.has(iso2)) byCountry.set(iso2, new Map());
        byCountry.get(iso2)!.set(parseInt(entry.date), entry.value);
      }

      for (const [iso2, yearMap] of byCountry) {
        const info = COUNTRIES.find(c => c.iso2 === iso2);
        if (!info || countries[info.iso3]) continue;

        const points: DataPoint[] = [];
        for (let year = 2000; year <= 2025; year++) {
          points.push({ year, value: yearMap.get(year) ?? null, indexed: null });
        }
        countries[info.iso3] = reindex(points);
      }

      if (Object.keys(countries).length > 0) {
        console.log(`  Fallback: Got ${Object.keys(countries).length} countries from ${indicator}`);
        break;
      }
    } catch {
      continue;
    }
  }

  return countries;
}

export async function fetchFoodCPI(): Promise<void> {
  let countries = await fetchFAOSTAT();

  if (!countries || Object.keys(countries).length === 0) {
    console.warn("[FAOSTAT] Using World Bank fallback");
    countries = await fetchWorldBankFoodFallback();
  }

  const output: CategoryDataFile = {
    baseYear: BASE_YEAR,
    lastUpdated: new Date().toISOString().split("T")[0],
    source: countries && Object.keys(countries).length > 0
      ? "FAO - Consumer Price Indices: Food"
      : "Fallback: World Bank food-related indicators",
    countries: countries ?? {},
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(`  Wrote ${Object.keys(output.countries).length} countries to ${OUT_FILE}`);
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  fetchFoodCPI();
}
