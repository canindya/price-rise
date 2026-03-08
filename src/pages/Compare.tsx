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
}

function CountryPicker({ label, value, onChange }: CountryPickerProps) {
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

  return (
    <div className="flex-1">
      <label className="mb-1 block text-sm font-medium text-gray-600">{label}</label>
      <div className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="Search country..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {isOpen && results.length > 0 && (
          <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {results.map((country, idx) => (
              <li
                key={country.iso3}
                onMouseDown={() => selectCountry(country)}
                className={`cursor-pointer px-3 py-2 text-sm ${
                  idx === highlightIdx
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="font-medium">{country.name}</span>
                <span className="ml-2 text-gray-400">{country.iso3}</span>
              </li>
            ))}
          </ul>
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Compare Countries</h1>

      {/* Country pickers + controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
          <CountryPicker label="Country A" value={countryA} onChange={setCountryA} />
          <CountryPicker label="Country B" value={countryB} onChange={setCountryB} />
        </div>
      </div>

      {/* Time range + category toggles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Time range */}
        <div className="inline-flex gap-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Category toggles */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveCategories([...ALL_CATEGORIES])}
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
      </div>

      {/* Chart */}
      {bothSelected ? (
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            {nameA} vs {nameB}
          </h2>
          <p className="mb-4 text-xs text-gray-400">
            Solid lines = {nameA} (blue) | Dashed lines = {nameB} (red)
          </p>
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
          <p className="text-center text-gray-400">
            Select two countries above to compare
          </p>
        </div>
      )}

      {/* Summary comparison text */}
      {bothSelected && (changeA || changeB) && (
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <p className="text-lg text-gray-700">
            Over the last {rangeLabel},{' '}
            {changeA ? (
              <>
                <strong>{nameA}</strong>&apos;s CPI rose by{' '}
                <span className={changeA.totalPct >= 0 ? 'font-bold text-blue-600' : 'font-bold text-green-600'}>
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
                <strong>{nameB}</strong>&apos;s CPI rose by{' '}
                <span className={changeB.totalPct >= 0 ? 'font-bold text-red-600' : 'font-bold text-green-600'}>
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

      {/* Category cards side by side */}
      {bothSelected && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-800">{nameA}</h3>
            <CategoryCards data={dataA} timeRange={timeRange} />
          </div>
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-800">{nameB}</h3>
            <CategoryCards data={dataB} timeRange={timeRange} />
          </div>
        </div>
      )}
    </div>
  );
}
