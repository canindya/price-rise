import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
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
  education_spend: 'Education Investment',
};

/** Country A uses blue-toned solid lines */
const COLORS_A: Record<Category, string> = {
  overall_cpi: '#2563eb',
  food_cpi: '#3b82f6',
  energy_benchmark: '#60a5fa',
  energy_retail: '#93c5fd',
  education_spend: '#7c3aed',
};

/** Country B uses red-toned dashed lines */
const COLORS_B: Record<Category, string> = {
  overall_cpi: '#dc2626',
  food_cpi: '#ef4444',
  energy_benchmark: '#f87171',
  energy_retail: '#fca5a5',
  education_spend: '#c084fc',
};

interface ChartRow {
  year: number;
  [key: string]: number | null | undefined;
}

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

  // Filter events to visible range
  const minYear = years.length > 0 ? years[0] : 0;
  const maxYear = years.length > 0 ? years[years.length - 1] : 9999;
  const visibleEvents = (events ?? []).filter(
    (e) =>
      e.year >= minYear &&
      e.year <= maxYear &&
      (e.category === 'all' || activeCategories.includes(e.category)),
  );

  if (chartData.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-gray-400">
        No data to display
      </div>
    );
  }

  /** Build a display name from a data key like "a_overall_cpi" */
  function toDisplayName(dataKey: string): string {
    const isA = dataKey.startsWith('a_');
    const catKey = dataKey.replace(/^[ab]_/, '') as Category;
    const catLabel = CATEGORY_LABELS[catKey] ?? catKey;
    const countryLabel = isA ? labelA : labelB;
    return `${countryLabel} - ${catLabel}`;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <XAxis dataKey="year" tickLine={false} />
        <YAxis domain={['auto', 'auto']} tickLine={false} />

        <ReferenceLine y={100} stroke="#9ca3af" strokeDasharray="6 3" label="Base" />

        {visibleEvents.map((evt) => (
          <ReferenceLine
            key={`${evt.year}-${evt.label}`}
            x={evt.year}
            stroke="#ef4444"
            strokeDasharray="4 2"
            label={{ value: evt.label, position: 'top', fontSize: 10, fill: '#ef4444' }}
          />
        ))}

        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: 'none',
            borderRadius: '0.5rem',
            color: '#f8fafc',
            fontSize: '0.875rem',
          }}
          formatter={(value: unknown, name: unknown) => {
            const nameStr = String(name);
            const label = toDisplayName(nameStr);
            const num = typeof value === 'number' ? value.toFixed(1) : 'N/A';
            return [num, label];
          }}
          labelFormatter={(label: unknown) => `Year: ${label}`}
        />

        <Legend
          verticalAlign="bottom"
          formatter={(value: string) => toDisplayName(value)}
        />

        {/* Country A lines — solid, blue-toned */}
        {activeCategories.map((cat) => (
          <Line
            key={`a_${cat}`}
            type="monotone"
            dataKey={`a_${cat}`}
            stroke={COLORS_A[cat]}
            strokeWidth={2}
            dot={false}
            connectNulls
            name={`a_${cat}`}
          />
        ))}

        {/* Country B lines — dashed, red-toned */}
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
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
