import type { DataPoint, TimeRange, ViewMode } from '../types/index';

/**
 * Filters a data series to only include data points within the specified time range.
 * @param series - Array of DataPoint objects
 * @param range - TimeRange: '1Y', '5Y', or '10Y'
 * @param currentYear - Optional override for the current year (defaults to current calendar year)
 */
export function filterByTimeRange(
  series: DataPoint[],
  range: TimeRange,
  currentYear?: number,
  customRange?: { startYear: number; endYear: number },
): DataPoint[] {
  if (range === 'custom' && customRange) {
    return series.filter(
      (dp) => dp.year >= customRange.startYear && dp.year <= customRange.endYear,
    );
  }

  const now = currentYear ?? new Date().getFullYear();
  const rangeYears: Record<string, number> = {
    '1Y': 1,
    '5Y': 5,
    '10Y': 10,
  };
  const cutoff = now - (rangeYears[range] ?? 10);
  return series.filter((dp) => dp.year >= cutoff && dp.year <= now);
}

/**
 * Re-indexes a series so that the specified base year has a value of 100.
 * All other values are scaled proportionally. If the base year is not found
 * or has a null value, the original series is returned unchanged.
 */
export function reindexSeries(
  series: DataPoint[],
  baseYear: number,
): DataPoint[] {
  const basePoint = series.find((dp) => dp.year === baseYear);
  if (!basePoint || basePoint.value === null) {
    return series;
  }
  const baseValue = basePoint.value;
  return series.map((dp) => ({
    ...dp,
    indexed: dp.value !== null ? (dp.value / baseValue) * 100 : null,
  }));
}

/**
 * Calculates percentage change statistics from the first non-null value
 * to the last non-null value in the series.
 * Returns null if there are fewer than 2 non-null data points.
 */
export function calculateChange(
  series: DataPoint[],
): { totalPct: number; annualizedPct: number } | null {
  const nonNull = series.filter((dp) => dp.value !== null);
  if (nonNull.length < 2) {
    return null;
  }

  const first = nonNull[0];
  const last = nonNull[nonNull.length - 1];
  const firstValue = first.value as number;
  const lastValue = last.value as number;

  if (firstValue === 0) {
    return null;
  }

  const totalPct = ((lastValue - firstValue) / firstValue) * 100;
  const years = last.year - first.year;

  if (years <= 0) {
    return { totalPct, annualizedPct: totalPct };
  }

  // Annualized percentage change: ((end/start)^(1/years) - 1) * 100
  const annualizedPct =
    (Math.pow(lastValue / firstValue, 1 / years) - 1) * 100;

  return { totalPct, annualizedPct };
}

/**
 * Transforms a data series based on the selected view mode.
 * - 'indexed': returns as-is (uses the indexed field)
 * - 'pct_change': calculates year-over-year % change from indexed values.
 *   First data point will have a null value.
 * - 'local_currency': returns as-is but uses the raw `value` field
 * - 'ppp_adjusted': divides local CPI value by PPP factor to get international $
 *   terms, then re-indexes to the first available year = 100.
 */
export function transformForViewMode(
  series: DataPoint[],
  viewMode: ViewMode,
  pppFactors?: { year: number; value: number }[],
): DataPoint[] {
  if (viewMode === 'indexed') {
    return series;
  }

  if (viewMode === 'local_currency') {
    return series.map((dp) => ({
      ...dp,
      indexed: dp.value,
    }));
  }

  if (viewMode === 'ppp_adjusted') {
    return transformPPPAdjusted(series, pppFactors);
  }

  // pct_change: year-over-year % change from indexed values
  const sorted = [...series].sort((a, b) => a.year - b.year);
  return sorted.map((dp, i) => {
    if (i === 0) {
      return { ...dp, indexed: null };
    }
    const prev = sorted[i - 1];
    if (prev.indexed === null || prev.indexed === 0 || dp.indexed === null) {
      return { ...dp, indexed: null };
    }
    const pctChange = ((dp.indexed - prev.indexed) / prev.indexed) * 100;
    return { ...dp, indexed: pctChange };
  });
}

/**
 * Transforms a CPI series into PPP-adjusted international dollar terms.
 * Divides each local CPI value by the PPP conversion factor for that year,
 * then re-indexes so the first available data point = 100.
 */
function transformPPPAdjusted(
  series: DataPoint[],
  pppFactors?: { year: number; value: number }[],
): DataPoint[] {
  if (!pppFactors || pppFactors.length === 0) {
    // No PPP data available - fall back to indexed view
    return series;
  }

  const pppByYear = new Map(pppFactors.map((f) => [f.year, f.value]));

  // Divide CPI value by PPP factor for each year
  const adjusted = series.map((dp) => {
    if (dp.value === null) {
      return { ...dp, indexed: null };
    }
    const ppp = pppByYear.get(dp.year);
    if (ppp === undefined || ppp === 0) {
      return { ...dp, indexed: null };
    }
    return { ...dp, indexed: dp.value / ppp };
  });

  // Re-index: set the first non-null adjusted value as base = 100
  const sorted = [...adjusted].sort((a, b) => a.year - b.year);
  const firstNonNull = sorted.find((dp) => dp.indexed !== null);
  if (!firstNonNull || firstNonNull.indexed === null || firstNonNull.indexed === 0) {
    return adjusted;
  }

  const baseValue = firstNonNull.indexed;
  return adjusted.map((dp) => ({
    ...dp,
    indexed: dp.indexed !== null ? (dp.indexed / baseValue) * 100 : null,
  }));
}

/**
 * Evaluates data quality based on the ratio of null values in the series.
 * - 'complete': no nulls
 * - 'partial': up to 30% nulls
 * - 'sparse': more than 30% nulls
 */
export function getDataQuality(
  series: DataPoint[],
): 'complete' | 'partial' | 'sparse' {
  if (series.length === 0) {
    return 'sparse';
  }

  const nullCount = series.filter((dp) => dp.value === null).length;
  const nullRatio = nullCount / series.length;

  if (nullRatio === 0) {
    return 'complete';
  }
  if (nullRatio <= 0.3) {
    return 'partial';
  }
  return 'sparse';
}
