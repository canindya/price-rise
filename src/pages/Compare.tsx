import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Category, CountryMeta, DataPoint, TimeRange } from '../types/index';
import { useCountryData } from '../hooks/useCountryData';
import { filterByTimeRange, calculateChange } from '../utils/dataTransforms';
import { searchCountries, getCountryByIso3 } from '../utils/countryCodeMap';
import { GLOBAL_EVENTS } from '../utils/events';
import ComparisonChart from '../components/ComparisonChart';
import CategoryCards from '../components/CategoryCards';

const ALL_CATEGORIES: Category[] = ['overall_cpi', 'food_cpi', 'energy_benchmark', 'energy_retail', 'education_spend'];

const CATEGORY_LABELS: Record<Category, string> = {
  overall_cpi: 'Overall',
  food_cpi: 'Food',
  energy_benchmark: 'Energy',
  energy_retail: 'Retail Energy',
  education_spend: 'Education',
};

const TIME_RANGES: TimeRange[] = ['1Y', '5Y', '10Y'];

/* ------------------------------------------------------------------ */
/*  Standalone country search input (not tied to AppContext)           */
/* ------------------------------------------------------------------ */

interface CountryPickerProps {
  label: string;
  value: string | null;
  onChange: (code: string | null) => void;
  accentColor?: 'blue' | 'emerald';
}

