import { useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { CountryMeta } from '../types/index';
import { searchCountries } from '../utils/countryCodeMap';

const FEATURES = [
  {
    title: 'Time-Series Tracking',
    description:
      'Go beyond static snapshots. See how prices have evolved over 1, 5, and 10 years with interactive charts and indexed comparisons.',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 17l6-6 4 4 8-8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 7h4v4" />
      </svg>
    ),
  },
  {
    title: 'Category Breakdown',
    description:
      'Drill into the categories that matter most: overall consumer prices, food and essentials, and energy benchmarks.',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h10M4 18h6" />
      </svg>
    ),
  },
  {
    title: 'Country Comparison',
    description:
      'Compare cost of living trends across the globe with data sourced from the World Bank, FAO, and other international bodies.',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const STATS = [
  {
    value: '180+',
    label: 'Countries',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-gray-300',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: '25+',
    label: 'Years of Data',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-gray-300',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: '5',
    label: 'Categories',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-gray-300',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h6" />
      </svg>
    ),
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CountryMeta[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    if (value.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const matches = searchCountries(value).slice(0, 8);
    setResults(matches);
    setIsOpen(matches.length > 0);
    setHighlightIdx(-1);
  }, []);

  const selectCountry = useCallback(
    (country: CountryMeta) => {
      setQuery(country.name);
      setIsOpen(false);
      setHighlightIdx(-1);
      navigate(`/country/${country.iso3}`);
    },
    [navigate],
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
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-black sm:text-5xl">
              Global Cost of Living Tracker
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-500">
              Track how consumer prices have changed across countries over time.
              Explore inflation trends broken down by what people actually spend on.
            </p>

            {/* Search bar */}
            <div className="relative mx-auto mt-10 max-w-lg">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
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
                  placeholder="Search for a country..."
                  className="w-full rounded-full bg-gray-200 py-3.5 pl-12 pr-4 text-base transition-all duration-300 focus:bg-white focus:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              {isOpen && results.length > 0 && (
                <ul className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                  {results.map((country, idx) => (
                    <li
                      key={country.iso3}
                      onMouseDown={() => selectCountry(country)}
                      className={`cursor-pointer px-4 py-3 text-sm ${
                        idx === highlightIdx
                          ? 'bg-indigo-50 text-indigo-900'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{country.name}</span>
                      <span className="ml-2 text-gray-400">{country.iso3}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* CTA */}
            <div className="mt-8">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Explore All Countries
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-gray-100 py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-4 px-4 sm:px-6 lg:px-8">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="border-2 border-gray-400 border-dashed rounded p-6 m-2 text-center transition-all duration-300 hover:border-transparent hover:bg-white hover:shadow-xl"
            >
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${stat.iconBg}`}>
                <span className={stat.iconColor}>{stat.icon}</span>
              </div>
              <div className="mt-3 text-3xl font-bold text-black">{stat.value}</div>
              <div className="mt-1 text-sm font-bold text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="bg-gray-100 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="border-2 border-gray-400 border-dashed rounded p-6 m-2 transition-all duration-300 hover:border-transparent hover:bg-white hover:shadow-xl"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${feature.iconBg}`}>
                  <span className={feature.iconColor}>{feature.icon}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-black">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer attribution */}
      <section className="border-t border-gray-200 bg-gray-200 py-10">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">
            Built with data from{' '}
            <a href="https://data.worldbank.org" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">World Bank</a>,{' '}
            <a href="https://www.fao.org/faostat" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">FAO</a>, and{' '}
            <a href="https://www.worldbank.org/en/research/commodity-markets" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">UNESCO</a>
          </p>
        </div>
      </section>
    </div>
  );
}
