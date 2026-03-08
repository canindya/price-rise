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

const CATEGORY_COLORS: Record<Category, { text: string; bg: string; border: string }> = {
  overall_cpi: { text: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-l-blue-500' },
  food_cpi: { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-l-emerald-500' },
  energy_benchmark: { text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-l-amber-500' },
  energy_retail: { text: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-l-orange-500' },
  education_spend: { text: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-l-purple-500' },
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

  // Calculate changes for all categories
  const categoryChanges = useMemo(() => {
    const changes: Partial<Record<Category, { totalPct: number; annualizedPct: number }>> = {};
    for (const cat of ALL_CATEGORIES) {
      const change = calculateChange(allData[cat]);
      if (change) changes[cat] = change;
    }
    return changes;
  }, [allData]);

  const overallChange = categoryChanges.overall_cpi ?? null;

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
      <div className="mesh-bg flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-900 border-t-emerald-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mesh-bg flex min-h-[60vh] items-center justify-center">
        <div className="glass-card rounded-lg p-6 text-center">
          <h2 className="font-[Crimson_Pro] text-lg font-semibold text-red-400">
            Failed to load data
          </h2>
          <p className="mt-2 text-sm text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Breadcrumb */}
          <nav className="animate-fade-up flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="transition-colors hover:text-gray-300">Home</Link>
            <span className="text-gray-600">/</span>
            <Link to="/explore" className="transition-colors hover:text-gray-300">Explore</Link>
            <span className="text-gray-600">/</span>
            <span className="font-medium text-gray-400">{countryName}</span>
          </nav>

          {/* Country Header Card */}
          <div className="glass-card animate-fade-up delay-1 rounded-xl p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-[Crimson_Pro] text-4xl font-black text-white">
                    {countryName}
                  </h1>
                  {countryRegion && (
                    <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-gray-400">
                      {countryRegion}
                    </span>
                  )}
                </div>

                {/* Quick stats pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map((cat) => {
                    const change = categoryChanges[cat];
                    if (!change) return null;
                    const colors = CATEGORY_COLORS[cat];
                    return (
                      <span
                        key={cat}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}
                      >
                        {CATEGORY_LABELS[cat]}
                        <span className="font-[JetBrains_Mono]">{change.totalPct >= 0 ? '+' : ''}{change.totalPct.toFixed(1)}%</span>
                      </span>
                    );
                  })}
                </div>

                <Link
                  to={`/compare?a=${code ?? ''}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm text-emerald-400 transition-colors hover:text-emerald-300"
                >
                  Compare with another country
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={showBenchmark}
                    onChange={(e) => setShowBenchmark(e.target.checked)}
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/30"
                  />
                  World Average
                </label>
                <ViewModeSelector />
                <button
                  onClick={() => setBasketOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  My Basket
                </button>
              </div>
            </div>
          </div>

          {/* Summary + Personal Inflation */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {overallChange && (
              <div className="glass-card animate-fade-up delay-2 rounded-xl p-6">
                <h3 className="font-[Crimson_Pro] text-sm font-semibold uppercase tracking-wider text-gray-500">Overall Change</h3>
                <p className="mt-3 font-[Crimson_Pro] text-lg leading-relaxed text-gray-300">
                  Over the full available history, the overall cost of living in{' '}
                  <strong className="text-white">{countryName}</strong> changed by{' '}
                  <span
                    className={`font-[JetBrains_Mono] text-2xl font-bold ${
                      overallChange.totalPct >= 0
                        ? 'text-red-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {overallChange.totalPct >= 0 ? '+' : ''}
                    {overallChange.totalPct.toFixed(1)}%
                  </span>{' '}
                  <span className="font-[JetBrains_Mono] text-sm text-gray-500">
                    ({overallChange.annualizedPct >= 0 ? '+' : ''}{overallChange.annualizedPct.toFixed(2)}% annualized)
                  </span>.
                </p>
              </div>
            )}
            {personalInflation != null && (
              <div className="glass-card animate-fade-up delay-3 rounded-xl border-emerald-500/30 p-6 glow-green">
                <h3 className="font-[Crimson_Pro] text-sm font-semibold uppercase tracking-wider text-emerald-400">Your Personal Inflation</h3>
                <div className="mt-3 flex items-baseline gap-3">
                  <div
                    className={`font-[JetBrains_Mono] text-3xl font-bold ${
                      personalInflation >= 0 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {personalInflation >= 0 ? '+' : ''}
                    {personalInflation.toFixed(1)}%
                  </div>
                  <button
                    onClick={() => setBasketOpen(true)}
                    className="text-sm text-emerald-400 transition-colors hover:text-emerald-300"
                  >
                    Customize weights
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Full History Chart */}
          <section className="glass-card animate-fade-up delay-3 rounded-xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[Crimson_Pro] text-xl font-semibold text-white">
                Historical Trends
              </h2>
            </div>
            <TrendChart
              data={allData}
              activeCategories={ALL_CATEGORIES}
              events={GLOBAL_EVENTS}
              timeRange="10Y"
              viewMode={viewMode}
              showBenchmark={showBenchmark}
              benchmarkData={benchmarkData}
            />
          </section>

          {/* Category Breakdown */}
          <section className="animate-fade-up delay-4">
            <h2 className="mb-4 font-[Crimson_Pro] text-xl font-semibold text-white">Category Breakdown</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ALL_CATEGORIES.map((cat) => {
                const series = allData[cat] ?? [];
                const quality = getDataQuality(series);
                const change = calculateChange(series);
                const colors = CATEGORY_COLORS[cat];
                const catData = Object.fromEntries(
                  ALL_CATEGORIES.map((c) => [c, c === cat ? allData[c] : []])
                ) as Record<Category, DataPoint[]>;
                return (
                  <div key={cat} className={`glass-card rounded-xl border-l-2 ${colors.border} p-5`}>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className={`font-semibold ${colors.text}`}>
                        {CATEGORY_LABELS[cat]}
                      </h3>
                      <DataQualityBadge quality={quality} />
                    </div>
                    {change && (
                      <div className="mb-3">
                        <span
                          className={`font-[JetBrains_Mono] text-sm font-semibold ${
                            change.totalPct >= 0 ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {change.totalPct >= 0 ? '+' : ''}{change.totalPct.toFixed(1)}%
                        </span>
                        <span className="ml-2 font-[JetBrains_Mono] text-xs text-gray-500">
                          ({change.annualizedPct >= 0 ? '+' : ''}{change.annualizedPct.toFixed(2)}%/yr)
                        </span>
                      </div>
                    )}
                    {quality === 'sparse' || !change ? (
                      <div className="flex h-[300px] items-center justify-center text-sm text-gray-600">
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
            </div>
          </section>

          {/* Data Section */}
          <section className="glass-card animate-fade-up delay-5 rounded-xl p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-[Crimson_Pro] text-lg font-semibold text-white">Data Sources</h2>
                <ul className="mt-2 space-y-1 text-sm text-gray-500">
                  <li>
                    Overall CPI:{' '}
                    <a href="https://data.worldbank.org/indicator/FP.CPI.TOTL" target="_blank" rel="noopener noreferrer" className="text-blue-400 transition-colors hover:text-blue-300">
                      World Bank WDI
                    </a>
                  </li>
                  <li>
                    Food CPI:{' '}
                    <a href="https://www.fao.org/faostat/en/#data/CP" target="_blank" rel="noopener noreferrer" className="text-blue-400 transition-colors hover:text-blue-300">
                      FAOSTAT
                    </a>
                  </li>
                  <li>
                    Energy Benchmark:{' '}
                    <a href="https://www.worldbank.org/en/research/commodity-markets" target="_blank" rel="noopener noreferrer" className="text-blue-400 transition-colors hover:text-blue-300">
                      World Bank Commodities
                    </a>
                  </li>
                </ul>
              </div>
              <button
                onClick={handleDownloadCSV}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-transparent px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download CSV
              </button>
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
