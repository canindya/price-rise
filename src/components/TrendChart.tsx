import { useCallback } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  ComposedChart,
} from 'recharts';
import type { Category, DataPoint, EventAnnotation, TimeRange, ViewMode } from '../types/index';
import { filterByTimeRange, transformForViewMode } from '../utils/dataTransforms';

interface TrendChartProps {
  data: Record<Category, DataPoint[]>;
  activeCategories: Category[];
  events?: EventAnnotation[];
  timeRange: TimeRange;
  customRange?: { startYear: number; endYear: number };
  viewMode?: ViewMode;
  showBenchmark?: boolean;
  benchmarkData?: Record<Category, DataPoint[]>;
}

const CATEGORY_COLORS: Record<Category, string> = {
  overall_cpi: '#3b82f6',
  food_cpi: '#22c55e',
  energy_benchmark: '#f59e0b',
  energy_retail: '#f97316',
  education_spend: '#8b5cf6',
};

const CATEGORY_LABELS: Record<Category, string> = {
  overall_cpi: 'Overall CPI',
  food_cpi: 'Food & Essentials',
  energy_benchmark: 'Energy (Oil)',
  energy_retail: 'Retail Energy',
  education_spend: 'Education',
};

/** Short labels for event annotations */
const EVENT_SHORT_LABELS: Record<string, string> = {
  'Global Financial Crisis': 'GFC',
  'COVID-19 Pandemic': 'COVID',
  'Russia-Ukraine War': 'Ukraine',
  'Arab Spring': 'Arab Spr.',
  'Oil Price Crash': 'Oil Crash',
  'Brexit Referendum': 'Brexit',
  'US-China Trade War': 'Trade War',
  'Eurozone Crisis': 'Euro Crisis',
};

function shortenEventLabel(label: string): string {
  if (EVENT_SHORT_LABELS[label]) return EVENT_SHORT_LABELS[label];
  // Truncate to 10 chars max
  return label.length > 10 ? label.slice(0, 9) + '\u2026' : label;
}

