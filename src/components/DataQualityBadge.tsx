import { useState } from 'react';

interface DataQualityBadgeProps {
  quality: 'complete' | 'partial' | 'sparse';
}

const CONFIG: Record<
  DataQualityBadgeProps['quality'],
  { dot: string; tooltip: string }
> = {
  complete: {
    dot: 'bg-emerald-500',
    tooltip: 'Complete data',
  },
  partial: {
    dot: 'bg-amber-400',
    tooltip: 'Partial data (some gaps)',
  },
  sparse: {
    dot: 'bg-red-400',
    tooltip: 'Sparse data',
  },
};

export default function DataQualityBadge({ quality }: DataQualityBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { dot, tooltip } = CONFIG[quality];

  return (
    <span
      className="relative inline-flex cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} />
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-[10px] font-medium text-white shadow-lg">
          {tooltip}
        </span>
      )}
    </span>
  );
}
