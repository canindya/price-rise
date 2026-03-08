import type { Category, DataPoint, TimeRange } from '../types/index';
import { filterByTimeRange, calculateChange, getDataQuality } from '../utils/dataTransforms';
import DataQualityBadge from './DataQualityBadge';

interface CategoryCardsProps {
  data: Record<Category, DataPoint[]>;
  timeRange: TimeRange;
  customRange?: { startYear: number; endYear: number };
}

const CATEGORIES: { key: Category; label: string; note?: string; color: string; iconColor: string; iconBg: string }[] = [
  {
    key: 'overall_cpi',
    label: 'Overall CPI',
    color: '#3b82f6',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    key: 'food_cpi',
    label: 'Food & Essentials',
    color: '#22c55e',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
  },
  {
    key: 'energy_benchmark',
    label: 'Energy (Oil)',
    color: '#f59e0b',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  {
    key: 'energy_retail',
    label: 'Retail Energy',
    note: 'Gasoline prices (USD/liter)',
    color: '#f97316',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
  },
  {
    key: 'education_spend',
    label: 'Education (% GDP)',
    note: 'Government spending',
    color: '#8b5cf6',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
];

function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  switch (category) {
    case 'overall_cpi':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 7h4v4" />
        </svg>
      );
    case 'food_cpi':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      );
    case 'energy_benchmark':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'energy_retail':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      );
    case 'education_spend':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
        </svg>
      );
  }
}

function CaretUp() {
  return (
    <svg className="inline h-3.5 w-3.5 text-red-500" fill="currentColor" viewBox="0 0 320 512">
      <path d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9S18.7 320 32 320h256c13.3 0 25.3-7.6 30.6-19.6s2.3-25.7-6.9-34.9l-128-128z" />
    </svg>
  );
}

function CaretDown() {
  return (
    <svg className="inline h-3.5 w-3.5 text-green-500" fill="currentColor" viewBox="0 0 320 512">
      <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9S301.3 192 288 192H32c-13.3 0-25.3 7.6-30.6 19.6s-2.3 25.7 6.9 34.9l128 128z" />
    </svg>
  );
}

export default function CategoryCards({ data, timeRange, customRange }: CategoryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {CATEGORIES.map(({ key, label, note, iconColor, iconBg }) => {
        const series = data[key] ?? [];
        const filtered = filterByTimeRange(series, timeRange, undefined, customRange);
        const quality = getDataQuality(filtered);
        const change = calculateChange(filtered);

        if (!change || quality === 'sparse') {
          return (
            <div
              key={key}
              className="border-2 border-gray-400 border-dashed rounded p-6 m-2 text-center transition-all duration-300 hover:border-transparent hover:bg-white hover:shadow-xl"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                <CategoryIcon category={key} className="h-6 w-6 text-gray-400" />
              </div>
              <p className="mt-3 text-sm font-bold text-gray-400">Insufficient data</p>
              <p className="mt-1 text-xs font-bold text-gray-500">{label}</p>
              <div className="mt-2 flex justify-center">
                <DataQualityBadge quality={quality} />
              </div>
            </div>
          );
        }

        const { totalPct, annualizedPct } = change;

        return (
          <div
            key={key}
            className="border-2 border-gray-400 border-dashed rounded p-6 m-2 text-center transition-all duration-300 hover:border-transparent hover:bg-white hover:shadow-xl"
          >
            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
              <CategoryIcon category={key} className={`h-6 w-6 ${iconColor}`} />
            </div>

            <div className="mt-3 flex items-center justify-center gap-1">
              <span className="text-3xl font-bold text-black tabular-nums">
                {totalPct >= 0 ? '+' : ''}{totalPct.toFixed(1)}%
              </span>
              {totalPct >= 0 ? <CaretUp /> : <CaretDown />}
            </div>

            <div className="mt-1 text-xs text-gray-500 tabular-nums">
              {annualizedPct >= 0 ? '+' : ''}{annualizedPct.toFixed(1)}% annualized
            </div>

            <p className="mt-2 text-sm font-bold text-gray-500">{label}</p>
            {note && (
              <p className="mt-0.5 text-[10px] text-gray-400">{note}</p>
            )}
            <div className="mt-2 flex justify-center">
              <DataQualityBadge quality={quality} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
