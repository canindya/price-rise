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
        ? 'text-white after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-[var(--color-accent)]'
        : 'text-gray-400 hover:text-white'
    }`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Thin gradient accent bar */}
      <div className="h-[2px] bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-cpi)] to-[var(--color-education)]" />

      {/* Navigation header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06]" style={{ backgroundColor: 'var(--color-bg)' }}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-bg-elevated)]">
              <svg className="h-4 w-4 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Crimson Pro', serif" }} className="text-lg font-bold tracking-tight text-[var(--color-text)]">
              Cost of Living
              <span className="inline-block ml-0.5 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] align-super" />
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
                className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/[0.05] hover:text-gray-300"
                aria-label="View alerts"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {visibleAlerts.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-danger)] text-[10px] font-bold text-white">
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
                  <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-white/[0.06] p-2 shadow-lg" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                    {visibleAlerts.length === 0 ? (
                      <div className="px-3 py-4 text-center text-sm text-gray-500">
                        No active alerts
                      </div>
                    ) : (
                      <div className="max-h-64 space-y-1 overflow-y-auto">
                        {visibleAlerts.map((alert) => (
                          <div
                            key={alert.config.id}
                            className="flex items-start gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/[0.04]"
                          >
                            <span className="mt-0.5 flex h-2 w-2 shrink-0 rounded-full bg-[var(--color-danger)]" />
                            <div className="min-w-0 flex-1">
                              <span className="text-[var(--color-text-secondary)]">
                                <strong className="text-[var(--color-text)]">{alert.config.countryName}</strong>{' '}
                                {alert.config.category.replace(/_/g, ' ')} at{' '}
                                <strong className="text-[var(--color-text)]">{alert.currentValue.toFixed(1)}%</strong>
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDismissedIds((prev) => new Set(prev).add(alert.config.id));
                              }}
                              className="shrink-0 rounded p-0.5 text-gray-600 hover:bg-white/[0.06] hover:text-gray-400"
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
              className="relative rounded-lg p-2 text-gray-500 hover:bg-white/[0.05]"
              aria-label="View alerts"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {visibleAlerts.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-danger)] text-[10px] font-bold text-white">
                  {visibleAlerts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-gray-500 hover:bg-white/[0.05] hover:text-gray-300"
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
          <div className="border-t border-white/[0.06] px-4 pb-4 pt-2 md:hidden" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
            <div className="flex flex-col gap-1">
              <NavLink
                to="/"
                end
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/[0.06] text-white'
                      : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
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
                      ? 'bg-white/[0.06] text-white'
                      : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
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
                      ? 'bg-white/[0.06] text-white'
                      : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
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
                      ? 'bg-white/[0.06] text-white'
                      : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
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
