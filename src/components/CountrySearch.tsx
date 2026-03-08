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

  // Resolve selected country name for display
  const allCountries = getAllCountries();
  const selectedName =
    selectedCountry != null
      ? allCountries.find((c) => c.code === selectedCountry || c.iso3 === selectedCountry)?.name ?? ''
      : '';

  // Initialize input with selected country name
  useEffect(() => {
    if (!isOpen && selectedName) {
      setQuery(selectedName);
    }
  }, [selectedName, isOpen]);

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

  return (
    <div className="relative w-full max-w-sm">
      <input
        ref={inputRef}
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
  );
}
