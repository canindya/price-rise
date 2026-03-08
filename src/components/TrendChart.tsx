import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
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
  overall_cpi: 'var(--color-cpi)',
  food_cpi: 'var(--color-food)',
  energy_benchmark: 'var(--color-energy)',
  energy_retail: 'var(--color-retail)',
  education_spend: 'var(--color-education)',
};

const CATEGORY_LABELS: Record<Category, string> = {
  overall_cpi: 'Overall CPI',
  food_cpi: 'Food',
  energy_benchmark: 'Energy (Oil)',
  energy_retail: 'Retail Energy',
  education_spend: 'Education',
};

const EVENT_SHORT: Record<string, string> = {
  'Global Financial Crisis': 'GFC \'08',
  'COVID-19 Pandemic': 'COVID',
  'Russia-Ukraine War': 'Ukraine',
  'Ukraine Conflict / Energy Crisis': 'Ukraine',
  'Arab Spring': 'Arab Spring',
  'Oil Price Crash': 'Oil Crash',
  'Oil Price Collapse': 'Oil Crash',
  'Brexit Referendum': 'Brexit',
  'US-China Trade War': 'Trade War',
  'US-China Trade War Begins': 'Trade War',
  'Eurozone Crisis': 'Eurozone',
  'European Debt Crisis': 'Euro Debt',
  'Global Supply Chain Crisis': 'Supply Crisis',
  'China Stock Market Crash': 'China \'15',
  'Global Banking Stress': 'Bank \'23',
  '2022 Food Price Crisis': 'Food Crisis',
};

function shortLabel(label: string): string {
  return EVENT_SHORT[label] ?? (label.length > 12 ? label.slice(0, 11) + '\u2026' : label);
}

interface ChartRow {
  year: number;
  [key: string]: number | null | undefined;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  // Deduplicate: only show Line entries (skip Area which duplicates)
  const seen = new Set<string>();
  const entries = payload.filter((entry: any) => {
    const key = String(entry.dataKey);
    if (seen.has(key)) return false;
    seen.add(key);
    // Skip entries with null/undefined values
    if (entry.value == null) return false;
    return true;
  });

  if (entries.length === 0) return null;

