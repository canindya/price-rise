import { useState } from 'react';

interface DataQualityBadgeProps {
  quality: 'complete' | 'partial' | 'sparse';
}

const CONFIG: Record<
  DataQualityBadgeProps['quality'],
  { color: string; tooltip: string }
> = {
  complete: {
    color: '#4ade80',
    tooltip: 'Complete data',
  },
  partial: {
    color: '#fbbf24',
    tooltip: 'Partial data (some gaps)',
  },
  sparse: {
    color: '#ef4444',
    tooltip: 'Sparse data',
  },
};

export default function DataQualityBadge({ quality }: DataQualityBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { color, tooltip } = CONFIG[quality];

  return (
    <span
      className="relative inline-flex cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {showTooltip && (
        <span
          className="absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-[10px] font-medium shadow-lg"
          style={{
            backgroundColor: '#1a1f2e',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e8eaed',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {tooltip}
        </span>
      )}
    </span>
  );
}
