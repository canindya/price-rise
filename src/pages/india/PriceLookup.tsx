import { useState, useMemo } from 'react';
import { useMospiData } from '../../hooks/useMospiData';
import { MOSPI_SUBGROUP_LABELS, MOSPI_SUBGROUP_COLORS } from '../../types/india';
import type { MospiSubGroup } from '../../types/india';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2012;

const PRODUCT_CATEGORIES: { label: string; subGroup: MospiSubGroup }[] = [
  { label: 'Groceries & Cooking Oil', subGroup: 'food_beverages' },
  { label: 'Electricity & Gas', subGroup: 'fuel_light' },
  { label: 'School / College Fees', subGroup: 'education' },
  { label: 'Medicines & Healthcare', subGroup: 'health' },
  { label: 'Rent & Housing', subGroup: 'housing' },
  { label: 'Clothing & Footwear', subGroup: 'clothing' },
  { label: 'Other Services', subGroup: 'miscellaneous' },
];

function formatRupee(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PriceLookup() {
  const { getSubGroupSeries, isLoading } = useMospiData();
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(100);
  const [lookupYear, setLookupYear] = useState(2015);
  const [lookupMonth, setLookupMonth] = useState(1);

  const category = PRODUCT_CATEGORIES[selectedCategory];
  const series = getSubGroupSeries(category.subGroup);

  const result = useMemo(() => {
    if (series.length === 0) return null;

    const thenPoint = series.find((p) => p.year === lookupYear && p.month === lookupMonth);
    const nowPoint = series[series.length - 1];

    if (!thenPoint?.indexed || !nowPoint?.indexed) return null;

    const thenPrice = (currentPrice * thenPoint.indexed) / nowPoint.indexed;
    const pctChange = ((currentPrice - thenPrice) / thenPrice) * 100;

    return {
      thenPrice: Math.round(thenPrice * 100) / 100,
      pctChange: Math.round(pctChange * 100) / 100,
      nowIndex: nowPoint.indexed,
      thenIndex: thenPoint.indexed,
    };
  }, [series, currentPrice, lookupYear, lookupMonth]);

  // Chart data: yearly averages
  const chartData = useMemo(() => {
    if (series.length === 0) return [];

    const yearMap = new Map<number, number[]>();
    for (const p of series) {
      if (p.indexed == null) continue;
      const arr = yearMap.get(p.year);
      if (arr) arr.push(p.indexed);
      else yearMap.set(p.year, [p.indexed]);
    }

    return Array.from(yearMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([year, values]) => ({
        year,
        index: Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 100) / 100,
      }));
  }, [series]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--color-accent)' }} />
      </div>
    );
  }

  const color = MOSPI_SUBGROUP_COLORS[category.subGroup];

  return (
    <div className="mesh-bg min-h-screen space-y-8">
      {/* Header */}
      <div className="animate-fade-up text-center">
        <h1
          className="text-3xl font-black tracking-tight sm:text-4xl"
          style={{ fontFamily: "'Crimson Pro', serif", color: 'var(--color-text)' }}
        >
          What Did This <span className="text-[var(--color-cpi)]">Cost Then</span>?
        </h1>
        <p className="mt-2 text-base" style={{ color: 'var(--color-text-secondary)' }}>
          Compare prices across time using CPI sub-group indices
        </p>
      </div>

      {/* Controls */}
      <div className="animate-fade-up delay-1 glass-card mx-auto max-w-3xl p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(Number(e.target.value))}
              className="w-full rounded-lg px-3 py-2.5 text-sm transition-colors focus:outline-none"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-hover)',
                color: 'var(--color-text)',
              }}
            >
              {PRODUCT_CATEGORIES.map((cat, i) => (
                <option key={i} value={i}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Current Price */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Today's Price (INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>&#8377;</span>
              <input
                type="number"
                min={1}
                value={currentPrice}
                onChange={(e) => setCurrentPrice(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-lg py-2.5 pl-8 pr-3 text-sm tabular-nums focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-hover)',
                  color: 'var(--color-text)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Compare to Year
            </label>
            <select
              value={lookupYear}
              onChange={(e) => setLookupYear(Number(e.target.value))}
              className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-hover)',
                color: 'var(--color-text)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {Array.from({ length: CURRENT_YEAR - MIN_YEAR }, (_, i) => MIN_YEAR + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Month
            </label>
            <select
              value={lookupMonth}
              onChange={(e) => setLookupMonth(Number(e.target.value))}
              className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-hover)',
                color: 'var(--color-text)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="animate-fade-up delay-2 glass-card mx-auto max-w-3xl p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            {/* Then Price */}
            <div className="text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Cost in {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][lookupMonth - 1]} {lookupYear}
              </p>
              <p
                className="mt-1 text-3xl font-bold tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-text)' }}
              >
                {formatRupee(result.thenPrice)}
              </p>
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <svg className="h-8 w-8 rotate-0 sm:rotate-0" style={{ color: 'var(--color-text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            {/* Now Price */}
            <div className="text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Today's price</p>
              <p
                className="mt-1 text-3xl font-bold tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-text)' }}
              >
                {formatRupee(currentPrice)}
              </p>
            </div>

            {/* Delta */}
            <div className="text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Change</p>
              <p
                className="mt-1 text-3xl font-bold tabular-nums"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: result.pctChange > 0 ? '#f87171' : 'var(--color-accent)',
                }}
              >
                {result.pctChange > 0 ? '+' : ''}{result.pctChange.toFixed(1)}%
              </p>
            </div>
          </div>

          <p className="mt-4 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Based on MOSPI {MOSPI_SUBGROUP_LABELS[category.subGroup]} index
          </p>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="animate-fade-up delay-3 glass-card p-6">
          <h3 className="mb-4 text-lg font-semibold" style={{ fontFamily: "'Crimson Pro', serif", color: 'var(--color-text)' }}>
            {MOSPI_SUBGROUP_LABELS[category.subGroup]} — Price Index Over Time
          </h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="var(--color-grid)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
                  axisLine={{ stroke: 'var(--color-axis)' }}
                  tickLine={{ stroke: 'var(--color-axis)' }}
                />
                <YAxis
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
                  axisLine={{ stroke: 'var(--color-axis)' }}
                  tickLine={{ stroke: 'var(--color-axis)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [Number(value).toFixed(1), 'CPI Index']}
                />
                <Line
                  type="monotone"
                  dataKey="index"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: color, stroke: 'var(--color-dot-fill)', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
