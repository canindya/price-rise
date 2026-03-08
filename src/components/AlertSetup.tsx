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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Price Alerts</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          Get notified when inflation in a category exceeds your threshold.
        </p>

        {/* Add alert form */}
        <div className="mb-4 rounded-lg bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.iso3} value={c.iso3}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Category)}
                className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Threshold (%)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 10"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Alert
          </button>
        </div>

        {/* Saved alerts list */}
        <div className="max-h-60 space-y-2 overflow-y-auto">
          {alerts.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-400">
              No alerts configured yet.
            </p>
          )}
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
            >
              <div className="text-sm">
                <span className="font-medium text-gray-800">
                  {alert.countryName}
                </span>
                <span className="mx-1 text-gray-400">/</span>
                <span className="text-gray-600">{categoryLabel(alert.category)}</span>
                <span className="mx-1 text-gray-400">exceeds</span>
                <span className="font-medium text-red-600">{alert.threshold}%</span>
              </div>
              <button
                onClick={() => handleDelete(alert.id)}
                className="ml-2 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                aria-label="Delete alert"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
