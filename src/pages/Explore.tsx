import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Category, DataPoint } from '../types/index';
import { useAppState, useAppDispatch } from '../context/AppContext';
import { useCountryData } from '../hooks/useCountryData';
import { useUserLocation } from '../hooks/useUserLocation';
import { usePersonalBasket, calculatePersonalInflation, BASKET_CATEGORIES } from '../hooks/usePersonalBasket';
import { filterByTimeRange, calculateChange } from '../utils/dataTransforms';
import { getCountryByCode, getCountryByIso3 } from '../utils/countryCodeMap';
import { GLOBAL_EVENTS } from '../utils/events';
import CountrySearch from '../components/CountrySearch';
import TimeRangeSelector from '../components/TimeRangeSelector';
import ViewModeSelector from '../components/ViewModeSelector';
import WorldMap from '../components/WorldMap';
import TrendChart from '../components/TrendChart';
import CategoryCards from '../components/CategoryCards';
import MyBasket from '../components/MyBasket';
import AlertSetup from '../components/AlertSetup';

const ALL_CATEGORIES: Category[] = ['overall_cpi', 'food_cpi', 'energy_benchmark', 'energy_retail', 'education_spend'];

const CATEGORY_LABELS: Record<Category, string> = {
  overall_cpi: 'Overall CPI',
  food_cpi: 'Food CPI',
  energy_benchmark: 'Energy (Oil)',
  energy_retail: 'Retail Energy',
  education_spend: 'Education',
};

const CATEGORY_SHORT_LABELS: Record<Category, string> = {
  overall_cpi: 'Overall',
  food_cpi: 'Food',
  energy_benchmark: 'Energy (Oil)',
  energy_retail: 'Retail Energy',
  education_spend: 'Education',
};

function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  const cls = className || 'h-5 w-5 text-indigo-500';
  switch (category) {
    case 'overall_cpi':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l4-4 4 4 5-7 5 5" />
        </svg>
      );
    case 'food_cpi':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      );
    case 'energy_benchmark':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
        </svg>
      );
    case 'energy_retail':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    case 'education_spend':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      );
  }
}

function resolveCountryName(code: string): string {
  const byIso3 = getCountryByIso3(code);
  if (byIso3) return byIso3.name;
  const byCode = getCountryByCode(code);
  if (byCode) return byCode.name;
  return code;
}

