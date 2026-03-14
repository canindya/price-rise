import { useState, useMemo } from 'react';
import { useMospiData } from '../../hooks/useMospiData';
import { MOSPI_SUBGROUP_LABELS, MOSPI_SUBGROUP_COLORS } from '../../types/india';
import type { MospiSubGroup } from '../../types/india';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const ALL_SUBGROUPS: MospiSubGroup[] = [
  'food_beverages', 'fuel_light', 'clothing', 'education',
  'health', 'housing', 'miscellaneous',
];

const PERIOD_OPTIONS = [
  { label: '1Y', months: 12 },
  { label: '5Y', months: 60 },
  { label: '10Y', months: 120 },
];

const SECTOR_NARRATIVES: Partial<Record<MospiSubGroup, string>> = {
  food_beverages: 'Driven by seasonal spikes in vegetables, pulses, and edible oils',
  fuel_light: 'Impacted by global crude prices and domestic excise policy',
  education: 'Steady rise from tuition fees and private coaching costs',
  health: 'Pharmaceutical costs and hospital charges continue climbing',
  housing: 'Urban rent and construction material costs drive housing inflation',
  clothing: 'Moderate increase in garment and footwear prices',
  miscellaneous: 'Includes telecom (deflationary), transport, and personal care',
};

export default function SectorCards() {
  const { getSubGroupSeries, isLoading } = useMospiData();
  const [periodIdx, setPeriodIdx] = useState(1); // Default 5Y

  const { surging, stable } = useMemo(() => {
    const period = PERIOD_OPTIONS[periodIdx];

    const sectors = ALL_SUBGROUPS.map((sg) => {
      const series = getSubGroupSeries(sg);
      if (series.length < 2) {
        return { subGroup: sg, inflation: 0, sparkline: [] };
      }

      const latest = series[series.length - 1];
      const lookbackIdx = Math.max(0, series.length - 1 - period.months);
      const earlier = series[lookbackIdx];

      const inflation =
        latest?.indexed && earlier?.indexed && earlier.indexed !== 0
          ? ((latest.indexed - earlier.indexed) / earlier.indexed) * 100
          : 0;

      // Sparkline: last N months
      const sparklineData = series
        .slice(Math.max(0, series.length - period.months))
        .filter((p) => p.indexed != null)
        .map((p) => ({ v: p.indexed }));

      return {
        subGroup: sg,
        inflation: Math.round(inflation * 100) / 100,
        sparkline: sparklineData,
      };
    });

    // Get median inflation to split
    const sorted = [...sectors].sort((a, b) => b.inflation - a.inflation);
    const median = sorted[Math.floor(sorted.length / 2)].inflation;

    return {
      surging: sorted.filter((s) => s.inflation >= median),
      stable: sorted.filter((s) => s.inflation < median),
    };
  }, [getSubGroupSeries, periodIdx]);

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
          Inflation <span className="text-[var(--color-education)]">Winners & Losers</span>
        </h1>
        <p className="mt-2 text-base" style={{ color: 'var(--color-text-secondary)' }}>
          Which sectors surged? Which stayed stable or deflated?
        </p>
      </div>

      {/* Period selector */}
      <div className="animate-fade-up delay-1 flex justify-center">
        <div className="inline-flex items-center gap-0.5 rounded-full p-0.5" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          {PERIOD_OPTIONS.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => setPeriodIdx(i)}
              className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: periodIdx === i ? 'var(--color-accent)' : 'transparent',
                color: periodIdx === i ? 'var(--color-bg)' : 'var(--color-text-secondary)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="animate-fade-up delay-2 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Surging */}
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: "'Crimson Pro', serif", color: '#f87171' }}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Surging
          </h3>
          <div className="space-y-4">
            {surging.map(({ subGroup, inflation, sparkline }) => (
              <SectorCard
                key={subGroup}
                subGroup={subGroup}
                inflation={inflation}
                sparkline={sparkline}
                variant="surging"
              />
            ))}
          </div>
        </div>

        {/* Stable / Deflating */}
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: "'Crimson Pro', serif", color: 'var(--color-accent)' }}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            Stable / Deflating
          </h3>
          <div className="space-y-4">
            {stable.map(({ subGroup, inflation, sparkline }) => (
              <SectorCard
                key={subGroup}
                subGroup={subGroup}
                inflation={inflation}
                sparkline={sparkline}
                variant="stable"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectorCard({
  subGroup,
  inflation,
  sparkline,
  variant,
}: {
  subGroup: MospiSubGroup;
  inflation: number;
  sparkline: { v: number | null }[];
  variant: 'surging' | 'stable';
}) {
  const color = MOSPI_SUBGROUP_COLORS[subGroup];
  const borderColor = variant === 'surging' ? '#f87171' : 'var(--color-accent)';

  return (
    <div
      className="rounded-xl p-5 transition-all duration-200"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderLeft: `4px solid ${borderColor}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 24px var(--color-shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              {MOSPI_SUBGROUP_LABELS[subGroup]}
            </h4>
          </div>
          <p
            className="mt-2 text-2xl font-bold tabular-nums"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: inflation > 0 ? '#f87171' : 'var(--color-accent)',
            }}
          >
            {inflation > 0 ? '+' : ''}{inflation.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {SECTOR_NARRATIVES[subGroup] ?? ''}
          </p>
        </div>

        {/* Sparkline */}
        {sparkline.length > 2 && (
          <div className="h-12 w-24 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkline}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={color}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
