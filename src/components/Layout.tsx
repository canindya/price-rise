import { useState, useEffect, useMemo } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import type { Category } from '../types/index';
import { useCountryData } from '../hooks/useCountryData';
import { checkAlerts } from './AlertSetup';
import type { TriggeredAlert } from './AlertSetup';

export default function Layout() {
  const { getAllCountriesChange, isLoading } = useCountryData();
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [alertDropdownOpen, setAlertDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-1 py-1 text-sm font-medium transition-colors ${
      isActive
        ? 'text-blue-700 after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-blue-600'
        : 'text-gray-500 hover:text-gray-900'
    }`;

  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)]">
      {/* Thin gradient accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />

      {/* Navigation header */}
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight text-gray-900">
              Cost of Living Tracker
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-8 md:flex">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/explore" className={navLinkClass}>
              Explore
            </NavLink>
            <NavLink to="/compare" className={navLinkClass}>
              Compare
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>

            {/* Alert bell icon */}
            <div className="relative">
              <button
                onClick={() => setAlertDropdownOpen(!alertDropdownOpen)}
                className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="View alerts"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {visibleAlerts.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {visibleAlerts.length}
                  </span>
                )}
              </button>

              {/* Alert dropdown */}
              {alertDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setAlertDropdownOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                    {visibleAlerts.length === 0 ? (
                      <div className="px-3 py-4 text-center text-sm text-gray-400">
                        No active alerts
                      </div>
                    ) : (
                      <div className="max-h-64 space-y-1 overflow-y-auto">
                        {visibleAlerts.map((alert) => (
                          <div
                            key={alert.config.id}
                            className="flex items-start gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                          >
                            <span className="mt-0.5 flex h-2 w-2 shrink-0 rounded-full bg-red-500" />
                            <div className="min-w-0 flex-1">
                              <span className="text-gray-700">
                                <strong>{alert.config.countryName}</strong>{' '}
                                {alert.config.category.replace(/_/g, ' ')} at{' '}
                                <strong>{alert.currentValue.toFixed(1)}%</strong>
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDismissedIds((prev) => new Set(prev).add(alert.config.id));
                              }}
                              className="shrink-0 rounded p-0.5 text-gray-300 hover:bg-gray-100 hover:text-gray-500"
                              aria-label="Dismiss alert"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile alert bell */}
            <button
              onClick={() => setAlertDropdownOpen(!alertDropdownOpen)}
              className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              aria-label="View alerts"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {visibleAlerts.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {visibleAlerts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden">
            <div className="flex flex-col gap-1">
              <NavLink
                to="/"
                end
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                Explore
              </NavLink>
              <NavLink
                to="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                Compare
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                About
              </NavLink>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
