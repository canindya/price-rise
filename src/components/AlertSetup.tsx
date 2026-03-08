import { useState, useEffect, useCallback } from 'react';
import type { Category } from '../types/index';
import { COUNTRIES } from '../utils/countryCodeMap';

export interface AlertConfig {
  id: string;
  countryCode: string;
  countryName: string;
  category: Category;
  threshold: number;
}

export interface TriggeredAlert {
  config: AlertConfig;
  currentValue: number;
}

const STORAGE_KEY = 'inflation_alerts';

const CATEGORY_OPTIONS: { key: Category; label: string }[] = [
  { key: 'overall_cpi', label: 'Overall CPI' },
  { key: 'food_cpi', label: 'Food & Essentials' },
  { key: 'energy_benchmark', label: 'Energy (Oil)' },
  { key: 'energy_retail', label: 'Retail Energy' },
  { key: 'education_spend', label: 'Education' },
];

function loadAlerts(): AlertConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AlertConfig[];
  } catch {
    // ignore
  }
  return [];
}

function saveAlerts(alerts: AlertConfig[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

/**
 * Check saved alerts against current country change data.
 * `allChanges` maps category -> countryCode -> % change.
 */
export function checkAlerts(
  allChanges: Partial<Record<Category, Record<string, number>>>,
): TriggeredAlert[] {
  const alerts = loadAlerts();
  const triggered: TriggeredAlert[] = [];

  for (const config of alerts) {
    const categoryChanges = allChanges[config.category];
    if (!categoryChanges) continue;
    const current = categoryChanges[config.countryCode];
    if (current != null && current > config.threshold) {
      triggered.push({ config, currentValue: current });
    }
  }

  return triggered;
}

interface AlertSetupProps {
  open: boolean;
  onClose: () => void;
}

export default function AlertSetup({ open, onClose }: AlertSetupProps) {
  const [alerts, setAlerts] = useState<AlertConfig[]>(loadAlerts);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0].iso3);
  const [selectedCategory, setSelectedCategory] = useState<Category>('overall_cpi');
  const [threshold, setThreshold] = useState<string>('10');
  const [visible, setVisible] = useState(false);

  // Animate entrance
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  // Sync from storage if modal re-opens
  useEffect(() => {
    if (open) setAlerts(loadAlerts());
  }, [open]);

  const handleAdd = useCallback(() => {
    const numThreshold = parseFloat(threshold);
    if (isNaN(numThreshold)) return;

    const country = COUNTRIES.find((c) => c.iso3 === selectedCountry);
    if (!country) return;

    const newAlert: AlertConfig = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      countryCode: country.iso3,
      countryName: country.name,
      category: selectedCategory,
      threshold: numThreshold,
    };

    const updated = [...alerts, newAlert];
    setAlerts(updated);
    saveAlerts(updated);
  }, [alerts, selectedCountry, selectedCategory, threshold]);

  const handleDelete = useCallback(
    (id: string) => {
      const updated = alerts.filter((a) => a.id !== id);
      setAlerts(updated);
      saveAlerts(updated);
    },
    [alerts],
  );

  if (!open) return null;

  const categoryLabel = (cat: Category) =>
    CATEGORY_OPTIONS.find((c) => c.key === cat)?.label ?? cat;

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-200 ${
        visible ? 'bg-black/50' : 'bg-black/0'
      }`}
    >
      <div
        className={`w-full max-w-lg rounded-2xl bg-white shadow-2xl transition-all duration-300 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 pt-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">Price Alerts</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="mb-4 text-sm text-gray-500">
            Get notified when inflation in a category exceeds your threshold.
          </p>

          {/* Add alert form */}
          <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="cursor-pointer rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm transition-colors duration-150 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-1"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.iso3} value={c.iso3}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as Category)}
                  className="cursor-pointer rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm transition-colors duration-150 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-1"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Threshold</label>
                <div className="relative">
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 pr-7 text-sm transition-colors duration-150 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-1"
                    placeholder="10"
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    %
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="mt-3 cursor-pointer rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-1"
            >
              Add Alert
            </button>
          </div>

          {/* Saved alerts list */}
          <div className="max-h-60 overflow-y-auto">
            {alerts.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <svg
                  className="h-8 w-8 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
                <p className="text-sm text-gray-400">No alerts set up yet</p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 transition-colors duration-150 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-800">
                      {alert.countryName}
                    </span>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-600">{categoryLabel(alert.category)}</span>
                    <span className="text-gray-300">&gt;</span>
                    <span className="font-medium text-red-600">{alert.threshold}%</span>
                  </div>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-500"
                    aria-label="Delete alert"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 px-6 pt-4 pb-6">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
