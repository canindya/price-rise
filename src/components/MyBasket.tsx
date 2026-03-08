import { useMemo, useEffect, useState } from 'react';
import type { Category, DataPoint, TimeRange } from '../types/index';
import {
  usePersonalBasket,
  calculatePersonalInflation,
  BASKET_CATEGORIES,
} from '../hooks/usePersonalBasket';
import { filterByTimeRange, calculateChange } from '../utils/dataTransforms';

const CATEGORY_COLORS: Record<Category, string> = {
  overall_cpi: '#60a5fa',
  food_cpi: '#4ade80',
  energy_benchmark: '#fbbf24',
  energy_retail: '#fb923c',
  education_spend: '#c084fc',
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
        visible ? 'bg-black/60' : 'bg-black/0'
      }`}
    >
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl transition-all duration-300 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
        style={{
          backgroundColor: '#141820',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: '#e8eaed', fontFamily: "'Crimson Pro', serif" }}
          >
            My Basket
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 transition-colors duration-150"
            style={{ color: '#555e6e' }}
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p
            className="mb-5 text-sm"
            style={{ color: '#8b95a5', fontFamily: "'DM Sans', sans-serif" }}
          >
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
                      <span
                        className="font-medium"
                        style={{ color: '#e8eaed', fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {change != null && (
                        <span
                          className="text-xs"
                          style={{
                            color: change >= 0 ? '#ef4444' : '#3b82f6',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {change >= 0 ? '+' : ''}
                          {change.toFixed(1)}%
                        </span>
                      )}
                      <span
                        className="w-10 text-right text-xs font-medium"
                        style={{ color: '#8b95a5', fontFamily: "'JetBrains Mono', monospace" }}
                      >
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
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
                    style={{ backgroundColor: '#1a1f2e', accentColor: '#4ade80' }}
                  />
                </div>
              );
            })}
          </div>

          {/* Personal inflation result */}
          {personalInflation != null && (
            <div
              className="mt-6 rounded-xl p-5 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(74,222,128,0.08), rgba(99,102,241,0.08))',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <p
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: '#8b95a5', fontFamily: "'DM Sans', sans-serif" }}
              >
                Your Personal Inflation
              </p>
              <p
                className="mt-1.5 text-3xl font-bold tracking-tight"
                style={{
                  color: personalInflation >= 0 ? '#ef4444' : '#3b82f6',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {personalInflation >= 0 ? '+' : ''}
                {personalInflation.toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 pt-4 pb-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={resetToDefault}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#8b95a5',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg px-5 py-2 text-sm font-medium transition-colors duration-150"
            style={{
              backgroundColor: '#4ade80',
              color: '#0c0f14',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
