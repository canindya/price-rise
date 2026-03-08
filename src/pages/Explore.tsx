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
  overall_cpi: 'Overall',
  food_cpi: 'Food',
  energy_benchmark: 'Energy (Oil)',
  energy_retail: 'Retail Energy',
  education_spend: 'Education',
};

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

  // Compute overall change for the selected country
  const overallChange = useMemo(() => {
    if (!selectedCountry) return null;
    const series = getCountrySeries(selectedCountry, 'overall_cpi');
    const filtered = filterByTimeRange(series, timeRange, undefined, customRange);
    const change = calculateChange(filtered);
    return change ? change.totalPct : null;
  }, [selectedCountry, timeRange, customRange, getCountrySeries]);

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
    <div className="space-y-6">
      {/* Hero section */}
      <div>
        {selectedCountry ? (
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {resolveCountryName(selectedCountry)}
            </h1>
            {wasAutoDetected && selectedCountry === detectedCountry && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200/60">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Auto-detected
              </span>
            )}
            {overallChange !== null && (
              <span className={`text-sm font-medium ${overallChange >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {overallChange >= 0 ? '+' : ''}{overallChange.toFixed(1)}% overall
              </span>
            )}
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Explore
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Select a country from the map or search to view price trends
            </p>
          </div>
        )}
      </div>

      {/* Controls row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left group: search + time range */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <CountrySearch />
          <TimeRangeSelector />
        </div>

        {/* Right group: view mode + actions */}
        <div className="flex items-center gap-3">
          <ViewModeSelector />
          <span className="hidden h-5 w-px bg-gray-200 sm:block" />
          <button
            onClick={() => setBasketOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 ring-1 ring-gray-200 transition-colors hover:bg-gray-50 hover:text-gray-900"
            aria-label="My Basket"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span className="hidden sm:inline">My Basket</span>
          </button>
          <button
            onClick={() => setAlertOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 ring-1 ring-gray-200 transition-colors hover:bg-gray-50 hover:text-gray-900"
            aria-label="Alert Setup"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Alerts</span>
          </button>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={setAllCategories}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            allActive
              ? 'bg-gray-900 text-white shadow-sm'
              : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900'
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
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Main content: map + chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Map card */}
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
            <div className="border-b border-gray-100 px-5 py-3">
              <h3 className="text-sm font-medium text-gray-500">Global Price Changes</h3>
            </div>
            <div className="p-4">
              <WorldMap
                countryChanges={countryChanges}
                onCountrySelect={handleCountrySelect}
                selectedCountry={selectedCountry}
              />
            </div>
          </div>
        </div>

        {/* Chart card */}
        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
              <h3 className="text-sm font-medium text-gray-500">
                {selectedCountry ? 'Price Trend' : 'Trend Chart'}
              </h3>
              {/* World average toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">World avg</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showBenchmark}
                  onClick={() => setShowBenchmark(!showBenchmark)}
                  className={`toggle-switch ${showBenchmark ? 'active' : ''}`}
                />
              </div>
            </div>
            <div className="overflow-hidden p-4">
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
                <div className="flex min-h-[350px] items-center justify-center">
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
        </div>
      </div>

      {/* Stats cards row */}
      {selectedCountry && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {/* Personal inflation card */}
          {personalInflation != null && (
            <div className="relative overflow-hidden rounded-xl bg-white p-5 ring-1 ring-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Your Inflation
                </span>
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 ring-1 ring-indigo-200/60">
                  Personalized
                </span>
              </div>
              <div className={`mt-2 text-2xl font-semibold ${personalInflation >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {personalInflation >= 0 ? '+' : ''}{personalInflation.toFixed(1)}%
              </div>
              <button
                onClick={() => setBasketOpen(true)}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Customize weights
              </button>
              {/* Decorative accent */}
              <div className={`absolute right-0 top-0 h-full w-1 ${personalInflation >= 0 ? 'bg-red-400' : 'bg-emerald-400'}`} />
            </div>
          )}

          {/* Category stat cards - show change for each active category */}
          {activeCategories.map((cat) => {
            const series = chartData[cat];
            const change = calculateChange(series);
            if (!change) return null;
            return (
              <div key={cat} className="rounded-xl bg-white p-5 ring-1 ring-gray-200">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  {CATEGORY_LABELS[cat]}
                </span>
                <div className={`mt-2 text-2xl font-semibold ${change.totalPct >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {change.totalPct >= 0 ? '+' : ''}{change.totalPct.toFixed(1)}%
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  {change.totalPct >= 0 ? (
                    <svg className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  ) : (
                    <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
                    </svg>
                  )}
                  <span>{timeRange} change</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category cards (detailed) */}
      {selectedCountry && (
        <CategoryCards data={chartData} timeRange={timeRange} customRange={customRange} />
      )}

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
    </div>
  );
}