function CountryPicker({ label, value, onChange, accentColor = 'blue' }: CountryPickerProps) {
  const resolvedName = value ? (getCountryByIso3(value)?.name ?? value) : '';
  const [query, setQuery] = useState(resolvedName);
  const [results, setResults] = useState<CountryMeta[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync display text when value changes externally (e.g. from URL)
  useEffect(() => {
    if (!isOpen) {
      setQuery(value ? (getCountryByIso3(value)?.name ?? value) : '');
    }
  }, [value, isOpen]);

  const handleChange = useCallback((v: string) => {
    setQuery(v);
    if (v.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      onChange(null);
      return;
    }
    const matches = searchCountries(v).slice(0, 10);
    setResults(matches);
    setIsOpen(matches.length > 0);
    setHighlightIdx(-1);
  }, [onChange]);

  const selectCountry = useCallback(
    (c: CountryMeta) => {
      onChange(c.iso3);
      setQuery(c.name);
      setIsOpen(false);
      setHighlightIdx(-1);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIdx((p) => Math.min(p + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIdx((p) => Math.max(p - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightIdx >= 0 && highlightIdx < results.length) {
          selectCountry(results[highlightIdx]);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setHighlightIdx(-1);
      }
    },
    [isOpen, highlightIdx, results, selectCountry],
  );

  const handleBlur = useCallback(() => {
    blurTimeout.current = setTimeout(() => setIsOpen(false), 150);
  }, []);

  const handleFocus = useCallback(() => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    if (query.trim().length > 0 && results.length > 0) {
      setIsOpen(true);
    }
  }, [query, results]);

  const focusRingClass = accentColor === 'emerald'
    ? 'focus:border-emerald-500 focus:ring-emerald-500/20'
    : 'focus:border-blue-500 focus:ring-blue-500/20';

  const highlightClass = accentColor === 'emerald'
    ? 'bg-emerald-50 text-emerald-900'
    : 'bg-blue-50 text-blue-900';

  const borderTopClass = accentColor === 'emerald'
    ? 'border-t-2 border-t-emerald-500'
    : 'border-t-2 border-t-blue-500';

  return (
    <div className="flex-1">
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
      <div className={`relative w-full rounded-xl border border-gray-200 bg-white p-4 ${borderTopClass}`}>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="Search country..."
            className={`w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm shadow-sm transition-shadow focus:outline-none focus:ring-2 ${focusRingClass}`}
          />
        </div>
        {isOpen && results.length > 0 && (
          <ul className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
            {results.map((country, idx) => (
              <li
                key={country.iso3}
                onMouseDown={() => selectCountry(country)}
                className={`cursor-pointer px-4 py-2.5 text-sm ${
                  idx === highlightIdx
                    ? highlightClass
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{country.name}</span>
                <span className="ml-2 text-gray-400">{country.iso3}</span>
              </li>
            ))}
          </ul>
        )}
        {value && !isOpen && (
          <div className="mt-3 text-lg font-bold text-gray-900">
            {getCountryByIso3(value)?.name ?? value}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Compare page                                                      */
/* ------------------------------------------------------------------ */

export default function Compare() {
  const [searchParams] = useSearchParams();

  const initialA = searchParams.get('a')?.toUpperCase() ?? null;

  const [countryA, setCountryA] = useState<string | null>(initialA);
  const [countryB, setCountryB] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('10Y');
  const [activeCategories, setActiveCategories] = useState<Category[]>([...ALL_CATEGORIES]);

  const { getCountrySeries, isLoading, error } = useCountryData();

  const nameA = countryA ? (getCountryByIso3(countryA)?.name ?? countryA) : null;
  const nameB = countryB ? (getCountryByIso3(countryB)?.name ?? countryB) : null;

  // Build chart data for both countries
  const dataA: Record<Category, DataPoint[]> = useMemo(() => {
    if (!countryA) return { overall_cpi: [], food_cpi: [], energy_benchmark: [], energy_retail: [], education_spend: [] };
    const r = {} as Record<Category, DataPoint[]>;
    for (const cat of ALL_CATEGORIES) {
      r[cat] = filterByTimeRange(getCountrySeries(countryA, cat), timeRange);
    }
    return r;
  }, [countryA, timeRange, getCountrySeries]);

  const dataB: Record<Category, DataPoint[]> = useMemo(() => {
    if (!countryB) return { overall_cpi: [], food_cpi: [], energy_benchmark: [], energy_retail: [], education_spend: [] };
    const r = {} as Record<Category, DataPoint[]>;
    for (const cat of ALL_CATEGORIES) {
      r[cat] = filterByTimeRange(getCountrySeries(countryB, cat), timeRange);
    }
    return r;
  }, [countryB, timeRange, getCountrySeries]);

  // Summary change for overall CPI
  const changeA = useMemo(() => calculateChange(dataA.overall_cpi), [dataA.overall_cpi]);
  const changeB = useMemo(() => calculateChange(dataB.overall_cpi), [dataB.overall_cpi]);

  // Time range label for summary text
  const rangeLabel = timeRange === '1Y' ? '1 year' : timeRange === '5Y' ? '5 years' : '10 years';

  // Category toggles
  const allActive = activeCategories.length === ALL_CATEGORIES.length;

  function toggleCategory(cat: Category) {
    setActiveCategories((prev) =>
      prev.includes(cat)
        ? prev.length > 1
          ? prev.filter((c) => c !== cat)
          : prev
        : [...prev, cat],
    );
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
          <h2 className="text-lg font-semibold text-red-800">Failed to load data</h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const bothSelected = countryA && countryB;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Compare Countries</h1>
          <p className="mt-2 text-gray-600">Select two countries to compare their cost of living trends side by side.</p>
        </div>

        {/* Country Pickers with vs divider */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <CountryPicker label="Country A" value={countryA} onChange={setCountryA} accentColor="blue" />
          <div className="flex items-center justify-center sm:px-4 sm:pt-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500">
              vs
            </span>
          </div>
          <CountryPicker label="Country B" value={countryB} onChange={setCountryB} accentColor="emerald" />
        </div>

        {/* Shared Controls */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Time range */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Time Range:</span>
              <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                      timeRange === range
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Category toggles */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-sm font-medium text-gray-500">Categories:</span>
              <button
                onClick={() => setActiveCategories([...ALL_CATEGORIES])}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  allActive
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeCategories.includes(cat)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        {bothSelected ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-700">
                {nameA} vs {nameB}
              </h2>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-5 bg-blue-500" />
                  {nameA} (solid)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-5 border-b-2 border-dashed border-emerald-500" />
                  {nameB} (dashed)
                </span>
              </div>
            </div>
            <ComparisonChart
              dataA={dataA}
              dataB={dataB}
              labelA={nameA ?? ''}
              labelB={nameB ?? ''}
              activeCategories={activeCategories}
              events={GLOBAL_EVENTS}
              timeRange={timeRange}
            />
          </div>
        ) : (
          <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-3 text-sm text-gray-400">
                Select two countries above to compare their trends
              </p>
            </div>
          </div>
        )}

        {/* Summary comparison */}
        {bothSelected && (changeA || changeB) && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">Summary</h3>
            <p className="text-gray-700">
              Over the last {rangeLabel},{' '}
              {changeA ? (
                <>
                  <strong>{nameA}</strong>&apos;s CPI changed by{' '}
                  <span className={changeA.totalPct >= 0 ? 'font-bold text-blue-700' : 'font-bold text-green-600'}>
                    {changeA.totalPct >= 0 ? '+' : ''}{changeA.totalPct.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <strong>{nameA}</strong> has insufficient data
                </>
              )}
              {' '}while{' '}
              {changeB ? (
                <>
                  <strong>{nameB}</strong>&apos;s CPI changed by{' '}
                  <span className={changeB.totalPct >= 0 ? 'font-bold text-emerald-700' : 'font-bold text-green-600'}>
                    {changeB.totalPct >= 0 ? '+' : ''}{changeB.totalPct.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <strong>{nameB}</strong> has insufficient data
                </>
              )}
              .
            </p>
          </div>
        )}

        {/* Side-by-side Category Cards */}
        {bothSelected && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border-t-2 border-t-blue-500 border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">{nameA}</h3>
              <CategoryCards data={dataA} timeRange={timeRange} />
            </div>
            <div className="rounded-xl border-t-2 border-t-emerald-500 border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">{nameB}</h3>
              <CategoryCards data={dataB} timeRange={timeRange} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
