import { Link } from 'react-router-dom';

const FEATURES = [
  {
    title: 'Time-Series Tracking',
    description:
      'Go beyond static snapshots. See how prices have evolved over 1, 5, and 10 years with interactive charts and indexed comparisons.',
    icon: (
      <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 17l6-6 4 4 8-8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 7h4v4" />
      </svg>
    ),
  },
  {
    title: 'Category Breakdown',
    description:
      'Drill into the categories that matter most: overall consumer prices, food and essentials, and energy benchmarks.',
    icon: (
      <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h10M4 18h6" />
      </svg>
    ),
  },
  {
    title: '180+ Countries',
    description:
      'Compare cost of living trends across the globe with data sourced from the World Bank, FAO, and other international bodies.',
    icon: (
      <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="mt-8 flex max-w-3xl flex-col items-center text-center sm:mt-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          How Has Your Cost of Living Changed?
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-600">
          Track price changes across countries over 1, 5, and 10 years — broken
          down by what you actually spend on.
        </p>
        <Link
          to="/explore"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Explore the Data
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </section>

      {/* Feature Cards */}
      <section className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-8 sm:mt-24 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              {feature.description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
