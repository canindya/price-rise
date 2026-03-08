import { useState } from 'react';
import type { TimeRange } from '../types/index';
import { useAppState, useAppDispatch } from '../context/AppContext';

const PRESET_OPTIONS: TimeRange[] = ['1Y', '5Y', '10Y'];
const MIN_YEAR = 2000;
const MAX_YEAR = new Date().getFullYear();

export default function TimeRangeSelector() {
  const { timeRange, customRange } = useAppState();
  const dispatch = useAppDispatch();

  const [startYear, setStartYear] = useState(customRange?.startYear ?? MIN_YEAR);
  const [endYear, setEndYear] = useState(customRange?.endYear ?? MAX_YEAR);

  function handleCustomClick() {
    dispatch({
      type: 'SET_CUSTOM_RANGE',
      payload: { startYear, endYear },
    });
  }

  function handleStartChange(value: number) {
    const clamped = Math.max(MIN_YEAR, Math.min(value, endYear));
    setStartYear(clamped);
    if (timeRange === 'custom') {
      dispatch({
        type: 'SET_CUSTOM_RANGE',
        payload: { startYear: clamped, endYear },
      });
    }
  }

  function handleEndChange(value: number) {
    const clamped = Math.max(startYear, Math.min(value, MAX_YEAR));
    setEndYear(clamped);
    if (timeRange === 'custom') {
      dispatch({
        type: 'SET_CUSTOM_RANGE',
        payload: { startYear, endYear: clamped },
      });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className="inline-flex items-center gap-0.5 rounded-full p-0.5"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        {PRESET_OPTIONS.map((range) => (
          <button
            key={range}
            onClick={() => dispatch({ type: 'SET_TIME_RANGE', payload: range })}
            className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: timeRange === range ? 'var(--color-accent)' : 'transparent',
              color: timeRange === range ? 'var(--color-bg)' : 'var(--color-text-secondary)',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {range}
          </button>
        ))}
        <button
          onClick={handleCustomClick}
          className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200"
          style={{
            backgroundColor: timeRange === 'custom' ? 'var(--color-accent)' : 'transparent',
            color: timeRange === 'custom' ? 'var(--color-bg)' : 'var(--color-text-secondary)',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Custom
        </button>
      </div>

      {timeRange === 'custom' && (
        <div className="flex items-center gap-3 pl-1">
          <label className="flex items-center gap-1.5">
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}>From</span>
            <input
              type="number"
              min={MIN_YEAR}
              max={endYear}
              value={startYear}
              onChange={(e) => handleStartChange(Number(e.target.value))}
              className="w-[4.5rem] rounded-lg px-2 py-1 text-sm tabular-nums transition-colors duration-150 focus:outline-none"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-hover)',
                color: 'var(--color-text)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          </label>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>&ndash;</span>
          <label className="flex items-center gap-1.5">
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)', fontFamily: "'DM Sans', sans-serif" }}>To</span>
            <input
              type="number"
              min={startYear}
              max={MAX_YEAR}
              value={endYear}
              onChange={(e) => handleEndChange(Number(e.target.value))}
              className="w-[4.5rem] rounded-lg px-2 py-1 text-sm tabular-nums transition-colors duration-150 focus:outline-none"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-hover)',
                color: 'var(--color-text)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
