import { useMemo, useEffect, useState } from 'react';
import type { Category, DataPoint, TimeRange } from '../types/index';
import {
  usePersonalBasket,
  calculatePersonalInflation,
  BASKET_CATEGORIES,
} from '../hooks/usePersonalBasket';
import { filterByTimeRange, calculateChange } from '../utils/dataTransforms';

const CATEGORY_COLORS: Record<Category, string> = {
  overall_cpi: '#6366f1',
  food_cpi: '#f59e0b',
  energy_benchmark: '#ef4444',
  energy_retail: '#10b981',
  education_spend: '#3b82f6',
};

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
  const [visible, setVisible] = useState(false);

  // Animate entrance
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

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

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-200 ${
        visible ? 'bg-black/50' : 'bg-black/0'
      }`}
    >
      <div
        className={`w-full max-w-lg rounded-2xl bg-white shadow-2xl transition-all duration-300 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 pt-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Basket</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="mb-5 text-sm text-gray-500">
            Adjust category weights to match your spending patterns. Weights auto-adjust to total 100%.
          </p>

          <div className="flex flex-col gap-5">
            {BASKET_CATEGORIES.map(({ key, label }) => {
              const change = categoryChanges[key];
              const color = CATEGORY_COLORS[key];
              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-gray-700">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {change != null && (
                        <span
                          className={`text-xs ${change >= 0 ? 'text-red-500' : 'text-blue-500'}`}
                        >
                          {change >= 0 ? '+' : ''}
                          {change.toFixed(1)}%
                        </span>
                      )}
                      <span className="w-10 text-right font-mono text-xs font-medium text-gray-500">
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
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-600"
                  />
                </div>
              );
            })}
          </div>

          {/* Personal inflation result */}
          {personalInflation != null && (
            <div className="mt-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Your Personal Inflation
              </p>
              <p
                className={`mt-1.5 text-3xl font-bold tracking-tight ${
                  personalInflation >= 0 ? 'text-red-600' : 'text-blue-600'
                }`}
              >
                {personalInflation >= 0 ? '+' : ''}
                {personalInflation.toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 pt-4 pb-6">
          <button
            onClick={resetToDefault}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50"
          >
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
