import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type {
  MospiCPIFile,
  MospiSubGroup,
  MospiCoverage,
  MonthlyDataPoint,
  HCESWeightsFile,
} from '../types/india';

const BASE = import.meta.env.BASE_URL;

interface UseMospiDataReturn {
  getSubGroupSeries: (subGroup: MospiSubGroup, coverage?: MospiCoverage) => MonthlyDataPoint[];
  getHCESWeights: (coverage?: MospiCoverage) => Record<MospiSubGroup, number>;
  calculatePurchasingPower: (
    amount: number,
    fromYear: number,
    fromMonth: number,
  ) => Record<MospiSubGroup, { then: number; now: number; erosion: number }>;
  getMonthlyChange: (subGroup: MospiSubGroup, coverage?: MospiCoverage) => MonthlyDataPoint[];
  getLatestValue: (subGroup: MospiSubGroup, coverage?: MospiCoverage) => MonthlyDataPoint | null;
  isLoading: boolean;
  error: string | null;
}

export function useMospiData(): UseMospiDataReturn {
  const [cpiData, setCpiData] = useState<MospiCPIFile | null>(null);
  const [weightsData, setWeightsData] = useState<HCESWeightsFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchAll() {
      try {
        const [cpiResp, weightsResp] = await Promise.all([
          fetch(`${BASE}data/mospi_cpi.json`),
          fetch(`${BASE}data/hces_weights.json`),
        ]);

        if (!cpiResp.ok) {
          throw new Error(`Failed to fetch MOSPI CPI data: ${cpiResp.status}`);
        }

        const cpi = (await cpiResp.json()) as MospiCPIFile;
        setCpiData(cpi);

        if (weightsResp.ok) {
          const weights = (await weightsResp.json()) as HCESWeightsFile;
          setWeightsData(weights);
        }

        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load MOSPI data';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchAll();
  }, []);

  const getSubGroupSeries = useCallback(
    (subGroup: MospiSubGroup, coverage: MospiCoverage = 'all_india'): MonthlyDataPoint[] => {
      if (!cpiData) return [];
      return cpiData.coverage[coverage]?.[subGroup] ?? [];
    },
    [cpiData],
  );

  const getHCESWeights = useCallback(
    (coverage: MospiCoverage = 'all_india'): Record<MospiSubGroup, number> => {
      const defaultWeights: Record<MospiSubGroup, number> = {
        general: 100,
        food_beverages: 39.06,
        fuel_light: 6.84,
        clothing: 6.08,
        education: 4.46,
        health: 7.0,
        housing: 10.07,
        miscellaneous: 26.49,
      };

      if (!weightsData) return defaultWeights;

      if (coverage === 'rural') return weightsData.ruralWeights as Record<MospiSubGroup, number>;
      if (coverage === 'urban') return weightsData.urbanWeights as Record<MospiSubGroup, number>;
      return weightsData.weights as Record<MospiSubGroup, number>;
    },
    [weightsData],
  );

  const calculatePurchasingPower = useCallback(
    (
      amount: number,
      fromYear: number,
      fromMonth: number,
    ): Record<MospiSubGroup, { then: number; now: number; erosion: number }> => {
      const subGroups: MospiSubGroup[] = [
        'food_beverages',
        'fuel_light',
        'clothing',
        'education',
        'health',
        'housing',
        'miscellaneous',
      ];

      const result = {} as Record<MospiSubGroup, { then: number; now: number; erosion: number }>;

      for (const sg of subGroups) {
        const series = getSubGroupSeries(sg);
        if (series.length === 0) {
          result[sg] = { then: amount, now: amount, erosion: 0 };
          continue;
        }

        const fromPoint = series.find((p) => p.year === fromYear && p.month === fromMonth);
        const latestPoint = series[series.length - 1];

        if (!fromPoint?.indexed || !latestPoint?.indexed) {
          result[sg] = { then: amount, now: amount, erosion: 0 };
          continue;
        }

        const currentValue = (amount * fromPoint.indexed) / latestPoint.indexed;
        const erosion = ((amount - currentValue) / amount) * 100;

        result[sg] = {
          then: amount,
          now: Math.round(currentValue * 100) / 100,
          erosion: Math.round(erosion * 100) / 100,
        };
      }

      // Add general (overall)
      const generalSeries = getSubGroupSeries('general');
      if (generalSeries.length > 0) {
        const fromPoint = generalSeries.find((p) => p.year === fromYear && p.month === fromMonth);
        const latestPoint = generalSeries[generalSeries.length - 1];
        if (fromPoint?.indexed && latestPoint?.indexed) {
          const currentValue = (amount * fromPoint.indexed) / latestPoint.indexed;
          const erosion = ((amount - currentValue) / amount) * 100;
          result.general = {
            then: amount,
            now: Math.round(currentValue * 100) / 100,
            erosion: Math.round(erosion * 100) / 100,
          };
        } else {
          result.general = { then: amount, now: amount, erosion: 0 };
        }
      }

      return result;
    },
    [getSubGroupSeries],
  );

  const getMonthlyChange = useCallback(
    (subGroup: MospiSubGroup, coverage: MospiCoverage = 'all_india'): MonthlyDataPoint[] => {
      const series = getSubGroupSeries(subGroup, coverage);
      if (series.length < 2) return [];

      const changes: MonthlyDataPoint[] = [];
      for (let i = 1; i < series.length; i++) {
        const prev = series[i - 1];
        const curr = series[i];

        if (prev.indexed != null && curr.indexed != null && prev.indexed !== 0) {
          const momChange = ((curr.indexed - prev.indexed) / prev.indexed) * 100;
          changes.push({
            year: curr.year,
            month: curr.month,
            value: Math.round(momChange * 100) / 100,
            indexed: curr.indexed,
          });
        } else {
          changes.push({
            year: curr.year,
            month: curr.month,
            value: null,
            indexed: null,
          });
        }
      }

      return changes;
    },
    [getSubGroupSeries],
  );

  const getLatestValue = useCallback(
    (subGroup: MospiSubGroup, coverage: MospiCoverage = 'all_india'): MonthlyDataPoint | null => {
      const series = getSubGroupSeries(subGroup, coverage);
      if (series.length === 0) return null;
      return series[series.length - 1];
    },
    [getSubGroupSeries],
  );

  return useMemo(
    () => ({
      getSubGroupSeries,
      getHCESWeights,
      calculatePurchasingPower,
      getMonthlyChange,
      getLatestValue,
      isLoading,
      error,
    }),
    [getSubGroupSeries, getHCESWeights, calculatePurchasingPower, getMonthlyChange, getLatestValue, isLoading, error],
  );
}
