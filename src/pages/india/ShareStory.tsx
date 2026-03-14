import { useState, useRef, useMemo, useCallback } from 'react';
import { useMospiData } from '../../hooks/useMospiData';
import { MOSPI_SUBGROUP_LABELS } from '../../types/india';
import type { MospiSubGroup } from '../../types/india';

interface Template {
  id: string;
  title: string;
  description: string;
}

const TEMPLATES: Template[] = [
  { id: 'purchasing_power', title: 'Purchasing Power', description: 'Show how a lump sum eroded over time' },
  { id: 'category_compare', title: 'Category Comparison', description: 'Compare inflation across categories' },
  { id: 'worst_month', title: 'Worst Month', description: 'Highlight the most painful inflation month' },
  { id: 'custom_stat', title: 'Custom Stat', description: 'Create your own headline with a number' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatRupee(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ShareStory() {
  const { calculatePurchasingPower, getSubGroupSeries, getMonthlyChange } = useMospiData();
  const [activeTemplate, setActiveTemplate] = useState('purchasing_power');
  const [fromYear, setFromYear] = useState(2014);
  const [amount, setAmount] = useState(100000);
  const [customHeadline, setCustomHeadline] = useState('Between 2014 and 2024');
  const [customStat, setCustomStat] = useState('school costs rose by 87%');
  const [selectedSubGroup, setSelectedSubGroup] = useState<MospiSubGroup>('food_beverages');
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Compute data for templates
  const ppResult = useMemo(
    () => calculatePurchasingPower(amount, fromYear, 1),
    [calculatePurchasingPower, amount, fromYear],
  );

  const categoryData = useMemo(() => {
    const subGroups: MospiSubGroup[] = ['food_beverages', 'fuel_light', 'education', 'health', 'housing'];
    return subGroups.map((sg) => {
      const series = getSubGroupSeries(sg);
      if (series.length < 2) return { sg, inflation: 0 };
      const first = series[0];
      const last = series[series.length - 1];
      const inflation = first?.indexed && last?.indexed ? ((last.indexed - first.indexed) / first.indexed) * 100 : 0;
      return { sg, inflation: Math.round(inflation * 10) / 10 };
    });
  }, [getSubGroupSeries]);

  const worstMonth = useMemo(() => {
    const changes = getMonthlyChange(selectedSubGroup);
    if (changes.length === 0) return null;
    return [...changes].filter((p) => p.value != null).sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0] ?? null;
  }, [getMonthlyChange, selectedSubGroup]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      // Dynamic import to avoid bundling if not used
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#0c0f14',
      });

      const link = document.createElement('a');
      link.download = 'inflation-story.png';
      link.href = dataUrl;
      link.click();
    } catch {
      // Fallback: use canvas
      alert('Image generation requires the html-to-image package. Please install it with: npm install html-to-image');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#0c0f14',
      });

      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
      }
    } catch {
      // Silently fail if clipboard API not supported
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return (
    <div className="mesh-bg min-h-screen space-y-8">
      {/* Header */}
      <div className="animate-fade-up text-center">
        <h1
          className="text-3xl font-black tracking-tight sm:text-4xl"
          style={{ fontFamily: "'Crimson Pro', serif", color: 'var(--color-text)' }}
        >
          Share Your <span style={{ color: 'var(--color-india-health)' }}>Inflation Story</span>
        </h1>
        <p className="mt-2 text-base" style={{ color: 'var(--color-text-secondary)' }}>
          Generate shareable image cards for WhatsApp, LinkedIn, and X
        </p>
      </div>

      {/* Template Selector */}
      <div className="animate-fade-up delay-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTemplate(t.id)}
            className="rounded-xl p-4 text-left transition-all"
            style={{
              backgroundColor: activeTemplate === t.id ? 'var(--color-accent-bg)' : 'var(--color-bg-card)',
              border: `1px solid ${activeTemplate === t.id ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
            }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{t.title}</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.description}</p>
          </button>
        ))}
      </div>

      {/* Template-specific controls */}
      <div className="animate-fade-up delay-2 glass-card mx-auto max-w-2xl p-6">
        {activeTemplate === 'purchasing_power' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm" style={{ color: 'var(--color-text-secondary)' }}>Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-hover)', color: 'var(--color-text)', fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm" style={{ color: 'var(--color-text-secondary)' }}>From Year</label>
              <select
                value={fromYear}
                onChange={(e) => setFromYear(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-hover)', color: 'var(--color-text)' }}
              >
                {Array.from({ length: 12 }, (_, i) => 2012 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {activeTemplate === 'worst_month' && (
          <div>
            <label className="mb-1 block text-sm" style={{ color: 'var(--color-text-secondary)' }}>Category</label>
            <select
              value={selectedSubGroup}
              onChange={(e) => setSelectedSubGroup(e.target.value as MospiSubGroup)}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-hover)', color: 'var(--color-text)' }}
            >
              {(['food_beverages', 'fuel_light', 'education', 'health', 'housing', 'clothing', 'miscellaneous'] as MospiSubGroup[]).map((sg) => (
                <option key={sg} value={sg}>{MOSPI_SUBGROUP_LABELS[sg]}</option>
              ))}
            </select>
          </div>
        )}

        {activeTemplate === 'custom_stat' && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm" style={{ color: 'var(--color-text-secondary)' }}>Headline</label>
              <input
                type="text"
                value={customHeadline}
                onChange={(e) => setCustomHeadline(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-hover)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm" style={{ color: 'var(--color-text-secondary)' }}>Stat line</label>
              <input
                type="text"
                value={customStat}
                onChange={(e) => setCustomStat(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-hover)', color: 'var(--color-text)' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Preview Card */}
      <div className="animate-fade-up delay-3 mx-auto max-w-lg">
        <div
          ref={cardRef}
          className="rounded-2xl p-8"
          style={{
            background: 'linear-gradient(135deg, #0c0f14 0%, #141820 50%, #1a1f2e 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Logo area */}
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: 'rgba(74, 222, 128, 0.2)' }}>
              <svg className="h-3 w-3" style={{ color: '#4ade80' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Crimson Pro', serif", color: '#e8eaed', fontSize: '14px', fontWeight: 700 }}>
              Cost of Living Tracker
            </span>
          </div>

          {/* Template content */}
          {activeTemplate === 'purchasing_power' && ppResult.general && (
            <div>
              <p style={{ color: '#8b95a5', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
                {formatRupee(amount)} saved in {fromYear}
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", color: '#4ade80', fontSize: '36px', fontWeight: 700, marginTop: '8px' }}>
                {formatRupee(ppResult.general.now)}
              </p>
              <p style={{ color: '#f87171', fontSize: '16px', fontFamily: "'DM Sans', sans-serif", marginTop: '4px' }}>
                {ppResult.general.erosion.toFixed(1)}% purchasing power lost
              </p>
              <p style={{ color: '#555e6e', fontSize: '12px', marginTop: '16px', fontFamily: "'DM Sans', sans-serif" }}>
                That's what your money buys in real terms today.
              </p>
            </div>
          )}

          {activeTemplate === 'category_compare' && (
            <div>
              <p style={{ fontFamily: "'Crimson Pro', serif", color: '#e8eaed', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
                Since 2012, prices rose by...
              </p>
              {categoryData.map(({ sg, inflation }) => (
                <div key={sg} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#8b95a5', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
                    {MOSPI_SUBGROUP_LABELS[sg]}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: inflation > 50 ? '#f87171' : '#fbbf24', fontSize: '16px', fontWeight: 700 }}>
                    +{inflation}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTemplate === 'worst_month' && worstMonth && (
            <div>
              <p style={{ color: '#8b95a5', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
                The worst month for {MOSPI_SUBGROUP_LABELS[selectedSubGroup].toLowerCase()}
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", color: '#f87171', fontSize: '36px', fontWeight: 700, marginTop: '8px' }}>
                {MONTHS[worstMonth.month - 1]} {worstMonth.year}
              </p>
              <p style={{ color: '#e8eaed', fontSize: '20px', fontFamily: "'DM Sans', sans-serif", marginTop: '4px' }}>
                +{worstMonth.value?.toFixed(2)}% in a single month
              </p>
            </div>
          )}

          {activeTemplate === 'custom_stat' && (
            <div>
              <p style={{ color: '#8b95a5', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
                {customHeadline}
              </p>
              <p style={{ fontFamily: "'Crimson Pro', serif", color: '#e8eaed', fontSize: '24px', fontWeight: 700, marginTop: '12px', lineHeight: 1.3 }}>
                {customStat}
              </p>
            </div>
          )}

          {/* Watermark */}
          <div style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: '#555e6e', fontSize: '10px', fontFamily: "'DM Sans', sans-serif" }}>
              Source: MOSPI CPI Data &middot; costoflivingtracker.com
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="animate-fade-up delay-4 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          {isGenerating ? 'Generating...' : 'Download Image'}
        </button>

        <button
          onClick={handleCopy}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          Copy to Clipboard
        </button>
      </div>

      <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Tip: Download the image, then share directly on WhatsApp, LinkedIn, or X
      </p>
    </div>
  );
}
