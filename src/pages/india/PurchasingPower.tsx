import { useState, useMemo } from 'react';
import { useMospiData } from '../../hooks/useMospiData';
import { MOSPI_SUBGROUP_LABELS, MOSPI_SUBGROUP_COLORS } from '../../types/india';
import type { MospiSubGroup } from '../../types/india';

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2012;

function formatRupee(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

const DISPLAY_SUBGROUPS: MospiSubGroup[] = [
  'general',
  'food_beverages',
  'fuel_light',
  'clothing',
  'education',
  'health',
  'housing',
  'miscellaneous',
];

export default function PurchasingPower() {
  const { calculatePurchasingPower, isLoading } = useMospiData();
  const [amount, setAmount] = useState(100000);
  const [fromYear, setFromYear] = useState(2014);
  const [fromMonth, setFromMonth] = useState(1);

  const results = useMemo(
    () => calculatePurchasingPower(amount, fromYear, fromMonth),
    [calculatePurchasingPower, amount, fromYear, fromMonth],
  );

  const overallResult = results.general;

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
          What Did Your Money <span className="text-[var(--color-accent)]">Become</span>?
        </h1>
        <p className="mt-2 text-base" style={{ color: 'var(--color-text-secondary)' }}>
          See how inflation has eroded your purchasing power across categories
        </p>
      </div>

      {/* Input Controls */}
      <div className="animate-fade-up delay-1 glass-card mx-auto max-w-2xl p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Amount */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Amount (INR)
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium"
                style={{ color: 'var(--color-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}
              >
                &#8377;
              </span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-lg py-2.5 pl-8 pr-3 text-sm tabular-nums transition-colors focus:outline-none"
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
              From Year
            </label>
            <select
              value={fromYear}
              onChange={(e) => setFromYear(Number(e.target.value))}
              className="w-full rounded-lg px-3 py-2.5 text-sm transition-colors focus:outline-none"
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
              From Month
            </label>
            <select
              value={fromMonth}
              onChange={(e) => setFromMonth(Number(e.target.value))}
              className="w-full rounded-lg px-3 py-2.5 text-sm transition-colors focus:outline-none"
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

      {/* Summary Card */}
      {overallResult && (
        <div className="animate-fade-up delay-2 glass-card glow-green mx-auto max-w-2xl p-6 text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Your {formatRupee(amount)} from {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][fromMonth - 1]} {fromYear} is worth
          </p>
          <p
            className="mt-2 text-4xl font-bold tabular-nums sm:text-5xl"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-accent)' }}
          >
            {formatRupee(overallResult.now)}
          </p>
          <p className="mt-2 text-sm" style={{ color: '#f87171' }}>
            {overallResult.erosion.toFixed(1)}% purchasing power lost
          </p>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="animate-fade-up delay-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DISPLAY_SUBGROUPS.filter((sg) => sg !== 'general').map((sg) => {
          const r = results[sg];
          if (!r) return null;
          const color = MOSPI_SUBGROUP_COLORS[sg];

          return (
            <div
              key={sg}
              className="rounded-xl p-5 transition-all duration-200"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderLeft: `4px solid ${color}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                e.currentTarget.style.borderLeftColor = color;
                e.currentTarget.style.boxShadow = '0 4px 24px var(--color-shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.borderLeftColor = color;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <h3 className="text-sm font-medium truncate" style={{ color: 'var(--color-text-secondary)' }}>
                  {MOSPI_SUBGROUP_LABELS[sg]}
                </h3>
              </div>

              <div className="mt-3">
                <div
                  className="text-2xl font-bold tabular-nums"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-text)' }}
                >
                  {formatRupee(r.now)}
                </div>
                <div className="mt-1 flex items-center gap-1 text-sm" style={{ color: '#f87171' }}>
                  <svg className="inline h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {r.erosion.toFixed(1)}% eroded
                  </span>
                </div>
              </div>

              {/* Erosion bar */}
              <div className="mt-3">
                <div className="h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(r.erosion, 100)}%`,
                      backgroundColor: color,
                      opacity: 0.4,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
