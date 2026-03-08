/**
 * Fetches education expenditure data (SE.XPD.TOTL.GD.ZS) from the World Bank API.
 * This indicator represents government expenditure on education as a % of GDP.
 * Normalizes to base year 2015=100.
 * Outputs to public/data/education_spend.json
 */

import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { COUNTRIES, ISO2_MAP } from "./country-list.js";
import type { CategoryDataFile, DataPoint } from "../src/types/index.js";

const INDICATOR = "SE.XPD.TOTL.GD.ZS";
const BASE_URL = `https://api.worldbank.org/v2/country/all/indicator/${INDICATOR}`;
const BASE_YEAR = 2015;
const OUT_DIR = resolve(import.meta.dirname, "..", "public", "data");
const OUT_FILE = resolve(OUT_DIR, "education_spend.json");

interface WBPageInfo {
  page: number;
  pages: number;
  per_page: string;
  total: number;
}

interface WBDataEntry {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
}

async function fetchAllPages(): Promise<WBDataEntry[]> {
  const allData: WBDataEntry[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${BASE_URL}?format=json&date=2000:2025&per_page=5000&page=${page}`;
    console.log(`  Fetching World Bank page ${page}/${totalPages}...`);

    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`World Bank API error: ${resp.status} ${resp.statusText}`);
    }

    const json = await resp.json() as [WBPageInfo, WBDataEntry[] | null];
    const [pageInfo, data] = json;

    totalPages = pageInfo.pages;

    if (data) {
      allData.push(...data);
    }

    page++;
  }

  return allData;
}

function reindex(points: DataPoint[]): DataPoint[] {
  const basePoint = points.find(p => p.year === BASE_YEAR);
  const baseValue = basePoint?.value ?? null;

  return points.map(p => ({
    ...p,
    indexed: p.value != null && baseValue != null && baseValue !== 0
      ? Math.round((p.value / baseValue) * 100 * 100) / 100
      : null,
  }));
}

export async function fetchEducationSpend(): Promise<void> {
  console.log("[World Bank] Fetching education expenditure data (SE.XPD.TOTL.GD.ZS)...");

  try {
    const rawData = await fetchAllPages();
    console.log(`  Received ${rawData.length} data points`);

    // Build a set of valid ISO-2 codes from our country list
    const validIso2 = new Set(COUNTRIES.map(c => c.iso2));

    // Group by country ISO-2 code
    const byCountry = new Map<string, Map<number, number | null>>();

    for (const entry of rawData) {
      const iso2 = entry.country.id;
      if (!validIso2.has(iso2)) continue;

      if (!byCountry.has(iso2)) {
        byCountry.set(iso2, new Map());
      }
      byCountry.get(iso2)!.set(parseInt(entry.date), entry.value);
    }

    // Build output keyed by ISO-3
    const countries: Record<string, DataPoint[]> = {};

    for (const [iso2, yearMap] of byCountry) {
      const countryInfo = ISO2_MAP.get(iso2);
      if (!countryInfo) continue;

      const points: DataPoint[] = [];
      for (let year = 2000; year <= 2025; year++) {
        const value = yearMap.get(year) ?? null;
        points.push({ year, value, indexed: null });
      }

      countries[countryInfo.iso3] = reindex(points);
    }

    const output: CategoryDataFile = {
      baseYear: BASE_YEAR,
      lastUpdated: new Date().toISOString().split("T")[0],
      source: "World Bank - SE.XPD.TOTL.GD.ZS (Government expenditure on education as % of GDP)",
      countries,
    };

    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
    console.log(`  Wrote ${Object.keys(countries).length} countries to ${OUT_FILE}`);
  } catch (err) {
    console.error("[World Bank] ERROR:", (err as Error).message);
    console.warn("[World Bank] Creating empty fallback file");

    const fallback: CategoryDataFile = {
      baseYear: BASE_YEAR,
      lastUpdated: new Date().toISOString().split("T")[0],
      source: "World Bank - SE.XPD.TOTL.GD.ZS (UNAVAILABLE)",
      countries: {},
    };

    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(OUT_FILE, JSON.stringify(fallback, null, 2));
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  fetchEducationSpend();
}
