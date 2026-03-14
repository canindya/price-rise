import { Link } from 'react-router-dom';
import { useMospiData } from '../../hooks/useMospiData';

const FEATURES = [
  {
    to: '/india/purchasing-power',
    title: 'What Did Your Money Become?',
    description: 'Enter a savings amount and year. See what it actually buys today in groceries, fuel, and school fees.',
    icon: (
      <svg className="h-8 w-8" style={{ color: 'var(--color-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    to: '/india/price-lookup',
    title: 'What Did This Cost Then?',
    description: 'Pick a category like cooking oil or school fees. See what it cost years ago versus today.',
    icon: (
      <svg className="h-8 w-8" style={{ color: 'var(--color-cpi)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    to: '/india/spike-timeline',
    title: 'Which Month Hurt Most?',
    description: 'A heatmap showing the worst food, fuel, and education inflation spikes. Connect data to memory.',
    icon: (
      <svg className="h-8 w-8" style={{ color: 'var(--color-energy)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
  },
  {
    to: '/india/budget-stress',
    title: 'Household Budget Stress',
    description: 'Input your monthly spend split. Get a stress index showing how much more your basket costs today.',
    icon: (
      <svg className="h-8 w-8" style={{ color: 'var(--color-retail)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
      </svg>
    ),
  },
  {
    to: '/india/sector-cards',
    title: 'Winners & Losers',
    description: 'Which sectors beat inflation? Which surged? See deflation surprises alongside the pain points.',
    icon: (
      <svg className="h-8 w-8" style={{ color: 'var(--color-education)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5-3L16.5 18m0 0L12 13.5m4.5 4.5V6" />
      </svg>
    ),
  },
  {
    to: '/india/share',
    title: 'Share Your Inflation Story',
    description: 'Generate shareable image cards for WhatsApp and LinkedIn. Make the data personal and viral.',
    icon: (
      <svg className="h-8 w-8" style={{ color: 'var(--color-india-health)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    ),
  },
];

export default function IndiaLanding() {
  const { getLatestValue, getMonthlyChange, isLoading } = useMospiData();

  // Quick stats
  const generalCPI = getLatestValue('general');
  const foodLatest = getMonthlyChange('food_beverages');
  const fuelLatest = getMonthlyChange('fuel_light');

  const latestFoodMoM = foodLatest.length > 0 ? foodLatest[foodLatest.length - 1].value : null;
  const latestFuelMoM = fuelLatest.length > 0 ? fuelLatest[fuelLatest.length - 1].value : null;

  return (
    <div className="mesh-bg min-h-screen">
      {/* Hero */}
      <section className="pb-12 pt-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1
            className="animate-fade-up text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "'Crimson Pro', serif", color: 'var(--color-text)' }}
          >
            India Cost of Living{' '}
            <span className="text-[var(--color-accent)]">Deep Dive</span>
          </h1>
          <p className="animate-fade-up delay-1 mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Powered by MOSPI CPI data. Monthly indices, sub-category breakdown,
            rural vs urban splits — all from India's official statistics.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      {!isLoading && (
        <section className="animate-fade-up delay-2 pb-10">
          <div className="mx-auto grid max-w-3xl grid-cols-3 gap-6 px-4">
            <div className="text-center">
              <div
                className="text-3xl font-bold tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-text)' }}
              >
                {generalCPI?.indexed?.toFixed(1) ?? '—'}
              </div>
              <div className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                CPI Index (2012=100)
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-3xl font-bold tabular-nums"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: latestFoodMoM != null && latestFoodMoM > 0 ? '#f87171' : 'var(--color-accent)',
                }}
              >
                {latestFoodMoM != null ? `${latestFoodMoM > 0 ? '+' : ''}${latestFoodMoM.toFixed(2)}%` : '—'}
              </div>
              <div className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Food MoM Change
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-3xl font-bold tabular-nums"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: latestFuelMoM != null && latestFuelMoM > 0 ? '#f87171' : 'var(--color-accent)',
                }}
              >
                {latestFuelMoM != null ? `${latestFuelMoM > 0 ? '+' : ''}${latestFuelMoM.toFixed(2)}%` : '—'}
              </div>
              <div className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Fuel MoM Change
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Feature Cards */}
      <section className="pb-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <Link
              key={feature.to}
              to={feature.to}
              className="animate-fade-up glass-card group p-6 transition-all hover:border-[var(--color-border-hover)]"
              style={{ animationDelay: `${0.2 + idx * 0.08}s` }}
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-elevated)' }}
              >
                {feature.icon}
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ fontFamily: "'Crimson Pro', serif", color: 'var(--color-text)' }}
              >
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {feature.description}
              </p>
              <div
                className="mt-4 flex items-center gap-1 text-sm font-medium transition-colors group-hover:text-[var(--color-accent)]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Explore
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Data Source Attribution */}
      <section className="pb-8">
        <div className="text-center">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Data sourced from{' '}
            <span style={{ color: 'var(--color-text-secondary)' }}>
              MOSPI (Ministry of Statistics and Programme Implementation)
            </span>{' '}
            and{' '}
            <span style={{ color: 'var(--color-text-secondary)' }}>
              HCES 2023-24
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
