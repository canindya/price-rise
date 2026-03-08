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
  energy_benchmark: 'Energy (Oil Benchmark)',
  energy_retail: 'Retail Energy',
  education_spend: 'Education Investment',
};

interface ChartRow {
  year: number;
  [key: string]: number | null | undefined;
}

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
    indexed: 'Index (Base Year = 100)',
    pct_change: 'Year-over-Year Change (%)',
    local_currency: 'CPI Value (Local)',
    ppp_adjusted: 'PPP-Adjusted Index',
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

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <XAxis dataKey="year" tickLine={false} />
        <YAxis
          domain={['auto', 'auto']}
          tickLine={false}
          label={{
            value: Y_AXIS_LABELS[viewMode],
            angle: -90,
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' },
          }}
        />

        {viewMode === 'indexed' && (
          <ReferenceLine y={100} stroke="#9ca3af" strokeDasharray="6 3" label="Base" />
        )}
        {viewMode === 'pct_change' && (
          <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="6 3" label="0%" />
        )}

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
            const isAvg = nameStr.endsWith('_avg');
            const baseCat = isAvg ? nameStr.replace('_avg', '') : nameStr;
            const baseLabel = CATEGORY_LABELS[baseCat as Category] ?? baseCat;
            const label = isAvg ? `${baseLabel} (World Avg)` : baseLabel;
            const num = typeof value === 'number' ? value.toFixed(1) : 'N/A';
            return [num, label];
          }}
          labelFormatter={(label: unknown) => `Year: ${label}`}
        />

        <Legend
          verticalAlign="bottom"
          formatter={(value: string) => {
            const isAvg = value.endsWith('_avg');
            const baseCat = isAvg ? value.replace('_avg', '') : value;
            const baseLabel = CATEGORY_LABELS[baseCat as Category] ?? baseCat;
            return isAvg ? `${baseLabel} (World Avg)` : baseLabel;
          }}
        />

        {activeCategories.map((cat) => (
          <Line
            key={cat}
            type="monotone"
            dataKey={cat}
            stroke={CATEGORY_COLORS[cat]}
            strokeWidth={2}
            dot={false}
            connectNulls
            name={cat}
          />
        ))}

        {showBenchmark && benchmarkData && activeCategories.map((cat) => (
          <Line
            key={`${cat}_avg`}
            type="monotone"
            dataKey={`${cat}_avg`}
            stroke={CATEGORY_COLORS[cat]}
            strokeWidth={2}
            strokeDasharray="5 5"
            strokeOpacity={0.5}
            dot={false}
            connectNulls
            name={`${cat}_avg`}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
