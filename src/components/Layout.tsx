import { useState, useEffect, useMemo } from 'react';
import { Link, Outlet } from 'react-router-dom';
import type { Category } from '../types/index';
import { useCountryData } from '../hooks/useCountryData';
import { checkAlerts } from './AlertSetup';
import type { TriggeredAlert } from './AlertSetup';

export default function Layout() {
  const { getAllCountriesChange, isLoading } = useCountryData();
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const allChanges = useMemo(() => {
    if (isLoading) return {};
    const categories: Category[] = [
      'overall_cpi',
      'food_cpi',
      'energy_benchmark',
      'energy_retail',
      'education_spend',
    ];
    const result: Partial<Record<Category, Record<string, number>>> = {};
    for (const cat of categories) {
      result[cat] = getAllCountriesChange(cat, '10Y');
    }
    return result;
  }, [isLoading, getAllCountriesChange]);

  useEffect(() => {
    if (isLoading) return;
    const triggered = checkAlerts(allChanges);
    setTriggeredAlerts(triggered);
  }, [allChanges, isLoading]);

  const visibleAlerts = triggeredAlerts.filter(
    (a) => !dismissedIds.has(a.config.id),
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-slate-800 text-white shadow-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold tracking-tight">
            Cost of Living Tracker
          </Link>
          <div className="flex gap-6 text-sm">
            <Link
              to="/"
              className="transition-colors hover:text-blue-300"
            >
              Home
            </Link>
            <Link
              to="/explore"
              className="transition-colors hover:text-blue-300"
            >
              Explore
            </Link>
            <Link
              to="/compare"
              className="transition-colors hover:text-blue-300"
            >
              Compare
            </Link>
            <Link
              to="/about"
              className="transition-colors hover:text-blue-300"
            >
              About
            </Link>
          </div>
        </nav>
      </header>

      {/* Triggered alert banners */}
      {visibleAlerts.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <div className="space-y-2">
            {visibleAlerts.map((alert) => (
              <div
                key={alert.config.id}
                className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 ring-1 ring-red-200"
              >
                <span>
                  <strong>{alert.config.countryName}</strong> —{' '}
                  {alert.config.category.replace(/_/g, ' ')} inflation is at{' '}
                  <strong>{alert.currentValue.toFixed(1)}%</strong>, exceeding
                  your {alert.config.threshold}% threshold.
                </span>
                <button
                  onClick={() =>
                    setDismissedIds((prev) => new Set(prev).add(alert.config.id))
                  }
                  className="ml-3 rounded p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
                  aria-label="Dismiss alert"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
