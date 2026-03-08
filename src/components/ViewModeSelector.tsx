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
          className="cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-colors duration-150 focus:outline-none"
          style={{
            backgroundColor: viewMode === mode ? 'rgba(74,222,128,0.15)' : 'transparent',
            border: viewMode === mode
              ? '1px solid rgba(74,222,128,0.4)'
              : '1px solid var(--color-border-hover)',
            color: viewMode === mode ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
