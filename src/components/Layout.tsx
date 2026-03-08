import { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import type { Category } from '../types/index';
import { useCountryData } from '../hooks/useCountryData';
import { checkAlerts } from './AlertSetup';
import type { TriggeredAlert } from './AlertSetup';

const navItems = [
  {
    to: '/',
    end: true,
    label: 'Home',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    to: '/explore',
    end: false,
    label: 'Explore',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.257.26-2.453.726-3.418" />
      </svg>
    ),
  },
  {
    to: '/compare',
    end: false,
    label: 'Compare',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    to: '/about',
    end: false,
    label: 'About',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
];

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  if (pathname === '/explore') return 'Explore';
  if (pathname.startsWith('/country/')) return 'Country Detail';
  if (pathname === '/compare') return 'Compare';
  if (pathname === '/about') return 'About';
  return 'Page';
}

export default function Layout() {
  const { getAllCountriesChange, isLoading } = useCountryData();
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [alertDropdownOpen, setAlertDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const visibleAlerts = triggeredAlerts.filter(
    (a) => !dismissedIds.has(a.config.id),
  );

  const pageTitle = getPageTitle(location.pathname);

  const sidebarNavClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-3 py-3 text-gray-600 transition-colors hover:text-indigo-400 ${
      isActive ? 'text-indigo-400' : ''
    }`;

  const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 py-2 px-3 text-xs transition-colors ${
      isActive ? 'text-indigo-500' : 'text-gray-500 hover:text-gray-700'
    }`;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - desktop only */}
      <div
        id="sidebar"
        className="hidden lg:flex h-screen w-16 bg-white px-4 items-center fixed shadow flex-col justify-center"
      >
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={sidebarNavClass}>
                {item.icon}
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 lg:pl-16">
        {/* Top header bar */}
        <header className="bg-gray-200 lg:bg-gray-100 border-b border-gray-300 px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Left: mobile hamburger + page title */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg p-1.5 text-gray-500 hover:bg-gray-300 hover:text-gray-700"
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
            <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
          </div>

          {/* Right: search + alerts */}
          <div className="flex items-center gap-3">
            {/* Search bar - hidden on small screens */}
            <div className="hidden sm:block relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 rounded-full bg-gray-200 lg:bg-gray-200 px-4 py-1.5 pl-9 text-sm text-gray-700 placeholder-gray-500 focus:bg-white focus:shadow-md focus:outline-none transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>

            {/* Alert bell */}
            <div className="relative">
              <button
                onClick={() => setAlertDropdownOpen(!alertDropdownOpen)}
                className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-300 hover:text-gray-700"
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
        </header>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-gray-300 bg-white px-4 pb-3 pt-2 shadow-sm">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-center justify-around px-2 py-1 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={mobileNavClass}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
