import { useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { CountryMeta } from '../types/index';
import { searchCountries } from '../utils/countryCodeMap';

const ACCENT_BORDERS = [
  'hover:border-[var(--color-accent)]',
  'hover:border-[var(--color-cpi)]',
  'hover:border-[var(--color-accent-warm)]',
];

const FEATURES = [
  {
    title: 'Time-Series Tracking',
    description:
      'Go beyond static snapshots. See how prices have evolved over 1, 5, and 10 years with interactive charts and indexed comparisons.',
    icon: (
      <svg className="h-8 w-8 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 17l6-6 4 4 8-8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 7h4v4" />
      </svg>
    ),
    accent: 0,
  },
  {
    title: 'Category Breakdown',
    description:
      'Drill into the categories that matter most: overall consumer prices, food and essentials, and energy benchmarks.',
    icon: (
      <svg className="h-8 w-8 text-[var(--color-cpi)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h10M4 18h6" />
      </svg>
    ),
    accent: 1,
  },
  {
    title: 'Country Comparison',
    description:
      'Compare cost of living trends across the globe with data sourced from the World Bank, FAO, and other international bodies.',
    icon: (
      <svg className="h-8 w-8 text-[var(--color-accent-warm)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: 2,
  },
];

const STATS = [
  { value: '180+', label: 'Countries' },
  { value: '25+', label: 'Years of Data' },
  { value: '5', label: 'Categories' },
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
    <div className="flex flex-col mesh-bg">
      {/* Hero Section */}
      <section className="pb-16 pt-16 sm:pb-24 sm:pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="animate-fade-up text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl" style={{ fontFamily: "'Crimson Pro', serif", color: 'var(--color-text)' }}>
              How Has Your Cost of Living{' '}
              <span className="text-[var(--color-accent)]">Changed</span>?
            </h1>
            <p className="animate-fade-up delay-1 mt-6 text-lg leading-relaxed text-[var(--color-text-secondary)]">
              Track how consumer prices have changed across countries over time.
              Explore inflation trends broken down by what people actually spend on.
            </p>

            {/* Search bar */}
            <div className="animate-fade-up delay-2 relative mx-auto mt-10 max-w-lg">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]"
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
                  className="w-full rounded-xl border border-white/[0.06] py-3.5 pl-12 pr-4 text-base text-[var(--color-text)] placeholder-[var(--color-text-muted)] shadow-sm transition-all focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
                  style={{ backgroundColor: 'var(--color-bg-elevated)' }}
                />
              </div>
              {isOpen && results.length > 0 && (
                <ul className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-white/[0.06] shadow-lg" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                  {results.map((country, idx) => (
                    <li
                      key={country.iso3}
                      onMouseDown={() => selectCountry(country)}
                      className={`cursor-pointer px-4 py-3 text-sm ${
                        idx === highlightIdx
                          ? 'bg-white/[0.08] text-white'
                          : 'text-[var(--color-text-secondary)] hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="font-medium text-[var(--color-text)]">{country.name}</span>
                      <span className="ml-2 font-mono text-[var(--color-text-muted)] text-xs">{country.iso3}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* CTA */}
            <div className="animate-fade-up delay-3 mt-8">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-[var(--color-bg)] shadow-sm transition-all hover:shadow-[0_0_20px_rgba(74,222,128,0.25)]"
                style={{ backgroundColor: 'var(--color-accent)' }}
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
      <section className="animate-fade-up delay-4 border-y border-white/[0.06] py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-mono text-3xl font-bold text-[var(--color-text)] sm:text-4xl">{stat.value}</div>
              <div className="mt-1 text-sm font-medium text-[var(--color-text-muted)]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {FEATURES.map((feature, idx) => (
              <div
                key={feature.title}
                className={`animate-fade-up glass-card p-6 transition-all ${ACCENT_BORDERS[feature.accent]}`}
                style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text)]" style={{ fontFamily: "'Crimson Pro', serif" }}>{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer attribution */}
      <section className="border-t border-white/[0.06] py-10">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--color-text-muted)]">
            Built with data from{' '}
            <a href="https://data.worldbank.org" target="_blank" rel="noopener noreferrer" className="text-[var(--color-cpi)] hover:underline">World Bank</a>,{' '}
            <a href="https://www.fao.org/faostat" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">FAO</a>, and{' '}
            <a href="https://www.worldbank.org/en/research/commodity-markets" target="_blank" rel="noopener noreferrer" className="text-[var(--color-education)] hover:underline">UNESCO</a>
          </p>
        </div>
      </section>
    </div>
  );
}
