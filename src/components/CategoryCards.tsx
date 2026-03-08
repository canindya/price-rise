import type { Category, DataPoint, TimeRange } from '../types/index';
import { filterByTimeRange, calculateChange, getDataQuality } from '../utils/dataTransforms';
import DataQualityBadge from './DataQualityBadge';

interface CategoryCardsProps {
  data: Record<Category, DataPoint[]>;
  timeRange: TimeRange;
  customRange?: { startYear: number; endYear: number };
}

const CATEGORIES: { key: Category; label: string; note?: string; color?: string }[] = [
  { key: 'overall_cpi', label: 'Overall CPI' },
  { key: 'food_cpi', label: 'Food & Essentials' },
  { key: 'energy_benchmark', label: 'Energy (Oil Benchmark)' },
  { key: 'energy_retail', label: 'Retail Energy', note: 'Gasoline prices (USD/liter), coverage varies by country', color: '#f97316' },
  { key: 'education_spend', label: 'Education Investment (% GDP)', note: 'Government spending, not household cost', color: '#8b5cf6' },
];

function changeColor(pct: number): string {
  if (pct < 0) return 'text-blue-600';
  if (pct <= 5) return 'text-green-600';
  if (pct <= 20) return 'text-yellow-600';
  return 'text-red-600';
}

function ArrowUp() {
  return (
    <svg className="inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg className="inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function CategoryCards({ data, timeRange, customRange }: CategoryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {CATEGORIES.map(({ key, label, note }) => {
        const series = data[key] ?? [];
        const filtered = filterByTimeRange(series, timeRange, undefined, customRange);
        const quality = getDataQuality(filtered);
        const change = calculateChange(filtered);

        if (!change || quality === 'sparse') {
          return (
            <div
              key={key}
              className="rounded-xl bg-white p-4 shadow"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">{label}</h3>
                <DataQualityBadge quality={quality} />
              </div>
              {note && <p className="mt-0.5 text-xs italic text-gray-400">{note}</p>}
              <p className="mt-2 text-gray-400">Insufficient data</p>
            </div>
          );
        }

        const { totalPct } = change;
        const colorClass = changeColor(totalPct);

        return (
          <div
            key={key}
            className="rounded-xl bg-white p-4 shadow"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">{label}</h3>
              <DataQualityBadge quality={quality} />
            </div>
            {note && <p className="mt-0.5 text-xs italic text-gray-400">{note}</p>}
            <div className={`mt-2 flex items-baseline gap-1 text-2xl font-bold ${colorClass}`}>
              {totalPct >= 0 ? <ArrowUp /> : <ArrowDown />}
              <span>{totalPct >= 0 ? '+' : ''}{totalPct.toFixed(1)}%</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {change.annualizedPct >= 0 ? '+' : ''}
              {change.annualizedPct.toFixed(1)}% annualized
            </p>
          </div>
        );
      })}
    </div>
  );
}