interface ChartRow {
  year: number;
  [key: string]: number | null | undefined;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2.5 shadow-lg">
      <p className="mb-1.5 text-xs font-semibold text-gray-500">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any) => {
          const nameStr = String(entry.name ?? entry.dataKey);
          const isAvg = nameStr.endsWith('_avg');
          const baseCat = isAvg ? nameStr.replace('_avg', '') : nameStr;
          const baseLabel = CATEGORY_LABELS[baseCat as Category] ?? baseCat;
          const displayLabel = isAvg ? `${baseLabel} (Avg)` : baseLabel;
          const num = typeof entry.value === 'number' ? entry.value.toFixed(1) : 'N/A';

          return (
            <div key={nameStr} className="flex items-center gap-2 text-xs">
              <span
                className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{displayLabel}</span>
              <span className="ml-auto font-semibold text-gray-900">{num}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload) return null;

  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 px-2">
      {payload.map((entry: any) => {
        const nameStr = String(entry.value);
        const isAvg = nameStr.endsWith('_avg');
        const baseCat = isAvg ? nameStr.replace('_avg', '') : nameStr;
        const baseLabel = CATEGORY_LABELS[baseCat as Category] ?? baseCat;
        const displayLabel = isAvg ? `${baseLabel} (Avg)` : baseLabel;

        return (
          <span key={nameStr} className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <span
              className="inline-block h-2 w-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: entry.color,
                opacity: isAvg ? 0.5 : 1,
              }}
            />
            {displayLabel}
          </span>
        );
      })}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function TrendChart({
  data,
  activeCategories,
  events,
  timeRange,
  customRange,
  viewMode = 'indexed',
  showBenchmark,
  benchmarkData,
}: TrendChartProps) {
  const Y_AXIS_LABELS: Record<ViewMode, string> = {
    indexed: 'Index (Base = 100)',
    pct_change: 'YoY Change (%)',
    local_currency: 'CPI Value',
    ppp_adjusted: 'PPP-Adjusted',
  };

  // Build merged data array keyed by year
  const yearSet = new Set<number>();
  const filteredData: Record<Category, DataPoint[]> = {} as Record<Category, DataPoint[]>;
  const filteredBenchmark: Record<Category, DataPoint[]> = {} as Record<Category, DataPoint[]>;

  for (const cat of activeCategories) {
    const series = data[cat] ?? [];
    const filtered = transformForViewMode(filterByTimeRange(series, timeRange, undefined, customRange), viewMode);
    filteredData[cat] = filtered;
    for (const dp of filtered) {
      yearSet.add(dp.year);
    }

    if (showBenchmark && benchmarkData) {
      const benchSeries = benchmarkData[cat] ?? [];
      const benchFiltered = filterByTimeRange(benchSeries, timeRange, undefined, customRange);
      filteredBenchmark[cat] = benchFiltered;
      for (const dp of benchFiltered) {
        yearSet.add(dp.year);
      }
    }
  }

  const years = Array.from(yearSet).sort((a, b) => a - b);

  const chartData: ChartRow[] = years.map((year) => {
    const row: ChartRow = { year };
    for (const cat of activeCategories) {
      const dp = filteredData[cat]?.find((d) => d.year === year);
      row[cat] = dp?.indexed ?? null;

      if (showBenchmark && benchmarkData) {
        const benchDp = filteredBenchmark[cat]?.find((d) => d.year === year);
        const avgKey = `${cat}_avg` as keyof ChartRow;
        (row as Record<string, unknown>)[avgKey] = benchDp?.indexed ?? null;
      }
    }
    return row;
  });

  // Filter events to visible range - pick only the most relevant (max 4)
  const minYear = years.length > 0 ? years[0] : 0;
  const maxYear = years.length > 0 ? years[years.length - 1] : 9999;
  const visibleEvents = (events ?? [])
    .filter(
      (e) =>
        e.year >= minYear &&
        e.year <= maxYear &&
        (e.category === 'all' || activeCategories.includes(e.category)),
    )
    .slice(0, 4);

  // Calculate responsive tick interval
  const tickInterval = useCallback(() => {
    const count = years.length;
    if (count <= 10) return 0;
    if (count <= 20) return 1;
    return Math.floor(count / 10);
  }, [years.length]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center text-gray-400 md:h-[420px]">
        <div className="text-center">
          <svg className="mx-auto mb-2 h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">No data to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-[350px] md:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 16, right: 16, left: 4, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              interval={tickInterval()}
              padding={{ left: 8, right: 8 }}
            />

            <YAxis
              domain={['auto', 'auto']}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              width={50}
              label={{
                value: Y_AXIS_LABELS[viewMode],
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { textAnchor: 'middle', fontSize: 10, fill: '#94a3b8', fontWeight: 500 },
              }}
            />

            {/* Base reference line */}
            {viewMode === 'indexed' && (
              <ReferenceLine
                y={100}
                stroke="#cbd5e1"
                strokeDasharray="6 3"
                strokeWidth={1}
              />
            )}
            {viewMode === 'pct_change' && (
              <ReferenceLine
                y={0}
                stroke="#cbd5e1"
                strokeDasharray="6 3"
                strokeWidth={1}
              />
            )}

            {/* Event annotations - subtle, clipped, short labels */}
            {visibleEvents.map((evt) => (
              <ReferenceLine
                key={`${evt.year}-${evt.label}`}
                x={evt.year}
                stroke="#cbd5e1"
                strokeDasharray="3 3"
                strokeWidth={1}
                ifOverflow="hidden"
                label={{
                  value: shortenEventLabel(evt.label),
                  position: 'insideTopRight',
                  fontSize: 9,
                  fill: '#94a3b8',
                  fontWeight: 500,
                }}
              />
            ))}

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
            />

            <Legend content={<CustomLegend />} />

            {/* Area fills under lines */}
            {activeCategories.map((cat) => (
              <Area
                key={`area_${cat}`}
                type="monotone"
                dataKey={cat}
                stroke="none"
                fill={CATEGORY_COLORS[cat]}
                fillOpacity={0.06}
                connectNulls
                isAnimationActive={false}
              />
            ))}

            {/* Main data lines */}
            {activeCategories.map((cat) => (
              <Line
                key={cat}
                type="monotone"
                dataKey={cat}
                stroke={CATEGORY_COLORS[cat]}
                strokeWidth={2.5}
                dot={false}
                connectNulls
                name={cat}
                activeDot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: CATEGORY_COLORS[cat] }}
              />
            ))}

            {/* Benchmark lines */}
            {showBenchmark && benchmarkData && activeCategories.map((cat) => (
              <Line
                key={`${cat}_avg`}
                type="monotone"
                dataKey={`${cat}_avg`}
                stroke={CATEGORY_COLORS[cat]}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                strokeOpacity={0.4}
                dot={false}
                connectNulls
                name={`${cat}_avg`}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