  return (
    <div
      className="rounded-lg px-4 py-3"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-hover)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        minWidth: 160,
      }}
    >
      <p className="mb-2 text-sm font-bold text-white">{label}</p>
      <div className="space-y-1.5">
        {entries.map((entry: any) => {
          const nameStr = String(entry.dataKey);
          const isAvg = nameStr.endsWith('_avg');
          const baseCat = isAvg ? nameStr.replace('_avg', '') : nameStr;
          const baseLabel = CATEGORY_LABELS[baseCat as Category] ?? baseCat;
          const displayLabel = isAvg ? `${baseLabel} (World)` : baseLabel;
          const num = typeof entry.value === 'number' ? entry.value.toFixed(1) : 'N/A';

          return (
            <div key={nameStr} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 flex-shrink-0"
                  style={{
                    backgroundColor: entry.color,
                    opacity: isAvg ? 0.5 : 1,
                    borderRadius: isAvg ? '50%' : '2px',
                  }}
                />
                <span style={{ color: isAvg ? 'var(--color-text-secondary)' : 'var(--color-text)' }}>{displayLabel}</span>
              </div>
              <span className="font-bold text-white tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{num}</span>
            </div>
          );
        })}
      </div>
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
  const yAxisLabel = viewMode === 'pct_change'
    ? 'YoY %'
    : viewMode === 'local_currency'
      ? 'CPI'
      : viewMode === 'ppp_adjusted'
        ? 'PPP'
        : 'Index';

  // Build merged data array keyed by year
  const yearSet = new Set<number>();
  const filteredData: Record<string, DataPoint[]> = {};
  const filteredBenchmark: Record<string, DataPoint[]> = {};

  for (const cat of activeCategories) {
    const series = data[cat] ?? [];
    const filtered = transformForViewMode(filterByTimeRange(series, timeRange, undefined, customRange), viewMode);
    filteredData[cat] = filtered;
    for (const dp of filtered) yearSet.add(dp.year);

    if (showBenchmark && benchmarkData) {
      const benchSeries = benchmarkData[cat] ?? [];
      const benchFiltered = transformForViewMode(filterByTimeRange(benchSeries, timeRange, undefined, customRange), viewMode);
      filteredBenchmark[cat] = benchFiltered;
      for (const dp of benchFiltered) yearSet.add(dp.year);
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
        (row as Record<string, unknown>)[`${cat}_avg`] = benchDp?.indexed ?? null;
      }
    }
    return row;
  });

  // Event annotations — max 3, well-spaced (at least 2 years apart)
  const minYear = years[0] ?? 0;
  const maxYear = years[years.length - 1] ?? 9999;
  const candidateEvents = (events ?? [])
    .filter((e) => e.year >= minYear && e.year <= maxYear && (e.category === 'all' || activeCategories.includes(e.category)));

  const visibleEvents: EventAnnotation[] = [];
  for (const evt of candidateEvents) {
    if (visibleEvents.length >= 3) break;
    const tooClose = visibleEvents.some((v) => Math.abs(v.year - evt.year) < 2);
    if (!tooClose) visibleEvents.push(evt);
  }

  // Tick interval
  const tickCount = years.length;
  const tickInterval = tickCount <= 10 ? 0 : tickCount <= 20 ? 1 : Math.floor(tickCount / 8);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center md:h-[480px]" style={{ color: 'var(--color-text-secondary)' }}>
        <div className="text-center">
          <svg className="mx-auto mb-2 h-10 w-10" style={{ color: 'var(--color-text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">No data to display</p>
        </div>
      </div>
    );
  }

  // Build a clean legend manually (not using Recharts Legend to avoid Area duplicates)
  const legendItems: { key: string; label: string; color: string; dashed: boolean }[] = activeCategories.map((cat) => ({
    key: cat as string,
    label: CATEGORY_LABELS[cat],
    color: CATEGORY_COLORS[cat],
    dashed: false,
  }));
  if (showBenchmark && benchmarkData) {
    for (const cat of activeCategories) {
      legendItems.push({
        key: `${cat}_avg`,
        label: `${CATEGORY_LABELS[cat]} (World)`,
        color: CATEGORY_COLORS[cat],
        dashed: true,
      });
    }
  }

  const refLineY = viewMode === 'indexed' ? 100 : viewMode === 'pct_change' ? 0 : null;

  return (
    <div className="w-full">
      {/* Chart */}
      <div className="h-[400px] md:h-[480px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 24, right: 20, left: 8, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" vertical={false} />

            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={{ stroke: 'var(--color-axis)' }}
              tick={{ fontSize: 12, fill: 'var(--color-text-secondary)', fontWeight: 500 }}
              interval={tickInterval}
              padding={{ left: 12, right: 12 }}
            />

            <YAxis
              domain={['auto', 'auto']}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              width={48}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: 'insideLeft',
                offset: 12,
                style: { textAnchor: 'middle', fontSize: 11, fill: 'var(--color-text-secondary)', fontWeight: 600 },
              }}
            />

            {/* Base reference line */}
            {refLineY != null && (
              <ReferenceLine
                y={refLineY}
                stroke="var(--color-ref-line)"
                strokeDasharray="8 4"
                strokeWidth={1}
                label={{
                  value: viewMode === 'indexed' ? 'Base' : '0%',
                  position: 'right',
                  fontSize: 10,
                  fill: 'var(--color-event-label)',
                }}
              />
            )}

            {/* Event annotations — max 3, subtle */}
            {visibleEvents.map((evt) => (
              <ReferenceLine
                key={`evt-${evt.year}`}
                x={evt.year}
                stroke="var(--color-event-line)"
                strokeDasharray="4 4"
                strokeWidth={1}
                ifOverflow="hidden"
                label={{
                  value: shortLabel(evt.label),
                  position: 'insideTopLeft',
                  fontSize: 9,
                  fill: 'var(--color-event-label)',
                  offset: 4,
                }}
              />
            ))}

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'var(--color-cursor)', strokeWidth: 1, strokeDasharray: '4 4' }}
            />

            {/* Main data lines — thicker, with dots on hover */}
            {activeCategories.map((cat) => (
              <Line
                key={cat}
                type="monotone"
                dataKey={cat}
                stroke={CATEGORY_COLORS[cat]}
                strokeWidth={3}
                dot={false}
                connectNulls
                name={cat}
                activeDot={{ r: 5, strokeWidth: 2, fill: 'var(--color-dot-fill)', stroke: CATEGORY_COLORS[cat] }}
              />
            ))}

            {/* Benchmark lines — thinner, dashed */}
            {showBenchmark && benchmarkData && activeCategories.map((cat) => (
              <Line
                key={`${cat}_avg`}
                type="monotone"
                dataKey={`${cat}_avg`}
                stroke={CATEGORY_COLORS[cat]}
                strokeWidth={1.5}
                strokeDasharray="6 4"
                strokeOpacity={0.4}
                dot={false}
                connectNulls
                name={`${cat}_avg`}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Custom legend — clean, no duplicates */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4">
        {legendItems.map((item) => (
          <div key={item.key} className="flex items-center gap-2 text-sm">
            {item.dashed ? (
              <span
                className="inline-block h-0 w-5 border-t-2 border-dashed flex-shrink-0"
                style={{ borderColor: item.color, opacity: 0.5 }}
              />
            ) : (
              <span
                className="inline-block h-3 w-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span style={{ color: item.dashed ? 'var(--color-text-muted)' : 'var(--color-text-secondary)' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