export default function Explore() {
  const { selectedCountry, timeRange, customRange, activeCategories, viewMode } = useAppState();
  const dispatch = useAppDispatch();
  const { getCountrySeries, getWorldAverage, getAllCountriesChange, isLoading, error } =
    useCountryData();
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [basketOpen, setBasketOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  // Location detection
  const { detectedCountry, isDetecting } = useUserLocation();
  const [wasAutoDetected, setWasAutoDetected] = useState(false);

  useEffect(() => {
    if (!selectedCountry && detectedCountry && !isDetecting) {
      dispatch({ type: 'SELECT_COUNTRY', payload: detectedCountry });
      setWasAutoDetected(true);
    }
  }, [selectedCountry, detectedCountry, isDetecting, dispatch]);

  // Personal basket
  const { weights } = usePersonalBasket();

  const handleCountrySelect = useCallback(
    (code: string) => {
      dispatch({ type: 'SELECT_COUNTRY', payload: code });
      setWasAutoDetected(false);
    },
    [dispatch],
  );

  const countryChanges = useMemo(() => {
    return getAllCountriesChange('overall_cpi', timeRange, customRange);
  }, [getAllCountriesChange, timeRange, customRange]);

  const chartData: Record<Category, DataPoint[]> = useMemo(() => {
    if (!selectedCountry) {
      return { overall_cpi: [], food_cpi: [], energy_benchmark: [], energy_retail: [], education_spend: [] };
    }
    const result = {} as Record<Category, DataPoint[]>;
    for (const cat of ALL_CATEGORIES) {
      const series = getCountrySeries(selectedCountry, cat);
      result[cat] = filterByTimeRange(series, timeRange, undefined, customRange);
    }
    return result;
  }, [selectedCountry, timeRange, customRange, getCountrySeries]);

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

  // Compute personal inflation for the selected country
  const personalInflation = useMemo(() => {
    if (!selectedCountry) return null;
    const changes: Partial<Record<Category, number>> = {};
    for (const { key } of BASKET_CATEGORIES) {
      const series = getCountrySeries(selectedCountry, key);
      const filtered = filterByTimeRange(series, timeRange, undefined, customRange);
      const change = calculateChange(filtered);
      if (change) changes[key] = change.totalPct;
    }
    return calculatePersonalInflation(weights, changes);
  }, [selectedCountry, weights, timeRange, customRange, getCountrySeries]);

  // Compute category changes for stat cards
  const categoryChanges = useMemo(() => {
    const result: Partial<Record<Category, number>> = {};
    for (const cat of ALL_CATEGORIES) {
      const series = chartData[cat];
      const change = calculateChange(series);
      if (change) result[cat] = change.totalPct;
    }
    return result;
  }, [chartData]);

  const allActive = activeCategories.length === ALL_CATEGORIES.length;

  function toggleCategory(cat: Category) {
    dispatch({ type: 'TOGGLE_CATEGORY', payload: cat });
  }

  function setAllCategories() {
    dispatch({ type: 'SET_CATEGORIES', payload: [...ALL_CATEGORIES] });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-sm text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-xl bg-red-50 p-8 text-center ring-1 ring-red-200">
          <h2 className="text-lg font-semibold text-red-800">
            Failed to load data
          </h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap content-start min-h-[calc(100vh-4rem)]">
        {/* ─── Stats Sidebar Panel ─── */}
        <div className="bg-gray-200 py-6 lg:py-0 w-full lg:w-72 xl:w-80 flex flex-wrap content-start">
          {/* Header with action buttons */}
          <div className="w-full px-4 lg:px-6 py-4 flex items-center justify-between">
            <h2 className="font-bold text-black text-lg">Explore</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setBasketOpen(true)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-300 transition-colors"
                aria-label="My Basket"
                title="My Basket"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>
              <button
                onClick={() => setAlertOpen(true)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-300 transition-colors"
                aria-label="Alert Setup"
                title="Alerts"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </button>
            </div>
          </div>

          {/* Country Search */}
          <div className="w-full px-4 lg:px-6 py-3">
            <CountrySearch />
            {wasAutoDetected && selectedCountry === detectedCountry && (
              <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Auto-detected location
              </p>
            )}
          </div>

          {/* Time Range */}
          <div className="w-full px-4 lg:px-6 py-2">
            <TimeRangeSelector />
          </div>

          {/* Stat Cards */}
          {selectedCountry && ALL_CATEGORIES.map((cat) => {
            const val = categoryChanges[cat];
            if (val == null) return null;
            const isUp = val >= 0;
            return (
              <div key={cat} className="w-1/2 lg:w-full">
                <div className="border-2 border-gray-400 border-dashed hover:border-transparent hover:bg-white hover:shadow-xl rounded p-6 m-2 md:mx-6 md:my-4 transition-all duration-300">
                  <div className="flex flex-col items-center">
                    <div className="flex-shrink-0 mb-2">
                      <div className="rounded-full p-3 bg-gray-300">
                        <CategoryIcon category={cat} className="h-5 w-5 text-indigo-500" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-3xl">
                        {isUp ? '+' : ''}{val.toFixed(1)}%
                        <span className={`ml-1 ${isUp ? 'text-red-500' : 'text-emerald-500'}`}>
                          {isUp ? '\u2191' : '\u2193'}
                        </span>
                      </h3>
                      <h5 className="font-bold text-gray-500 text-sm">{CATEGORY_LABELS[cat]}</h5>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Personal Inflation Card */}
          {selectedCountry && personalInflation != null && (
            <div className="w-full">
              <div className="border-2 border-gray-400 border-dashed hover:border-transparent hover:bg-white hover:shadow-xl rounded p-6 m-2 md:mx-6 md:my-4 transition-all duration-300">
                <div className="flex flex-col items-center">
                  <div className="flex-shrink-0 mb-2">
                    <div className="rounded-full p-3 bg-gray-300">
                      <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-3xl">
                      {personalInflation >= 0 ? '+' : ''}{personalInflation.toFixed(1)}%
                      <span className={`ml-1 ${personalInflation >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {personalInflation >= 0 ? '\u2191' : '\u2193'}
                      </span>
                    </h3>
                    <h5 className="font-bold text-gray-500 text-sm">Your Inflation</h5>
                    <button
                      onClick={() => setBasketOpen(true)}
                      className="mt-1 text-xs text-indigo-500 hover:text-indigo-700 hover:underline"
                    >
                      Customize weights
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty state when no country */}
          {!selectedCountry && (
            <div className="w-full px-4 lg:px-6 py-8">
              <p className="text-sm text-gray-500 text-center">
                Select a country to view statistics
              </p>
            </div>
          )}
        </div>

        {/* ─── Main Content Area ─── */}
        <div className="w-full flex-1 lg:border-l border-gray-300">
          {/* Controls Bar */}
          <div className="border-b border-gray-300 p-4 flex flex-wrap items-center justify-between gap-3">
            {/* Category pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={setAllCategories}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  allActive
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 ring-1 ring-gray-300 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                All
              </button>
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    activeCategories.includes(cat)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 ring-1 ring-gray-300 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {CATEGORY_SHORT_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              <ViewModeSelector />
              <span className="h-5 w-px bg-gray-300" />
              {/* World average toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">World avg</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showBenchmark}
                  onClick={() => setShowBenchmark(!showBenchmark)}
                  className={`toggle-switch ${showBenchmark ? 'active' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="p-3">
            <div className="border-b p-3">
              <h5 className="font-bold text-black">Global Price Changes</h5>
            </div>
            <div className="p-5">
              <WorldMap
                countryChanges={countryChanges}
                onCountrySelect={handleCountrySelect}
                selectedCountry={selectedCountry}
              />
            </div>
          </div>

          {/* Chart Section */}
          <div className="p-3">
            <div className="border-b p-3">
              <h5 className="font-bold text-black">
                {selectedCountry
                  ? `${resolveCountryName(selectedCountry)} \u2014 Trend Analysis`
                  : 'Trend Analysis'}
              </h5>
            </div>
            <div className="p-5">
              {selectedCountry ? (
                <TrendChart
                  data={chartData}
                  activeCategories={activeCategories}
                  events={GLOBAL_EVENTS}
                  timeRange={timeRange}
                  customRange={customRange}
                  viewMode={viewMode}
                  showBenchmark={showBenchmark}
                  benchmarkData={benchmarkData}
                />
              ) : (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-400">
                      Select a country to view trends
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Category Cards */}
          {selectedCountry && (
            <div className="p-3">
              <div className="border-b p-3">
                <h5 className="font-bold text-black">Category Breakdown</h5>
              </div>
              <div className="p-5">
                <CategoryCards data={chartData} timeRange={timeRange} customRange={customRange} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* My Basket modal */}
      <MyBasket
        open={basketOpen}
        onClose={() => setBasketOpen(false)}
        data={chartData}
        timeRange={timeRange}
        customRange={customRange}
      />

      {/* Alert Setup modal */}
      <AlertSetup open={alertOpen} onClose={() => setAlertOpen(false)} />
    </>
  );
}
