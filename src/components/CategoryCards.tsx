import type { Category, DataPoint, TimeRange } from '../types/index';
import { filterByTimeRange, calculateChange, getDataQuality } from '../utils/dataTransforms';
import DataQualityBadge from './DataQualityBadge';

interface CategoryCardsProps {
  data: Record<Category, DataPoint[]>;
  timeRange: TimeRange;
  customRange?: { startYear: number; endYear: number };
}

const CATEGORIES: { key: Category; label: string; note?: string; color: string }[] = [
  { key: 'overall_cpi', label: 'Overall CPI', color: '#3b82f6' },
  { key: 'food_cpi', label: 'Food & Essentials', color: '#22c55e' },
  { key: 'energy_benchmark', label: 'Energy (Oil)', color: '#f59e0b' },
  {
    key: 'energy_retail',
    label: 'Retail Energy',
    note: 'Gasoline prices (USD/liter)',
    color: '#f97316',
  },
  {
    key: 'education_spend',
    label: 'Education (% GDP)',
    note: 'Government spending',
    color: '#8b5cf6',
  },
];

function changeColor(pct: number): string {
  if (pct < 0) return 'text-emerald-600';
  if (pct <= 5) return 'text-emerald-600';
  if (pct <= 20) return 'text-amber-600';
  return 'text-red-600';
}

function changeBg(pct: number): string {
  if (pct < 0) return 'bg-emerald-50';
  if (pct <= 5) return 'bg-emerald-50';
  if (pct <= 20) return 'bg-amber-50';
  return 'bg-red-50';
}

function ArrowUp() {
  return (
    <svg className="inline h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg className="inline h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function EmptyStateIcon() {
  return (
    <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 12H4m0 0l4-4m-4 4l4 4"
      />
    </svg>
  );
}

export default function CategoryCards({ data, timeRange, customRange }: CategoryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CATEGORIES.map(({ key, label, note, color }) => {
        const series = data[key] ?? [];
        const filtered = filterByTimeRange(series, timeRange, undefined, customRange);
        const quality = getDataQuality(filtered);
        const change = calculateChange(filtered);

        if (!change || quality === 'sparse') {
          return (
            <div
              key={key}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              {/* Header */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <h3 className="text-sm font-medium text-gray-600 truncate">{label}</h3>
                <span className="ml-auto">
                  <DataQualityBadge quality={quality} />
                </span>
              </div>

              {/* Empty state */}
              <div className="mt-4 flex flex-col items-center py-2">
                <EmptyStateIcon />
                <p className="mt-1.5 text-xs text-gray-400">Insufficient data</p>
              </div>
            </div>
          );
        }

        const { totalPct, annualizedPct } = change;
        const colorClass = changeColor(totalPct);
        const bgClass = changeBg(totalPct);

        return (
          <div
            key={key}
            className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            {/* Header */}
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <h3 className="text-sm font-medium text-gray-600 truncate">{label}</h3>
              <span className="ml-auto">
                <DataQualityBadge quality={quality} />
              </span>
            </div>

            {note && (
              <p className="mt-0.5 pl-4 text-[10px] text-gray-400">{note}</p>
            )}

            {/* Big number */}
            <div className={`mt-3 ${colorClass}`}>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tabular-nums">
                  {totalPct >= 0 ? '+' : ''}{totalPct.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                {totalPct >= 0 ? <ArrowUp /> : <ArrowDown />}
                <span className="tabular-nums">
                  {annualizedPct >= 0 ? '+' : ''}{annualizedPct.toFixed(1)}% annualized
                </span>
              </div>
            </div>

            {/* Subtle indicator bar */}
            <div className="mt-3">
              <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${bgClass}`}
                  style={{
                    width: `${Math.min(Math.abs(totalPct) / 100 * 100, 100)}%`,
                    backgroundColor: color,
                    opacity: 0.3,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
