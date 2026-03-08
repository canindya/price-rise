/**
 * Fetches PPP conversion factor data (PA.NUS.PPP) from the World Bank API.
 * PPP conversion factor, GDP (LCU per international $).
 * Outputs to public/data/ppp_factors.json
 */

import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { COUNTRIES, ISO2_MAP } from "./country-list.js";

const INDICATOR = "PA.NUS.PPP";
const BASE_URL = `https://api.worldbank.org/v2/country/all/indicator/${INDICATOR}`;
const OUT_DIR = resolve(import.meta.dirname, "..", "public", "data");
const OUT_FILE = resolve(OUT_DIR, "ppp_factors.json");

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
    console.log(`  Fetching World Bank PPP page ${page}/${totalPages}...`);

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

export async function fetchPPPFactors(): Promise<void> {
  console.log("[World Bank] Fetching PPP conversion factor data...");

  try {
    const rawData = await fetchAllPages();
    console.log(`  Received ${rawData.length} data points`);

    // Build a set of valid ISO-2 codes from our country list
    const validIso2 = new Set(COUNTRIES.map(c => c.iso2));

    // Group by country ISO-3 code
    const countries: Record<string, { year: number; value: number }[]> = {};

    for (const entry of rawData) {
      const iso2 = entry.country.id;
      if (!validIso2.has(iso2)) continue;
      if (entry.value === null) continue;

      const countryInfo = ISO2_MAP.get(iso2);
      if (!countryInfo) continue;

      const iso3 = countryInfo.iso3;
      if (!countries[iso3]) {
        countries[iso3] = [];
      }

      countries[iso3].push({
        year: parseInt(entry.date),
        value: entry.value,
      });
    }

    // Sort each country's data by year
    for (const iso3 of Object.keys(countries)) {
      countries[iso3].sort((a, b) => a.year - b.year);
    }

    const output = { countries };

    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
    console.log(`  Wrote PPP factors for ${Object.keys(countries).length} countries to ${OUT_FILE}`);
  } catch (err) {
    console.error("[World Bank PPP] ERROR:", (err as Error).message);
    console.warn("[World Bank PPP] Creating empty fallback file");

    const fallback = { countries: {} };
    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(OUT_FILE, JSON.stringify(fallback, null, 2));
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  fetchPPPFactors();
}
