import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Category, DataPoint } from '../types/index';
import { useCountryData } from '../hooks/useCountryData';
import { calculateChange, getDataQuality } from '../utils/dataTransforms';
import { getCountryByCode, getCountryByIso3 } from '../utils/countryCodeMap';
import { GLOBAL_EVENTS } from '../utils/events';
import { useAppState } from '../context/AppContext';
import { usePersonalBasket, calculatePersonalInflation, BASKET_CATEGORIES } from '../hooks/usePersonalBasket';
import TrendChart from '../components/TrendChart';
import ViewModeSelector from '../components/ViewModeSelector';
import DataQualityBadge from '../components/DataQualityBadge';
import MyBasket from '../components/MyBasket';

const ALL_CATEGORIES: Category[] = ['overall_cpi', 'food_cpi', 'energy_benchmark', 'energy_retail', 'education_spend'];

const CATEGORY_LABELS: Record<Category, string> = {
  overall_cpi: 'Overall CPI',
  food_cpi: 'Food & Essentials',
  energy_benchmark: 'Energy (Oil)',
  energy_retail: 'Retail Energy',
  education_spend: 'Education Investment',
};

function resolveCountry(code: string) {
  return getCountryByIso3(code) ?? getCountryByCode(code);
}

export default function CountryDetail() {
  const { code } = useParams<{ code: string }>();
  const { viewMode } = useAppState();
  const { getCountrySeries, getWorldAverage, isLoading, error } = useCountryData();
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [basketOpen, setBasketOpen] = useState(false);
  const { weights } = usePersonalBasket();

  const countryMeta = code ? resolveCountry(code) : undefined;
  const countryName = countryMeta?.name ?? code ?? 'Unknown';

  const allData: Record<Category, DataPoint[]> = useMemo(() => {
    if (!code) return { overall_cpi: [], food_cpi: [], energy_benchmark: [], energy_retail: [], education_spend: [] };
    const result = {} as Record<Category, DataPoint[]>;
    for (const cat of ALL_CATEGORIES) {
      result[cat] = getCountrySeries(code, cat);
    }
    return result;
  }, [code, getCountrySeries]);

  const benchmarkData: Record<Category, DataPoint[]> = useMemo(() => {
    if (!showBenchmark) {
      return { overall_cpi: [], food_cpi: [], energy_benchmark: [], energy_retail: [], education_spend: [] };
    }
    const result = {} as Record<Category, DataPoint[]>;
    for (const cat of ALL_CATEGORIES) {
      result[cat] = getWorldAverage(cat);
    }
    return result;
  }, [showBenchmark, getWorldAverage]);

  // 10-year summary for overall CPI
  const overallChange = useMemo(() => {
    return calculateChange(allData.overall_cpi);
  }, [allData.overall_cpi]);

  // Personal inflation
  const personalInflation = useMemo(() => {
    if (!code) return null;
    const changes: Partial<Record<Category, number>> = {};
    for (const { key } of BASKET_CATEGORIES) {
      const series = getCountrySeries(code, key);
      const change = calculateChange(series);
      if (change) changes[key] = change.totalPct;
    }
    return calculatePersonalInflation(weights, changes);
  }, [code, weights, getCountrySeries]);

  const handleDownloadCSV = useCallback(() => {
    // Build CSV content
    const yearSet = new Set<number>();
    for (const cat of ALL_CATEGORIES) {
      for (const dp of allData[cat]) {
        yearSet.add(dp.year);
      }
    }
    const years = Array.from(yearSet).sort((a, b) => a - b);

    const lines: string[] = ['Year,Overall CPI,Food CPI,Energy Benchmark'];
    for (const year of years) {
      const overall = allData.overall_cpi.find((d) => d.year === year);
      const food = allData.food_cpi.find((d) => d.year === year);
      const energy = allData.energy_benchmark.find((d) => d.year === year);
      lines.push(
        `${year},${overall?.value ?? ''},${food?.value ?? ''},${energy?.value ?? ''}`,
      );
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${code ?? 'country'}_cost_of_living.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [allData, code]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800">
            Failed to load data
          </h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/explore"
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Back to Explore
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {countryName}
          </h1>
          <Link
            to={`/compare?a=${code ?? ''}`}
            className="mt-1 inline-block text-sm text-blue-600 hover:underline"
          >
            Compare with another country &rarr;
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showBenchmark}
              onChange={(e) => setShowBenchmark(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show World Average
          </label>
          <ViewModeSelector />
          <button
            onClick={() => setBasketOpen(true)}
            className="inline-flex items-center gap-2 self-start rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
          >
            My Basket
          </button>
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
            Download CSV
          </button>
        </div>
      </div>

      {/* Summary */}
      {overallChange && (
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <p className="text-lg text-gray-700">
            Over the full available history, the overall cost of living in{' '}
            <strong>{countryName}</strong> changed by{' '}
            <span
              className={
                overallChange.totalPct >= 0
                  ? 'font-bold text-red-600'
                  : 'font-bold text-blue-600'
              }
            >
              {overallChange.totalPct >= 0 ? '+' : ''}
              {overallChange.totalPct.toFixed(1)}%
            </span>
            .
          </p>
        </div>
      )}

      {/* Personal inflation */}
      {personalInflation != null && (
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 px-5 py-3 shadow-sm">
          <div className="text-sm text-gray-600">Your Personal Inflation:</div>
          <div
            className={`text-xl font-bold ${
              personalInflation >= 0 ? 'text-red-600' : 'text-blue-600'
            }`}
          >
            {personalInflation >= 0 ? '+' : ''}
            {personalInflation.toFixed(1)}%
          </div>
          <button
            onClick={() => setBasketOpen(true)}
            className="ml-auto text-xs text-indigo-600 hover:underline"
          >
            Customize weights
          </button>
        </div>
      )}

      {/* Full history chart — show all data, use '10Y' as the widest built-in range */}
      <section>
        <h2 className="mb-3 text-xl font-semibold text-gray-800">
          Full History — All Categories
        </h2>
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <TrendChart
            data={allData}
            activeCategories={ALL_CATEGORIES}
            events={GLOBAL_EVENTS}
            timeRange="10Y"
            viewMode={viewMode}
            showBenchmark={showBenchmark}
            benchmarkData={benchmarkData}
          />
        </div>
      </section>

      {/* Individual category charts */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {ALL_CATEGORIES.map((cat) => {
          const series = allData[cat] ?? [];
          const quality = getDataQuality(series);
          const change = calculateChange(series);
          const catData = Object.fromEntries(
            ALL_CATEGORIES.map((c) => [c, c === cat ? allData[c] : []])
          ) as Record<Category, DataPoint[]>;
          return (
            <div key={cat} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-600">
                  {CATEGORY_LABELS[cat]}
                </h3>
                <DataQualityBadge quality={quality} />
              </div>
              {quality === 'sparse' || !change ? (
                <div className="flex h-[400px] items-center justify-center text-gray-400">
                  Insufficient data
                </div>
              ) : (
                <TrendChart
                  data={catData}
                  activeCategories={[cat]}
                  timeRange="10Y"
                  viewMode={viewMode}
                  showBenchmark={showBenchmark}
                  benchmarkData={benchmarkData}
                />
              )}
            </div>
          );
        })}
      </section>

      {/* Data source attribution */}
      <section className="rounded-xl bg-gray-50 p-6">
        <h2 className="text-lg font-semibold text-gray-800">Data Sources</h2>
        <ul className="mt-3 space-y-1 text-sm text-gray-600">
          <li>
            Overall CPI:{' '}
            <a
              href="https://data.worldbank.org/indicator/FP.CPI.TOTL"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              World Bank WDI
            </a>
          </li>
          <li>
            Food CPI:{' '}
            <a
              href="https://www.fao.org/faostat/en/#data/CP"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              FAOSTAT
            </a>
          </li>
          <li>
            Energy Benchmark:{' '}
            <a
              href="https://www.worldbank.org/en/research/commodity-markets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              World Bank Commodities
            </a>
          </li>
        </ul>
      </section>

      {/* My Basket modal */}
      <MyBasket
        open={basketOpen}
        onClose={() => setBasketOpen(false)}
        data={allData}
        timeRange="10Y"
      />
    </div>
  );
}
