/**
 * Master build script - runs all data fetchers in sequence
 * and generates the country metadata manifest.
 */

import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { COUNTRIES } from "./country-list.js";
import { fetchWorldBankCPI } from "./fetch-world-bank.js";
import { fetchFoodCPI } from "./fetch-faostat.js";
import { fetchEnergyBenchmark } from "./fetch-energy.js";
import { fetchEnergyRetail } from "./fetch-energy-retail.js";
import { fetchEducationSpend } from "./fetch-education.js";
import { fetchGeoJSON } from "./fetch-geojson.js";
import { fetchPPPFactors } from "./fetch-ppp.js";
import type { CountryMeta } from "../src/types/index.js";

const OUT_DIR = resolve(import.meta.dirname, "..", "public", "data");

async function buildAll() {
  const startTime = Date.now();
  console.log("=== Global Cost of Living Tracker - Data Pipeline ===\n");

  // Step 1: World Bank CPI
  console.log("--- Step 1/8: World Bank CPI ---");
  await fetchWorldBankCPI();
  console.log();

  // Step 2: FAOSTAT Food CPI
  console.log("--- Step 2/8: FAOSTAT Food CPI ---");
  await fetchFoodCPI();
  console.log();

  // Step 3: Energy Benchmark
  console.log("--- Step 3/8: Energy Benchmark ---");
  await fetchEnergyBenchmark();
  console.log();

  // Step 4: Retail Energy Prices
  console.log("--- Step 4/8: Retail Energy Prices ---");
  await fetchEnergyRetail();
  console.log();

  // Step 5: Education Expenditure
  console.log("--- Step 5/8: Education Expenditure ---");
  await fetchEducationSpend();
  console.log();

  // Step 6: PPP Conversion Factors
  console.log("--- Step 6/8: PPP Conversion Factors ---");
  await fetchPPPFactors();
  console.log();

  // Step 7: GeoJSON
  console.log("--- Step 7/8: GeoJSON ---");
  await fetchGeoJSON();
  console.log();

  // Step 8: Country metadata manifest
  console.log("--- Step 8/8: Country Metadata ---");
  const countriesMeta: CountryMeta[] = COUNTRIES.map(c => ({
    code: c.iso2,
    name: c.name,
    iso3: c.iso3,
    region: c.region,
  }));

  mkdirSync(OUT_DIR, { recursive: true });
  const countriesFile = resolve(OUT_DIR, "countries.json");
  writeFileSync(countriesFile, JSON.stringify(countriesMeta, null, 2));
  console.log(`  Wrote ${countriesMeta.length} countries to ${countriesFile}`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== Done in ${elapsed}s ===`);
}

buildAll().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
