import { useState, useMemo } from 'react';
import { useMospiData } from '../../hooks/useMospiData';
import { MOSPI_SUBGROUP_LABELS, MOSPI_SUBGROUP_COLORS } from '../../types/india';
import type { MospiSubGroup, MospiCoverage } from '../../types/india';

const BUDGET_SUBGROUPS: MospiSubGroup[] = [
  'food_beverages',
  'fuel_light',
  'clothing',
  'education',
  'health',
  'housing',
  'miscellaneous',
];

const COVERAGES: { key: MospiCoverage; label: string }[] = [
  { key: 'all_india', label: 'All India' },
  { key: 'rural', label: 'Rural' },
  { key: 'urban', label: 'Urban' },
];

const PERIOD_OPTIONS = [
  { label: '5 Years', years: 5 },
  { label: '10 Years', years: 10 },
  { label: 'Since 2012', years: 0 },
];

export default function BudgetStress() {
  const { getSubGroupSeries, getHCESWeights, isLoading } = useMospiData();
  const [coverage, setCoverage] = useState<MospiCoverage>('all_india');
  const [periodIdx, setPeriodIdx] = useState(0);
  const [customWeights, setCustomWeights] = useState<Record<MospiSubGroup, number> | null>(null);

  const hcesWeights = getHCESWeights(coverage);

  // Use custom weights if set, otherwise HCES defaults
  const weights = customWeights ?? hcesWeights;

  // Reset custom weights when coverage changes
  const handleCoverageChange = (c: MospiCoverage) => {
    setCoverage(c);
    setCustomWeights(null);
  };

  const handleWeightChange = (sg: MospiSubGroup, value: number) => {
    const current = { ...(customWeights ?? hcesWeights) };
    current[sg] = value;
    setCustomWeights(current);
  };

  const { stressIndex, breakdown, totalWeight } = useMemo(() => {
    const period = PERIOD_OPTIONS[periodIdx];
    const currentYear = new Date().getFullYear();
    const lookbackMonths = period.years === 0 ? (currentYear - 2012) * 12 : period.years * 12;

    const breakdownItems: {
      subGroup: MospiSubGroup;
      weight: number;
      inflation: number;
      contribution: number;
    }[] = [];

    let weightedSum = 0;

    for (const sg of BUDGET_SUBGROUPS) {
      const series = getSubGroupSeries(sg, coverage);
      if (series.length < 2) continue;

      const latest = series[series.length - 1];
      const lookbackIdx = Math.max(0, series.length - 1 - lookbackMonths);
      const earlier = series[lookbackIdx];

      if (!latest?.indexed || !earlier?.indexed || earlier.indexed === 0) continue;

      const inflation = ((latest.indexed - earlier.indexed) / earlier.indexed) * 100;
      const w = weights[sg] ?? 0;
      const contribution = (w / 100) * inflation;

      breakdownItems.push({
        subGroup: sg,
        weight: w,
        inflation: Math.round(inflation * 100) / 100,
        contribution: Math.round(contribution * 100) / 100,
      });

      weightedSum += contribution;
    }

    const tw = BUDGET_SUBGROUPS.reduce((s, sg) => s + (weights[sg] ?? 0), 0);

    return {
      stressIndex: Math.round(weightedSum * 100) / 100,
      breakdown: breakdownItems.sort((a, b) => b.contribution - a.contribution),
      totalWeight: tw,
    };
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
  }, [getSubGroupSeries, coverage, weights, periodIdx]);

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
          Household Budget <span className="text-[var(--color-retail)]">Stress Score</span>
        </h1>
        <p className="mt-2 text-base" style={{ color: 'var(--color-text-secondary)' }}>
          How much more of your income goes to the same basket today?
        </p>
      </div>

      {/* Controls */}
      <div className="animate-fade-up delay-1 flex flex-wrap items-center justify-center gap-4">
        {/* Period */}
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

        {/* Coverage */}
        <div className="inline-flex items-center gap-0.5 rounded-full p-0.5" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          {COVERAGES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleCoverageChange(key)}
              className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200"
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

      {/* Stress Index */}
      <div className="animate-fade-up delay-2 glass-card glow-green mx-auto max-w-lg p-8 text-center">
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Your basket inflated by
        </p>
        <p
          className="mt-2 text-5xl font-bold tabular-nums sm:text-6xl"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: stressIndex > 30 ? '#f87171' : stressIndex > 15 ? '#fbbf24' : 'var(--color-accent)',
          }}
        >
          {stressIndex > 0 ? '+' : ''}{stressIndex.toFixed(1)}%
        </p>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          over {PERIOD_OPTIONS[periodIdx].label.toLowerCase()} ({coverage.replace('_', ' ')})
        </p>
      </div>

      <div className="animate-fade-up delay-3 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Weight Sliders */}
        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ fontFamily: "'Crimson Pro', serif", color: 'var(--color-text)' }}>
              Your Spend Allocation
            </h3>
            <button
              onClick={() => setCustomWeights(null)}
              className="rounded-lg px-3 py-1 text-xs font-medium transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              Reset to HCES
            </button>
          </div>

          <div className="space-y-4">
            {BUDGET_SUBGROUPS.map((sg) => {
              const color = MOSPI_SUBGROUP_COLORS[sg];
              return (
                <div key={sg}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {MOSPI_SUBGROUP_LABELS[sg]}
                      </span>
                    </div>
                    <span
                      className="text-sm tabular-nums"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-text)' }}
                    >
                      {(weights[sg] ?? 0).toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={80}
                    step={0.5}
                    value={weights[sg] ?? 0}
                    onChange={(e) => handleWeightChange(sg, Number(e.target.value))}
                    className="w-full accent-[var(--color-accent)]"
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-right">
            <span
              className="text-sm tabular-nums"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: Math.abs(totalWeight - 100) > 1 ? '#f87171' : 'var(--color-text-muted)',
              }}
            >
              Total: {totalWeight.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="glass-card p-6">
          <h3 className="mb-4 text-lg font-semibold" style={{ fontFamily: "'Crimson Pro', serif", color: 'var(--color-text)' }}>
            Inflation Breakdown
          </h3>

          <div className="space-y-3">
            {breakdown.map(({ subGroup, weight, inflation, contribution }) => {
              const color = MOSPI_SUBGROUP_COLORS[subGroup];
              return (
                <div key={subGroup}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {MOSPI_SUBGROUP_LABELS[subGroup]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>{weight.toFixed(1)}%w</span>
                      <span style={{ color: inflation > 0 ? '#f87171' : 'var(--color-accent)' }}>
                        {inflation > 0 ? '+' : ''}{inflation.toFixed(1)}%
                      </span>
                      <span style={{ color: 'var(--color-text)' }}>
                        {contribution > 0 ? '+' : ''}{contribution.toFixed(1)}pp
                      </span>
                    </div>
                  </div>
                  {/* Contribution bar */}
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(Math.abs(contribution) / (Math.abs(stressIndex) || 1) * 100, 100)}%`,
                        backgroundColor: color,
                        opacity: 0.5,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-lg p-3" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <strong style={{ color: 'var(--color-text-secondary)' }}>How to read:</strong>{' '}
              Weight (w) = your budget share. Inflation = category price rise. Contribution (pp) = percentage points
              added to your total stress score. Categories with high weight AND high inflation hurt most.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
