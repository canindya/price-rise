import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { Category, CategoryDataFile, DataPoint, PPPFactorsFile, TimeRange } from '../types/index';
import { filterByTimeRange, calculateChange } from '../utils/dataTransforms';

interface CountryDataState {
  overall_cpi: CategoryDataFile | null;
  food_cpi: CategoryDataFile | null;
  energy_benchmark: CategoryDataFile | null;
  energy_retail: CategoryDataFile | null;
  education_spend: CategoryDataFile | null;
}

const CATEGORY_FILES: Record<Category, string> = {
  overall_cpi: '/data/world_cpi.json',
  food_cpi: '/data/food_cpi.json',
  energy_benchmark: '/data/energy_benchmark.json',
  energy_retail: '/data/energy_retail.json',
  education_spend: '/data/education_spend.json',
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

        setData({
          overall_cpi: overallCpi,
          food_cpi: foodCpi,
          energy_benchmark: energyBenchmark,
          energy_retail: energyRetail,
          education_spend: educationSpend,
        });

        // Fetch PPP factors separately (non-blocking for main data)
        try {
          const pppResp = await fetch('/data/ppp_factors.json');
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
