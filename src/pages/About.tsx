export default function About() {
  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="animate-fade-up font-[Crimson_Pro] text-3xl font-black text-white sm:text-4xl">About This Tool</h1>
          <p className="animate-fade-up delay-1 mt-6 text-lg leading-relaxed text-gray-300">
            The Global Cost of Living Tracker visualizes how consumer prices have
            changed over time across countries. By indexing data to a common base
            year and presenting it alongside global economic events, the tool helps
            users understand inflation trends in an intuitive, visual way.
          </p>

          {/* Data Sources */}
          <section className="animate-fade-up delay-2 mt-12">
            <h2 className="border-l-2 border-emerald-500 pl-4 font-[Crimson_Pro] text-2xl font-bold text-white">
              Data Sources
            </h2>
            <div className="mt-6 overflow-hidden rounded-xl">
              <div className="glass-card">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-3 font-[Crimson_Pro] font-semibold text-gray-300">Category</th>
                      <th className="px-6 py-3 font-[Crimson_Pro] font-semibold text-gray-300">Source</th>
                      <th className="px-6 py-3 font-[Crimson_Pro] font-semibold text-gray-300">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="px-6 py-4 font-medium text-gray-200">Overall CPI</td>
                      <td className="px-6 py-4 text-gray-400">
                        <a
                          href="https://data.worldbank.org/indicator/FP.CPI.TOTL"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 transition-colors hover:text-emerald-300"
                        >
                          World Bank WDI
                        </a>
                      </td>
                      <td className="px-6 py-4 text-gray-500">Consumer Price Index, all items</td>
                    </tr>
                    <tr className="border-b border-white/5 bg-white/[0.03]">
                      <td className="px-6 py-4 font-medium text-gray-200">Food CPI</td>
                      <td className="px-6 py-4 text-gray-400">
                        <a
                          href="https://www.fao.org/faostat/en/#data/CP"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 transition-colors hover:text-emerald-300"
                        >
                          FAOSTAT
                        </a>
                      </td>
                      <td className="px-6 py-4 text-gray-500">Food and non-alcoholic beverages</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="px-6 py-4 font-medium text-gray-200">Energy Benchmark</td>
                      <td className="px-6 py-4 text-gray-400">
                        <a
                          href="https://www.worldbank.org/en/research/commodity-markets"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 transition-colors hover:text-emerald-300"
                        >
                          World Bank Commodities
                        </a>
                      </td>
                      <td className="px-6 py-4 text-gray-500">Crude oil benchmark, applied uniformly</td>
                    </tr>
                    <tr className="border-b border-white/5 bg-white/[0.03]">
                      <td className="px-6 py-4 font-medium text-gray-200">Retail Energy</td>
                      <td className="px-6 py-4 text-gray-400">
                        <a
                          href="https://www.globalpetrolprices.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 transition-colors hover:text-emerald-300"
                        >
                          GlobalPetrolPrices.com
                        </a>
                        , IEA, World Bank
                      </td>
                      <td className="px-6 py-4 text-gray-500">~40 countries, 2015-2025. Reflects local taxes, subsidies, distribution costs</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-200">Education Investment</td>
                      <td className="px-6 py-4 text-gray-400">
                        <a
                          href="https://data.worldbank.org/indicator/SE.XPD.TOTL.GD.ZS"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 transition-colors hover:text-emerald-300"
                        >
                          World Bank WDI
                        </a>
                      </td>
                      <td className="px-6 py-4 text-gray-500">Government expenditure on education as % of GDP (SE.XPD.TOTL.GD.ZS)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Methodology */}
          <section className="animate-fade-up delay-3 mt-12">
            <h2 className="border-l-2 border-emerald-500 pl-4 font-[Crimson_Pro] text-2xl font-bold text-white">
              Methodology
            </h2>
            <div className="mt-6 space-y-4 font-[Crimson_Pro] text-lg leading-relaxed text-gray-300">
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
              <div className="rounded-lg border border-white/10 bg-[#1a1f2e] px-4 py-3">
                <code className="font-[JetBrains_Mono] text-sm text-emerald-400">
                  ((end / start) ^ (1 / years) - 1) * 100
                </code>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="my-12 border-t border-white/5" />

          {/* Limitations */}
          <section className="animate-fade-up delay-4">
            <h2 className="border-l-2 border-emerald-500 pl-4 font-[Crimson_Pro] text-2xl font-bold text-white">
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
                  <div className="mt-1.5 flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                  </div>
                  <p className="leading-relaxed text-gray-300">{text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="my-12 border-t border-white/5" />
        </div>
      </div>
    </div>
  );
}
