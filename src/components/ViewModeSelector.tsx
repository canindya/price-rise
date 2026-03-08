import type { ViewMode } from '../types/index';
import { useAppState, useAppDispatch } from '../context/AppContext';

const OPTIONS: { mode: ViewMode; label: string }[] = [
  { mode: 'indexed', label: 'Indexed (Base=100)' },
  { mode: 'pct_change', label: '% Change YoY' },
  { mode: 'local_currency', label: 'Local Currency' },
  { mode: 'ppp_adjusted', label: 'PPP Adjusted' },
];

export default function ViewModeSelector() {
  const { viewMode } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <div className="inline-flex gap-1">
      {OPTIONS.map(({ mode, label }) => (
        <button
          key={mode}
          onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: mode })}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            viewMode === mode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
