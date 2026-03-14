import { useState, useMemo } from 'react';
import { useMospiData } from '../../hooks/useMospiData';
import { MOSPI_SUBGROUP_LABELS, MOSPI_SUBGROUP_COLORS } from '../../types/india';
import type { MospiSubGroup, MospiCoverage } from '../../types/india';
import { INDIA_EVENTS } from '../../utils/indiaEvents';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const SUBGROUPS: MospiSubGroup[] = [
  'general', 'food_beverages', 'fuel_light', 'clothing',
  'education', 'health', 'housing', 'miscellaneous',
];

const COVERAGES: { key: MospiCoverage; label: string }[] = [
  { key: 'all_india', label: 'All India' },
  { key: 'rural', label: 'Rural' },
  { key: 'urban', label: 'Urban' },
];

function heatmapColor(value: number | null): string {
  if (value == null) return 'transparent';
  if (value <= -0.5) return '#4ade80';
  if (value <= 0) return '#86efac';
  if (value <= 0.3) return '#fef08a';
  if (value <= 0.7) return '#fbbf24';
  if (value <= 1.0) return '#fb923c';
  if (value <= 1.5) return '#f87171';
  return '#dc2626';
}

export default function SpikeTimeline() {
  const { getMonthlyChange, isLoading } = useMospiData();
  const [selectedSubGroup, setSelectedSubGroup] = useState<MospiSubGroup>('general');
  const [coverage, setCoverage] = useState<MospiCoverage>('all_india');

  const changes = useMemo(
    () => getMonthlyChange(selectedSubGroup, coverage),
    [getMonthlyChange, selectedSubGroup, coverage],
  );

  // Build heatmap grid: year -> month -> value
  const { yearGrid, years } = useMemo(() => {
    const grid = new Map<number, Map<number, number | null>>();
    for (const p of changes) {
      if (!grid.has(p.year)) grid.set(p.year, new Map());
      grid.get(p.year)!.set(p.month, p.value);
    }
    const yrs = Array.from(grid.keys()).sort((a, b) => a - b);
    return { yearGrid: grid, years: yrs };
  }, [changes]);

  // Top 10 worst months
  const worstMonths = useMemo(() => {
    return [...changes]
      .filter((p) => p.value != null)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
      .slice(0, 10);
  }, [changes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--color-accent)' }} />
      </div>
    );
  }

  return (
    <div className="mesh-bg min-h-screen space-y-8">
      {/* Header */}
      <div className="animate-fade-up text-center">
        <h1
          className="text-3xl font-black tracking-tight sm:text-4xl"
          style={{ fontFamily: "'Crimson Pro', serif", color: 'var(--color-text)' }}
        >
          Which Month <span className="text-[var(--color-energy)]">Hurt Most</span>?
        </h1>
        <p className="mt-2 text-base" style={{ color: 'var(--color-text-secondary)' }}>
          Monthly inflation heatmap — spot the spikes, remember the pain
        </p>
      </div>

      {/* Controls */}
      <div className="animate-fade-up delay-1 flex flex-wrap items-center justify-center gap-4">
        {/* Sub-group selector */}
        <div
          className="inline-flex items-center gap-0.5 overflow-x-auto rounded-full p-0.5"
          style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
          {SUBGROUPS.map((sg) => (
            <button
              key={sg}
              onClick={() => setSelectedSubGroup(sg)}
              className="cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: selectedSubGroup === sg ? MOSPI_SUBGROUP_COLORS[sg] : 'transparent',
                color: selectedSubGroup === sg ? 'var(--color-bg)' : 'var(--color-text-secondary)',
              }}
            >
              {MOSPI_SUBGROUP_LABELS[sg]}
            </button>
          ))}
        </div>

        {/* Coverage toggle */}
        <div
          className="inline-flex items-center gap-0.5 rounded-full p-0.5"
          style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
          {COVERAGES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCoverage(key)}
              className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: coverage === key ? 'var(--color-accent)' : 'transparent',
                color: coverage === key ? 'var(--color-bg)' : 'var(--color-text-secondary)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-fade-up delay-2 flex flex-col gap-8 lg:flex-row">
        {/* Heatmap */}
        <div className="glass-card flex-1 overflow-x-auto p-6">
          <h3 className="mb-4 text-lg font-semibold" style={{ fontFamily: "'Crimson Pro', serif", color: 'var(--color-text)' }}>
            Month-over-Month Inflation (%)
          </h3>

          <div className="min-w-[600px]">
            {/* Month headers */}
            <div className="mb-1 grid grid-cols-[60px_repeat(12,1fr)] gap-1">
              <div />
              {MONTHS.map((m) => (
                <div
                  key={m}
                  className="text-center text-[10px] font-medium"
                  style={{ color: 'var(--color-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {m}
                </div>
              ))}
            </div>

            {/* Year rows */}
            {years.map((year) => (
              <div key={year} className="mb-1 grid grid-cols-[60px_repeat(12,1fr)] gap-1">
                <div
                  className="flex items-center text-xs font-medium"
                  style={{ color: 'var(--color-text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {year}
                </div>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                  const value = yearGrid.get(year)?.get(month) ?? null;
                  const event = INDIA_EVENTS.find(
                    (e) => e.year === year && e.month === month &&
                      (e.subGroup === selectedSubGroup || e.subGroup === 'general'),
                  );

                  return (
                    <div
                      key={month}
                      className="group relative flex h-7 items-center justify-center rounded text-[10px] font-medium tabular-nums transition-transform hover:scale-110"
                      style={{
                        backgroundColor: heatmapColor(value),
                        color: value != null && value > 0.7 ? '#fff' : 'var(--color-text)',
                        fontFamily: "'JetBrains Mono', monospace",
                        cursor: 'default',
                      }}
                      title={
                        value != null
                          ? `${MONTHS[month - 1]} ${year}: ${value > 0 ? '+' : ''}${value.toFixed(2)}%${event ? ` — ${event.label}` : ''}`
                          : `${MONTHS[month - 1]} ${year}: No data`
                      }
                    >
                      {value != null ? value.toFixed(1) : ''}
                      {event && (
                        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Color legend */}
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            <span>Deflation</span>
            {[
              { color: '#4ade80', label: '<-0.5%' },
              { color: '#86efac', label: '0%' },
              { color: '#fef08a', label: '0.3%' },
              { color: '#fbbf24', label: '0.7%' },
              { color: '#fb923c', label: '1%' },
              { color: '#f87171', label: '1.5%' },
              { color: '#dc2626', label: '>1.5%' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className="h-3 w-3 rounded" style={{ backgroundColor: color }} />
                <span>{label}</span>
              </div>
            ))}
            <span>Spike</span>
          </div>
        </div>

        {/* Worst Months Sidebar */}
        <div className="glass-card w-full p-6 lg:w-72">
          <h3 className="mb-4 text-lg font-semibold" style={{ fontFamily: "'Crimson Pro', serif", color: 'var(--color-text)' }}>
            Worst Months
          </h3>
          <div className="space-y-3">
            {worstMonths.map((p, i) => {
              const event = INDIA_EVENTS.find(
                (e) => e.year === p.year && e.month === p.month,
              );
              return (
                <div key={`${p.year}-${p.month}`} className="flex items-start gap-3">
                  <span
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[10px] font-bold"
                    style={{
                      backgroundColor: i < 3 ? '#dc2626' : 'var(--color-bg-elevated)',
                      color: i < 3 ? '#fff' : 'var(--color-text-muted)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-medium tabular-nums"
                        style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-text)' }}
                      >
                        {MONTHS[p.month - 1]} {p.year}
                      </span>
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{ fontFamily: "'JetBrains Mono', monospace", color: '#f87171' }}
                      >
                        +{p.value?.toFixed(2)}%
                      </span>
                    </div>
                    {event && (
                      <p className="mt-0.5 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                        {event.label}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
