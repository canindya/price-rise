interface DataQualityBadgeProps {
  quality: 'complete' | 'partial' | 'sparse';
}

const CONFIG: Record<
  DataQualityBadgeProps['quality'],
  { color: string; bg: string; label: string; tooltip: string }
> = {
  complete: {
    color: 'bg-green-500',
    bg: 'bg-green-50 text-green-700',
    label: 'Complete',
    tooltip: 'All data points are available for this range',
  },
  partial: {
    color: 'bg-yellow-500',
    bg: 'bg-yellow-50 text-yellow-700',
    label: 'Partial',
    tooltip: 'Some data points are missing (up to 30%)',
  },
  sparse: {
    color: 'bg-red-500',
    bg: 'bg-red-50 text-red-700',
    label: 'Sparse',
    tooltip: 'More than 30% of data points are missing',
  },
};

export default function DataQualityBadge({ quality }: DataQualityBadgeProps) {
  const { color, bg, label, tooltip } = CONFIG[quality];

  return (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${bg} cursor-help`}
    >
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
