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
import type { Category, DataPoint, EventAnnotation, TimeRange } from '../types/index';
import { filterByTimeRange } from '../utils/dataTransforms';

interface ComparisonChartProps {
  dataA: Record<Category, DataPoint[]>;
  dataB: Record<Category, DataPoint[]>;
  labelA: string;
  labelB: string;
  activeCategories: Category[];
  events?: EventAnnotation[];
  timeRange: TimeRange;
}

const CATEGORY_LABELS: Record<Category, string> = {
  overall_cpi: 'Overall CPI',
  food_cpi: 'Food & Essentials',
  energy_benchmark: 'Energy (Oil)',
  energy_retail: 'Retail Energy',
  education_spend: 'Education',
};

/** Country A uses blue-toned solid lines */
const COLORS_A: Record<Category, string> = {
  overall_cpi: '#60a5fa',
  food_cpi: '#93c5fd',
  energy_benchmark: '#38bdf8',
  energy_retail: '#7dd3fc',
  education_spend: '#a78bfa',
};

/** Country B uses warm-toned dashed lines */
const COLORS_B: Record<Category, string> = {
  overall_cpi: '#f87171',
  food_cpi: '#fb923c',
  energy_benchmark: '#fbbf24',
  energy_retail: '#34d399',
  education_spend: '#f472b6',
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
  return label.length > 10 ? label.slice(0, 9) + '\u2026' : label;
}

interface ChartRow {
  year: number;
  [key: string]: number | null | undefined;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload, label, labelA, labelB }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="rounded-lg px-3 py-2.5"
      style={{
        backgroundColor: '#1a1f2e',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <p className="mb-1.5 text-xs font-semibold" style={{ color: '#8b95a5' }}>{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any) => {
          const nameStr = String(entry.name ?? entry.dataKey);
          const isA = nameStr.startsWith('a_');
          const catKey = nameStr.replace(/^[ab]_/, '') as Category;
          const catLabel = CATEGORY_LABELS[catKey] ?? catKey;
          const countryLabel = isA ? labelA : labelB;
          const displayLabel = `${countryLabel} - ${catLabel}`;
          const num = typeof entry.value === 'number' ? entry.value.toFixed(1) : 'N/A';

          return (
            <div key={nameStr} className="flex items-center gap-2 text-xs">
              <span
                className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span style={{ color: '#e8eaed' }}>{displayLabel}</span>
              <span className="ml-auto font-semibold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{num}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CustomLegend({ payload, labelA, labelB }: any) {
  if (!payload) return null;

  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 px-2">
      {payload.map((entry: any) => {
        const nameStr = String(entry.value);
        const isA = nameStr.startsWith('a_');
        const catKey = nameStr.replace(/^[ab]_/, '') as Category;
        const catLabel = CATEGORY_LABELS[catKey] ?? catKey;
        const countryLabel = isA ? labelA : labelB;
        const displayLabel = `${countryLabel} - ${catLabel}`;

        return (
          <span key={nameStr} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#8b95a5' }}>
            <span
              className="inline-block h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            {displayLabel}
          </span>
        );
      })}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function ComparisonChart({
  dataA,
  dataB,
  labelA,
  labelB,
  activeCategories,
  events,
  timeRange,
}: ComparisonChartProps) {
  const yearSet = new Set<number>();
  const filteredA: Partial<Record<Category, DataPoint[]>> = {};
  const filteredB: Partial<Record<Category, DataPoint[]>> = {};

  for (const cat of activeCategories) {
    const seriesA = dataA[cat] ?? [];
    const fA = filterByTimeRange(seriesA, timeRange);
    filteredA[cat] = fA;
    for (const dp of fA) yearSet.add(dp.year);

    const seriesB = dataB[cat] ?? [];
    const fB = filterByTimeRange(seriesB, timeRange);
    filteredB[cat] = fB;
    for (const dp of fB) yearSet.add(dp.year);
  }

  const years = Array.from(yearSet).sort((a, b) => a - b);

  const chartData: ChartRow[] = years.map((year) => {
    const row: ChartRow = { year };
    for (const cat of activeCategories) {
      const dpA = filteredA[cat]?.find((d) => d.year === year);
      row[`a_${cat}`] = dpA?.indexed ?? null;

      const dpB = filteredB[cat]?.find((d) => d.year === year);
      row[`b_${cat}`] = dpB?.indexed ?? null;
    }
    return row;
  });

  // Filter events to visible range - max 4
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

  // Calculate tick interval
  const tickInterval = (() => {
    const count = years.length;
    if (count <= 10) return 0;
    if (count <= 20) return 1;
    return Math.floor(count / 10);
  })();

  if (chartData.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center md:h-[420px]" style={{ color: '#8b95a5' }}>
        <div className="text-center">
          <svg className="mx-auto mb-2 h-8 w-8" style={{ color: '#555e6e' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tick={{ fontSize: 11, fill: '#8b95a5' }}
              interval={tickInterval}
              padding={{ left: 8, right: 8 }}
            />

            <YAxis
              domain={['auto', 'auto']}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#8b95a5' }}
              width={50}
            />

            {/* Base reference line */}
            <ReferenceLine
              y={100}
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="6 3"
              strokeWidth={1}
            />

            {/* Event annotations */}
            {visibleEvents.map((evt) => (
              <ReferenceLine
                key={`${evt.year}-${evt.label}`}
                x={evt.year}
                stroke="rgba(255,255,255,0.1)"
                strokeDasharray="3 3"
                strokeWidth={1}
                ifOverflow="hidden"
                label={{
                  value: shortenEventLabel(evt.label),
                  position: 'insideTopRight',
                  fontSize: 9,
                  fill: '#555e6e',
                  fontWeight: 500,
                }}
              />
            ))}

            <Tooltip
              content={<CustomTooltip labelA={labelA} labelB={labelB} />}
              cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
            />

            <Legend content={<CustomLegend labelA={labelA} labelB={labelB} />} />

            {/* Country A area fills */}
            {activeCategories.map((cat) => (
              <Area
                key={`area_a_${cat}`}
                type="monotone"
                dataKey={`a_${cat}`}
                stroke="none"
                fill={COLORS_A[cat]}
                fillOpacity={0.06}
                connectNulls
                isAnimationActive={false}
              />
            ))}

            {/* Country A lines - solid */}
            {activeCategories.map((cat) => (
              <Line
                key={`a_${cat}`}
                type="monotone"
                dataKey={`a_${cat}`}
                stroke={COLORS_A[cat]}
                strokeWidth={3}
                dot={false}
                connectNulls
                name={`a_${cat}`}
                activeDot={{ r: 4, strokeWidth: 2, fill: '#141820', stroke: COLORS_A[cat] }}
              />
            ))}

            {/* Country B lines - dashed */}
            {activeCategories.map((cat) => (
              <Line
                key={`b_${cat}`}
                type="monotone"
                dataKey={`b_${cat}`}
                stroke={COLORS_B[cat]}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                connectNulls
                name={`b_${cat}`}
                activeDot={{ r: 4, strokeWidth: 2, fill: '#141820', stroke: COLORS_B[cat] }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
