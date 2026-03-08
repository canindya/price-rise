import { useState, useEffect, useMemo } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import type { Category } from '../types/index';
import { useCountryData } from '../hooks/useCountryData';
import { checkAlerts } from './AlertSetup';
import type { TriggeredAlert } from './AlertSetup';
import { useTheme } from '../hooks/useTheme';

export default function Layout() {
  const { getAllCountriesChange, isLoading } = useCountryData();
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [alertDropdownOpen, setAlertDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
        ? 'text-[var(--color-nav-active)] after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-[var(--color-accent)]'
        : 'text-[var(--color-nav-inactive)] hover:text-[var(--color-nav-hover)]'
    }`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Thin gradient accent bar */}
      <div className="h-[2px] bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-cpi)] to-[var(--color-education)]" />

      {/* Navigation header */}
      <header className="sticky top-0 z-40" style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
              <svg className="h-4 w-4" style={{ color: 'var(--color-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Crimson Pro', serif", color: 'var(--color-text)' }} className="text-lg font-bold tracking-tight">
              Cost of Living
              <span className="inline-block ml-0.5 h-1.5 w-1.5 rounded-full align-super" style={{ backgroundColor: 'var(--color-accent)' }} />
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-8 md:flex">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/explore" className={navLinkClass}>Explore</NavLink>
            <NavLink to="/compare" className={navLinkClass}>Compare</NavLink>
            <NavLink to="/about" className={navLinkClass}>About</NavLink>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>

            {/* Alert bell icon */}
            <div className="relative">
              <button
                onClick={() => setAlertDropdownOpen(!alertDropdownOpen)}
                className="relative rounded-lg p-2 transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="View alerts"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {visibleAlerts.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: 'var(--color-danger)' }}>
                    {visibleAlerts.length}
                  </span>
                )}
              </button>

              {/* Alert dropdown */}
              {alertDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAlertDropdownOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl p-2 shadow-lg" style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                    {visibleAlerts.length === 0 ? (
                      <div className="px-3 py-4 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        No active alerts
                      </div>
                    ) : (
                      <div className="max-h-64 space-y-1 overflow-y-auto">
                        {visibleAlerts.map((alert) => (
                          <div key={alert.config.id} className="flex items-start gap-2 rounded-lg px-3 py-2 text-sm">
                            <span className="mt-0.5 flex h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: 'var(--color-danger)' }} />
                            <div className="min-w-0 flex-1">
                              <span style={{ color: 'var(--color-text-secondary)' }}>
                                <strong style={{ color: 'var(--color-text)' }}>{alert.config.countryName}</strong>{' '}
                                {alert.config.category.replace(/_/g, ' ')} at{' '}
                                <strong style={{ color: 'var(--color-text)' }}>{alert.currentValue.toFixed(1)}%</strong>
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDismissedIds((prev) => new Set(prev).add(alert.config.id));
                              }}
                              className="shrink-0 rounded p-0.5"
                              style={{ color: 'var(--color-text-muted)' }}
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
            {/* Mobile theme toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>

            {/* Mobile alert bell */}
            <button
              onClick={() => setAlertDropdownOpen(!alertDropdownOpen)}
              className="relative rounded-lg p-2"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="View alerts"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {visibleAlerts.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: 'var(--color-danger)' }}>
                  {visibleAlerts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2"
              style={{ color: 'var(--color-text-muted)' }}
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
          <div className="px-4 pb-4 pt-2 md:hidden" style={{ backgroundColor: 'var(--color-bg-elevated)', borderTop: '1px solid var(--color-border)' }}>
            <div className="flex flex-col gap-1">
              {[
                { to: '/', label: 'Home', end: true },
                { to: '/explore', label: 'Explore' },
                { to: '/compare', label: 'Compare' },
                { to: '/about', label: 'About' },
              ].map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-[var(--color-nav-active)]'
                        : 'text-[var(--color-nav-inactive)] hover:text-[var(--color-nav-hover)]'
                    }`
                  }
                  style={({ isActive }) => isActive ? { backgroundColor: 'var(--color-bg-card)' } : undefined}
                >
                  {label}
                </NavLink>
              ))}
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
