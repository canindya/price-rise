import { useMemo } from 'react';
import type { Category, DataPoint, TimeRange } from '../types/index';
import {
  usePersonalBasket,
  calculatePersonalInflation,
  BASKET_CATEGORIES,
} from '../hooks/usePersonalBasket';
import { filterByTimeRange, calculateChange } from '../utils/dataTransforms';

interface MyBasketProps {
  open: boolean;
  onClose: () => void;
  /** All category data for the selected country. */
  data: Record<Category, DataPoint[]>;
  timeRange: TimeRange;
  customRange?: { startYear: number; endYear: number };
}

export default function MyBasket({
  open,
  onClose,
  data,
  timeRange,
  customRange,
}: MyBasketProps) {
  const { weights, setWeight, resetToDefault } = usePersonalBasket();

  const categoryChanges = useMemo(() => {
    const changes: Partial<Record<Category, number>> = {};
    for (const { key } of BASKET_CATEGORIES) {
      const series = data[key] ?? [];
      const filtered = filterByTimeRange(series, timeRange, undefined, customRange);
      const change = calculateChange(filtered);
      if (change) {
        changes[key] = change.totalPct;
      }
    }
    return changes;
  }, [data, timeRange, customRange]);

  const personalInflation = useMemo(
    () => calculatePersonalInflation(weights, categoryChanges),
    [weights, categoryChanges],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">My Basket</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          Adjust category weights to match your spending patterns. Weights auto-adjust to total 100%.
        </p>

        <div className="space-y-4">
          {BASKET_CATEGORIES.map(({ key, label }) => {
            const change = categoryChanges[key];
            return (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{label}</span>
                  <div className="flex items-center gap-3">
                    {change != null && (
                      <span
                        className={`text-xs ${change >= 0 ? 'text-red-500' : 'text-blue-500'}`}
                      >
                        {change >= 0 ? '+' : ''}
                        {change.toFixed(1)}%
                      </span>
                    )}
                    <span className="w-10 text-right font-mono text-xs text-gray-500">
                      {weights[key]}%
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights[key]}
                  onChange={(e) => setWeight(key, Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
                />
              </div>
            );
          })}
        </div>

        {/* Personal inflation result */}
        {personalInflation != null && (
          <div className="mt-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Your Personal Inflation
            </p>
            <p
              className={`mt-1 text-3xl font-bold ${
                personalInflation >= 0 ? 'text-red-600' : 'text-blue-600'
              }`}
            >
              {personalInflation >= 0 ? '+' : ''}
              {personalInflation.toFixed(1)}%
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-between">
          <button
            onClick={resetToDefault}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
