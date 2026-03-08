import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { Category, CategoryDataFile, DataPoint, PPPFactorsFile, TimeRange } from '../types/index';
import { filterByTimeRange, calculateChange } from '../utils/dataTransforms';

/** ISO-2 -> ISO-3 mapping for energy_retail data which uses ISO-2 codes */
const ISO2_TO_ISO3: Record<string, string> = {
  US: 'USA', CA: 'CAN', MX: 'MEX', BR: 'BRA', AR: 'ARG', CO: 'COL', CL: 'CHL',
  GB: 'GBR', DE: 'DEU', FR: 'FRA', IT: 'ITA', ES: 'ESP', NL: 'NLD', SE: 'SWE',
  NO: 'NOR', CH: 'CHE', PL: 'POL', CZ: 'CZE', TR: 'TUR', RU: 'RUS',
  CN: 'CHN', JP: 'JPN', KR: 'KOR', IN: 'IND', ID: 'IDN', TH: 'THA', MY: 'MYS',
  SG: 'SGP', AU: 'AUS', NZ: 'NZL', SA: 'SAU', AE: 'ARE', IL: 'ISR', EG: 'EGY',
  ZA: 'ZAF', NG: 'NGA', KE: 'KEN', GH: 'GHA', PK: 'PAK', BD: 'BGD', PH: 'PHL',
};

/** Re-key a countries record from ISO-2 to ISO-3 codes */
function rekeyToISO3(countries: Record<string, DataPoint[]>): Record<string, DataPoint[]> {
  const result: Record<string, DataPoint[]> = {};
  for (const [code, series] of Object.entries(countries)) {
    const iso3 = ISO2_TO_ISO3[code] ?? code;
    result[iso3] = series;
  }
  return result;
}

interface CountryDataState {
  overall_cpi: CategoryDataFile | null;
  food_cpi: CategoryDataFile | null;
  energy_benchmark: CategoryDataFile | null;
  energy_retail: CategoryDataFile | null;
  education_spend: CategoryDataFile | null;
}

const BASE = import.meta.env.BASE_URL;

const CATEGORY_FILES: Record<Category, string> = {
  overall_cpi: `${BASE}data/world_cpi.json`,
  food_cpi: `${BASE}data/food_cpi.json`,
  energy_benchmark: `${BASE}data/energy_benchmark.json`,
  energy_retail: `${BASE}data/energy_retail.json`,
  education_spend: `${BASE}data/education_spend.json`,
};

interface UseCountryDataReturn {
  getCountrySeries: (countryCode: string, category: Category) => DataPoint[];
  getWorldAverage: (category: Category) => DataPoint[];
  getAllCountriesChange: (
    category: Category,
    timeRange: TimeRange,
    customRange?: { startYear: number; endYear: number },
  ) => Record<string, number>;
  getPPPFactor: (countryCode: string, year: number) => number | null;
  pppFactors: PPPFactorsFile | null;
  isLoading: boolean;
  error: string | null;
}

export function useCountryData(): UseCountryDataReturn {
  const [data, setData] = useState<CountryDataState>({
    overall_cpi: null,
    food_cpi: null,
    energy_benchmark: null,
    energy_retail: null,
    education_spend: null,
  });
  const [pppFactors, setPPPFactors] = useState<PPPFactorsFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchAll() {
      try {
        const categories: Category[] = [
          'overall_cpi',
          'food_cpi',
          'energy_benchmark',
          'energy_retail',
          'education_spend',
        ];
        const responses = await Promise.all(
          categories.map((cat) => fetch(CATEGORY_FILES[cat])),
        );

        for (const res of responses) {
          if (!res.ok) {
            throw new Error(`Failed to fetch ${res.url}: ${res.status}`);
          }
        }

        const [overallCpi, foodCpi, energyBenchmark, energyRetail, educationSpend] = (await Promise.all(
          responses.map((r) => r.json()),
        )) as [CategoryDataFile, CategoryDataFile, CategoryDataFile, CategoryDataFile, CategoryDataFile];

        // Re-key energy_retail from ISO-2 to ISO-3 codes
        energyRetail.countries = rekeyToISO3(energyRetail.countries);

        // energy_benchmark has only a "WORLD" key (global oil prices).
        // Copy that series to every country so per-country lookups work.
        const worldOil = energyBenchmark.countries['WORLD'];
        if (worldOil) {
          // Get all ISO-3 country codes from the main CPI dataset
          for (const code of Object.keys(overallCpi.countries)) {
            if (code !== 'WORLD') {
              energyBenchmark.countries[code] = worldOil;
            }
          }
        }

        setData({
          overall_cpi: overallCpi,
          food_cpi: foodCpi,
          energy_benchmark: energyBenchmark,
          energy_retail: energyRetail,
          education_spend: educationSpend,
        });

        // Fetch PPP factors separately (non-blocking for main data)
        try {
          const pppResp = await fetch(`${BASE}data/ppp_factors.json`);
          if (pppResp.ok) {
            const pppData = (await pppResp.json()) as PPPFactorsFile;
            setPPPFactors(pppData);
          }
        } catch {
          // PPP data is optional - silently ignore failures
        }

        setError(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load data';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchAll();
  }, []);

  const getCountrySeries = useCallback(
    (countryCode: string, category: Category): DataPoint[] => {
      const categoryData = data[category];
      if (!categoryData) return [];
      return categoryData.countries[countryCode] ?? [];
    },
    [data],
  );

  const getWorldAverage = useMemo(() => {
    const cache = new Map<Category, DataPoint[]>();

    return (category: Category): DataPoint[] => {
      const cached = cache.get(category);
      if (cached) return cached;

      const categoryData = data[category];
      if (!categoryData) return [];

      // Collect all indexed values grouped by year
      const yearMap = new Map<number, number[]>();

      for (const series of Object.values(categoryData.countries)) {
        for (const dp of series) {
          if (dp.indexed != null) {
            const arr = yearMap.get(dp.year);
            if (arr) {
              arr.push(dp.indexed);
            } else {
              yearMap.set(dp.year, [dp.indexed]);
            }
          }
        }
      }

      const result: DataPoint[] = Array.from(yearMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([year, values]) => ({
          year,
          value: null,
          indexed: values.reduce((sum, v) => sum + v, 0) / values.length,
        }));

      cache.set(category, result);
      return result;
    };
  }, [data]);

  const getAllCountriesChange = useMemo(() => {
    return (category: Category, timeRange: TimeRange, customRange?: { startYear: number; endYear: number }): Record<string, number> => {
      const categoryData = data[category];
      if (!categoryData) return {};

      const result: Record<string, number> = {};

      for (const [countryCode, series] of Object.entries(
        categoryData.countries,
      )) {
        const filtered = filterByTimeRange(series, timeRange, undefined, customRange);
        const change = calculateChange(filtered);
        if (change !== null) {
          result[countryCode] = change.totalPct;
        }
      }

      return result;
    };
  }, [data]);

  const getPPPFactor = useCallback(
    (countryCode: string, year: number): number | null => {
      if (!pppFactors) return null;
      const countryFactors = pppFactors.countries[countryCode];
      if (!countryFactors) return null;
      const entry = countryFactors.find((f) => f.year === year);
      return entry?.value ?? null;
    },
    [pppFactors],
  );

  return {
    getCountrySeries,
    getWorldAverage,
    getAllCountriesChange,
    getPPPFactor,
    pppFactors,
    isLoading,
    error,
  };
}
