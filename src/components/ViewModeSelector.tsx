import type { ViewMode } from '../types/index';
import { useAppState, useAppDispatch } from '../context/AppContext';

const OPTIONS: { mode: ViewMode; label: string }[] = [
  { mode: 'indexed', label: 'Index' },
  { mode: 'pct_change', label: '% YoY' },
  { mode: 'local_currency', label: 'Local' },
  { mode: 'ppp_adjusted', label: 'PPP' },
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
          className={`cursor-pointer rounded-lg border px-3 py-1 text-xs font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-1 ${
            viewMode === mode
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-transparent text-gray-600 hover:bg-gray-50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
