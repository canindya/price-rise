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
  const [locationBannerDismissed, setLocationBannerDismissed] = useState(false);

  useEffect(() => {
    if (!selectedCountry && detectedCountry && !isDetecting) {
      dispatch({ type: 'SELECT_COUNTRY', payload: detectedCountry });
    }
  }, [selectedCountry, detectedCountry, isDetecting, dispatch]);

  // Personal basket
  const { weights } = usePersonalBasket();

  const handleCountrySelect = useCallback(
    (code: string) => {
      dispatch({ type: 'SELECT_COUNTRY', payload: code });
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

  // Show location banner
  const showLocationBanner =
    !locationBannerDismissed &&
    detectedCountry &&
    selectedCountry === detectedCountry;

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
    <div className="space-y-6">
      {/* Location detection banner */}
      {showLocationBanner && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <span>
            We detected you're in{' '}
            <strong>{resolveCountryName(detectedCountry)}</strong>.
          </span>
          <button
            onClick={() => {
              setLocationBannerDismissed(true);
              dispatch({ type: 'SELECT_COUNTRY', payload: null });
            }}
            className="ml-3 font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            Change
          </button>
        </div>
      )}

      {/* Top bar: search, time range, category toggles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <CountrySearch />
          <TimeRangeSelector />
          <ViewModeSelector />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={setAllCategories}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                allActive
                  ? 'bg-slate-700 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                  activeCategories.includes(cat)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showBenchmark}
              onChange={(e) => setShowBenchmark(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show World Average
          </label>

          <span className="hidden h-5 w-px bg-gray-300 sm:block" />

          <button
            onClick={() => setBasketOpen(true)}
            className="rounded bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
          >
            My Basket
          </button>
          <button
            onClick={() => setAlertOpen(true)}
            className="rounded bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
          >
            Alerts
          </button>
        </div>
      </div>

      {/* Personal inflation summary */}
      {selectedCountry && personalInflation != null && (
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

      {/* Main area: map + chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <WorldMap
            countryChanges={countryChanges}
            onCountrySelect={handleCountrySelect}
            selectedCountry={selectedCountry}
          />
        </div>

        <div className="lg:col-span-5">
          {selectedCountry ? (
            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-800">
                {resolveCountryName(selectedCountry)}
              </h2>
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
            </div>
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white">
              <p className="text-center text-gray-400">
                Select a country from the map or search above
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Category cards */}
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
