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

const CATEGORY_ICON_COLORS: Record<Category, { iconColor: string; iconBg: string }> = {
  overall_cpi: { iconColor: 'text-blue-600', iconBg: 'bg-blue-100' },
  food_cpi: { iconColor: 'text-green-600', iconBg: 'bg-green-100' },
  energy_benchmark: { iconColor: 'text-amber-600', iconBg: 'bg-amber-100' },
  energy_retail: { iconColor: 'text-orange-600', iconBg: 'bg-orange-100' },
  education_spend: { iconColor: 'text-purple-600', iconBg: 'bg-purple-100' },
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
  const countryRegion = countryMeta?.region ?? '';

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

  const categoryChanges = useMemo(() => {
    const changes: Partial<Record<Category, { totalPct: number; annualizedPct: number }>> = {};
    for (const cat of ALL_CATEGORIES) {
      const change = calculateChange(allData[cat]);
      if (change) changes[cat] = change;
    }
    return changes;
  }, [allData]);

  const overallChange = categoryChanges.overall_cpi ?? null;

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
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-100">
        <div className="rounded bg-white p-6 text-center shadow">
          <h2 className="text-lg font-bold text-red-800">
            Failed to load data
          </h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/explore" className="hover:text-gray-700">Explore</Link>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-bold text-black">{countryName}</span>
          </nav>

          {/* Country Header */}
          <div className="rounded bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-black">
                    {countryName}
                  </h1>
                  {countryRegion && (
                    <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-600">
                      {countryRegion}
                    </span>
                  )}
                </div>

                <Link
                  to={`/compare?a=${code ?? ''}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-indigo-500 hover:underline"
                >
                  Compare with another country
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 text-sm text-gray-500">
                  <input
                    type="checkbox"
                    checked={showBenchmark}
                    onChange={(e) => setShowBenchmark(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
                  />
                  World Average
                </label>
                <ViewModeSelector />
                <button
                  onClick={() => setBasketOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  My Basket
                </button>
              </div>
            </div>
          </div>

          {/* Stat Cards Row */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {ALL_CATEGORIES.map((cat) => {
              const change = categoryChanges[cat];
              const { iconColor, iconBg } = CATEGORY_ICON_COLORS[cat];
              return (
                <div
                  key={cat}
                  className="border-2 border-gray-400 border-dashed rounded p-6 m-2 text-center transition-all duration-300 hover:border-transparent hover:bg-white hover:shadow-xl"
                >
                  <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
                    <svg className={`h-5 w-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" />
                    </svg>
                  </div>
                  {change ? (
                    <>
                      <div className="mt-2 text-3xl font-bold text-black tabular-nums">
                        {change.totalPct >= 0 ? '+' : ''}{change.totalPct.toFixed(1)}%
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500 tabular-nums">
                        {change.annualizedPct >= 0 ? '+' : ''}{change.annualizedPct.toFixed(1)}%/yr
                      </div>
                    </>
                  ) : (
                    <div className="mt-2 text-sm text-gray-400">No data</div>
                  )}
                  <div className="mt-1 text-sm font-bold text-gray-500">{CATEGORY_LABELS[cat]}</div>
                </div>
              );
            })}
          </div>

          {/* Summary + Personal Inflation */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {overallChange && (
              <div className="border-2 border-gray-400 border-dashed rounded p-6 transition-all duration-300 hover:border-transparent hover:bg-white hover:shadow-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Overall Change</h3>
                <p className="mt-3 text-gray-600">
                  Over the full available history, the overall cost of living in{' '}
                  <strong className="text-black">{countryName}</strong> changed by{' '}
                  <span className="text-3xl font-bold text-black">
                    {overallChange.totalPct >= 0 ? '+' : ''}
                    {overallChange.totalPct.toFixed(1)}%
                  </span>{' '}
                  ({overallChange.annualizedPct >= 0 ? '+' : ''}{overallChange.annualizedPct.toFixed(2)}% annualized).
                </p>
              </div>
            )}
            {personalInflation != null && (
              <div className="border-2 border-gray-400 border-dashed rounded p-6 transition-all duration-300 hover:border-transparent hover:bg-white hover:shadow-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-500">Your Personal Inflation</h3>
                <div className="mt-3 flex items-baseline gap-3">
                  <div className="text-3xl font-bold text-black">
                    {personalInflation >= 0 ? '+' : ''}
                    {personalInflation.toFixed(1)}%
                  </div>
                  <button
                    onClick={() => setBasketOpen(true)}
                    className="text-sm font-bold text-indigo-500 hover:underline"
                  >
                    Customize weights
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Full History Chart - Graph container pattern */}
          <section className="rounded bg-white overflow-hidden">
            <div className="border-b p-3 flex items-center justify-between">
              <h2 className="font-bold text-black">
                Historical Trends
              </h2>
            </div>
            <div className="p-5">
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

          {/* Category Breakdown */}
          <section>
            <h2 className="mb-4 font-bold text-black text-lg">Category Breakdown</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ALL_CATEGORIES.map((cat) => {
                const series = allData[cat] ?? [];
                const quality = getDataQuality(series);
                const change = calculateChange(series);
                const catData = Object.fromEntries(
                  ALL_CATEGORIES.map((c) => [c, c === cat ? allData[c] : []])
                ) as Record<Category, DataPoint[]>;
                return (
                  <div key={cat} className="rounded bg-white overflow-hidden">
                    <div className="border-b p-3 flex items-center justify-between">
                      <h3 className="font-bold text-black">
                        {CATEGORY_LABELS[cat]}
                      </h3>
                      <DataQualityBadge quality={quality} />
                    </div>
                    <div className="p-5">
                      {change && (
                        <div className="mb-3">
                          <span className="text-3xl font-bold text-black tabular-nums">
                            {change.totalPct >= 0 ? '+' : ''}{change.totalPct.toFixed(1)}%
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            ({change.annualizedPct >= 0 ? '+' : ''}{change.annualizedPct.toFixed(2)}%/yr)
                          </span>
                        </div>
                      )}
                      {quality === 'sparse' || !change ? (
                        <div className="flex h-[300px] items-center justify-center text-sm text-gray-400">
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
                  </div>
                );
              })}
            </div>
          </section>

          {/* Data Section */}
          <section className="rounded bg-white overflow-hidden">
            <div className="border-b p-3">
              <h2 className="font-bold text-black">Data Sources</h2>
            </div>
            <div className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <ul className="space-y-1 text-sm text-gray-500">
                  <li>
                    Overall CPI:{' '}
                    <a href="https://data.worldbank.org/indicator/FP.CPI.TOTL" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                      World Bank WDI
                    </a>
                  </li>
                  <li>
                    Food CPI:{' '}
                    <a href="https://www.fao.org/faostat/en/#data/CP" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                      FAOSTAT
                    </a>
                  </li>
                  <li>
                    Energy Benchmark:{' '}
                    <a href="https://www.worldbank.org/en/research/commodity-markets" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                      World Bank Commodities
                    </a>
                  </li>
                </ul>
                <button
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download CSV
                </button>
              </div>
            </div>
          </section>

          {/* My Basket modal */}
          <MyBasket
            open={basketOpen}
            onClose={() => setBasketOpen(false)}
            data={allData}
            timeRange="10Y"
          />
        </div>
      </div>
    </div>
  );
}
