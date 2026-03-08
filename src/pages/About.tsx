export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">About This Tool</h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-600">
          The Global Cost of Living Tracker visualizes how consumer prices have
          changed over time across countries. By indexing data to a common base
          year and presenting it alongside global economic events, the tool helps
          users understand inflation trends in an intuitive, visual way.
        </p>

        {/* Data Sources */}
        <section className="mt-12">
          <h2 className="border-l-4 border-blue-500 pl-4 text-2xl font-bold text-gray-900">
            Data Sources
          </h2>
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Source</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">Overall CPI</td>
                  <td className="px-6 py-4 text-gray-600">
                    <a
                      href="https://data.worldbank.org/indicator/FP.CPI.TOTL"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      World Bank WDI
                    </a>
                  </td>
                  <td className="px-6 py-4 text-gray-500">Consumer Price Index, all items</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">Food CPI</td>
                  <td className="px-6 py-4 text-gray-600">
                    <a
                      href="https://www.fao.org/faostat/en/#data/CP"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      FAOSTAT
                    </a>
                  </td>
                  <td className="px-6 py-4 text-gray-500">Food and non-alcoholic beverages</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">Energy Benchmark</td>
                  <td className="px-6 py-4 text-gray-600">
                    <a
                      href="https://www.worldbank.org/en/research/commodity-markets"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      World Bank Commodities
                    </a>
                  </td>
                  <td className="px-6 py-4 text-gray-500">Crude oil benchmark, applied uniformly</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">Retail Energy</td>
                  <td className="px-6 py-4 text-gray-600">
                    <a
                      href="https://www.globalpetrolprices.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      GlobalPetrolPrices.com
                    </a>
                    , IEA, World Bank
                  </td>
                  <td className="px-6 py-4 text-gray-500">~40 countries, 2015-2025. Reflects local taxes, subsidies, distribution costs</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">Education Investment</td>
                  <td className="px-6 py-4 text-gray-600">
                    <a
                      href="https://data.worldbank.org/indicator/SE.XPD.TOTL.GD.ZS"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      World Bank WDI
                    </a>
                  </td>
                  <td className="px-6 py-4 text-gray-500">Government expenditure on education as % of GDP (SE.XPD.TOTL.GD.ZS)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Methodology */}
        <section className="mt-12">
          <h2 className="border-l-4 border-blue-500 pl-4 text-2xl font-bold text-gray-900">
            Methodology
          </h2>
          <div className="mt-6 space-y-4 text-gray-600" style={{ lineHeight: '1.75' }}>
            <p>
              All price series are indexed to a common base year, where the base
              year value is set to 100. A value of 142 in a subsequent year means
              prices rose by 42% relative to the base year. This indexing approach
              allows meaningful comparison across countries and categories,
              regardless of their underlying currency or absolute price levels.
            </p>
            <p>
              Percentage changes shown in the summary cards are calculated from the
              first to the last available data point within the selected time range.
              Annualized rates use compound growth:
            </p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <code className="text-sm text-gray-700">
                ((end / start) ^ (1 / years) - 1) * 100
              </code>
            </div>
          </div>
        </section>

        {/* Limitations */}
        <section className="mt-12">
          <h2 className="border-l-4 border-blue-500 pl-4 text-2xl font-bold text-gray-900">
            Limitations
          </h2>
          <div className="mt-6 space-y-4">
            {[
              'CPI measures the average price change for a representative basket of goods and services. Individual households may experience inflation differently depending on their actual consumption patterns.',
              'Country-level data masks significant regional variation. Prices in major cities often differ substantially from rural areas within the same country.',
              'The education component of CPI reflects government-regulated tuition and fees, not necessarily the full household cost of education including private tuition, supplies, and extracurriculars.',
              'The energy benchmark uses crude oil prices as a proxy. This is a global benchmark and does not reflect actual pump prices, utility tariffs, or local energy costs which vary by country due to taxes, subsidies, and distribution costs.',
              'Retail energy price data covers approximately 40 countries and may not be available for all countries in the tracker. The data represents average retail gasoline prices and does not include electricity, natural gas, or other energy costs.',
              'The education category shows government expenditure on education as a percentage of GDP, not direct household spending on education. Changes in this metric may reflect fiscal policy shifts rather than changes in the cost of education for families.',
              'Data gaps exist for some countries and years. Missing data points are shown as gaps in charts rather than interpolated, to avoid misrepresenting actual trends.',
              'Currency-adjusted views have inherent limitations. Exchange rate fluctuations can amplify or dampen apparent price changes when converting to a common currency.',
            ].map((text, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-gray-600" style={{ lineHeight: '1.75' }}>{text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
