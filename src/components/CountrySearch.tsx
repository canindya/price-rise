import { useState, useRef, useCallback, useEffect } from 'react';
import type { CountryMeta } from '../types/index';
import { searchCountries, getAllCountries } from '../utils/countryCodeMap';
import { useAppState, useAppDispatch } from '../context/AppContext';

export default function CountrySearch() {
  const { selectedCountry } = useAppState();
  const dispatch = useAppDispatch();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CountryMeta[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Resolve selected country name for display
  const allCountries = getAllCountries();
  const selectedMeta =
    selectedCountry != null
      ? allCountries.find((c) => c.code === selectedCountry || c.iso3 === selectedCountry) ?? null
      : null;
  const selectedName = selectedMeta?.name ?? '';

  // Initialize input with selected country name
  useEffect(() => {
    if (!isOpen && selectedName) {
      setQuery(selectedName);
    }
  }, [selectedName, isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('li');
      items[highlightIdx]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIdx]);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    if (value.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const matches = searchCountries(value).slice(0, 10);
    setResults(matches);
    setIsOpen(matches.length > 0);
    setHighlightIdx(-1);
  }, []);

  const selectCountry = useCallback(
    (country: CountryMeta) => {
      dispatch({ type: 'SELECT_COUNTRY', payload: country.iso3 });
      setQuery(country.name);
      setIsOpen(false);
      setHighlightIdx(-1);
    },
    [dispatch],
  );

  const clearSelection = useCallback(() => {
    dispatch({ type: 'SELECT_COUNTRY', payload: null });
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setHighlightIdx(-1);
    inputRef.current?.focus();
  }, [dispatch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIdx((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIdx((prev) => Math.max(prev - 1, 0));
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

  const hasSelection = selectedCountry != null && selectedName !== '';

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        {/* Search icon */}
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: '#555e6e' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="Search countries..."
          className="w-full rounded-lg py-2 pl-9 pr-8 text-sm transition-colors duration-150 focus:outline-none"
          style={{
            backgroundColor: '#141820',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e8eaed',
            fontFamily: "'DM Sans', sans-serif",
          }}
        />

        {/* Clear button */}
        {hasSelection && (
          <button
            onClick={clearSelection}
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 transition-colors duration-150"
            style={{ color: '#555e6e' }}
            aria-label="Clear selection"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg py-1 shadow-lg"
          style={{
            backgroundColor: '#1a1f2e',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {results.map((country, idx) => (
            <li
              key={country.iso3}
              onMouseDown={() => selectCountry(country)}
              onMouseEnter={() => setHighlightIdx(idx)}
              className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors duration-150"
              style={{
                backgroundColor: idx === highlightIdx ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: idx === highlightIdx ? '#e8eaed' : '#8b95a5',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <span className="font-medium" style={{ color: '#e8eaed' }}>{country.name}</span>
              <span className="text-xs" style={{ color: '#555e6e' }}>{country.region}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
