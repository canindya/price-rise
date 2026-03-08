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
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex gap-1">
        {PRESET_OPTIONS.map((range) => (
          <button
            key={range}
            onClick={() => dispatch({ type: 'SET_TIME_RANGE', payload: range })}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {range}
          </button>
        ))}
        <button
          onClick={handleCustomClick}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            timeRange === 'custom'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Custom
        </button>
      </div>

      {timeRange === 'custom' && (
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm text-gray-600">
            <span>From</span>
            <input
              type="number"
              min={MIN_YEAR}
              max={endYear}
              value={startYear}
              onChange={(e) => handleStartChange(Number(e.target.value))}
              className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center gap-1 text-sm text-gray-600">
            <span>To</span>
            <input
              type="number"
              min={startYear}
              max={MAX_YEAR}
              value={endYear}
              onChange={(e) => handleEndChange(Number(e.target.value))}
              className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
        </div>
      )}
    </div>
  );
}
