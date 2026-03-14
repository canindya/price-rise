import { NavLink, Outlet } from 'react-router-dom';

const INDIA_NAV_ITEMS = [
  { to: '/india', label: 'Overview', end: true },
  { to: '/india/purchasing-power', label: 'Purchasing Power' },
  { to: '/india/price-lookup', label: 'Price Lookup' },
  { to: '/india/spike-timeline', label: 'Spike Timeline' },
  { to: '/india/budget-stress', label: 'Budget Stress' },
  { to: '/india/sector-cards', label: 'Winners & Losers' },
  { to: '/india/share', label: 'Share Story' },
];

export default function IndiaLayout() {
  return (
    <div>
      {/* Sub-navigation */}
      <div
        className="mb-6 overflow-x-auto rounded-xl p-1"
        style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-0.5 min-w-max">
          {INDIA_NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive ? '' : ''
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                color: isActive ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                fontFamily: "'DM Sans', sans-serif",
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  );
}
