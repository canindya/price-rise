export default function About() {
  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="animate-fade-up font-[Crimson_Pro] text-3xl font-black sm:text-4xl" style={{ color: 'var(--color-text)' }}>About This Tool</h1>
          <p className="animate-fade-up delay-1 mt-6 text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            The Global Cost of Living Tracker visualizes how consumer prices have
            changed over time across countries. By indexing data to a common base
            year and presenting it alongside global economic events, the tool helps
            users understand inflation trends in an intuitive, visual way.
          </p>

          {/* Data Sources */}
          <section className="animate-fade-up delay-2 mt-12">
            <h2 className="pl-4 font-[Crimson_Pro] text-2xl font-bold" style={{ color: 'var(--color-text)', borderLeft: '2px solid var(--color-accent)' }}>
              Data Sources
            </h2>
            <div className="mt-6 overflow-hidden rounded-xl">
              <div className="glass-card">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border-hover)' }}>
                      <th className="px-6 py-3 font-[Crimson_Pro] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Category</th>
                      <th className="px-6 py-3 font-[Crimson_Pro] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Source</th>
                      <th className="px-6 py-3 font-[Crimson_Pro] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td className="px-6 py-4 font-medium" style={{ color: 'var(--color-text)' }}>Overall CPI</td>
                      <td className="px-6 py-4" style={{ color: 'var(--color-text-secondary)' }}>
                        <a
                          href="https://data.worldbank.org/indicator/FP.CPI.TOTL"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:opacity-80"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          World Bank WDI
                        </a>
                      </td>
                      <td className="px-6 py-4" style={{ color: 'var(--color-text-muted)' }}>Consumer Price Index, all items</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-subtle)' }}>
                      <td className="px-6 py-4 font-medium" style={{ color: 'var(--color-text)' }}>Food CPI</td>
                      <td className="px-6 py-4" style={{ color: 'var(--color-text-secondary)' }}>
                        <a
                          href="https://www.fao.org/faostat/en/#data/CP"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:opacity-80"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          FAOSTAT
                        </a>
                      </td>
                      <td className="px-6 py-4" style={{ color: 'var(--color-text-muted)' }}>Food and non-alcoholic beverages</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td className="px-6 py-4 font-medium" style={{ color: 'var(--color-text)' }}>Energy Benchmark</td>
                      <td className="px-6 py-4" style={{ color: 'var(--color-text-secondary)' }}>
                        <a
                          href="https://www.worldbank.org/en/research/commodity-markets"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:opacity-80"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          World Bank Commodities
                        </a>
                      </td>
                      <td className="px-6 py-4" style={{ color: 'var(--color-text-muted)' }}>Crude oil benchmark, applied uniformly</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-subtle)' }}>
                      <td className="px-6 py-4 font-medium" style={{ color: 'var(--color-text)' }}>Retail Energy</td>
                      <td className="px-6 py-4" style={{ color: 'var(--color-text-secondary)' }}>
                        <a
                          href="https://www.globalpetrolprices.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:opacity-80"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          GlobalPetrolPrices.com
                        </a>
                        , IEA, World Bank
                      </td>
                      <td className="px-6 py-4" style={{ color: 'var(--color-text-muted)' }}>~40 countries, 2015-2025. Reflects local taxes, subsidies, distribution costs</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium" style={{ color: 'var(--color-text)' }}>Education Investment</td>
                      <td className="px-6 py-4" style={{ color: 'var(--color-text-secondary)' }}>
                        <a
                          href="https://data.worldbank.org/indicator/SE.XPD.TOTL.GD.ZS"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:opacity-80"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          World Bank WDI
                        </a>
                      </td>
                      <td className="px-6 py-4" style={{ color: 'var(--color-text-muted)' }}>Government expenditure on education as % of GDP (SE.XPD.TOTL.GD.ZS)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Methodology */}
          <section className="animate-fade-up delay-3 mt-12">
            <h2 className="pl-4 font-[Crimson_Pro] text-2xl font-bold" style={{ color: 'var(--color-text)', borderLeft: '2px solid var(--color-accent)' }}>
              Methodology
            </h2>
            <div className="mt-6 space-y-4 font-[Crimson_Pro] text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
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
              <div className="rounded-lg bg-[var(--color-bg-elevated)] px-4 py-3" style={{ border: '1px solid var(--color-border)' }}>
                <code className="font-[JetBrains_Mono] text-sm" style={{ color: 'var(--color-accent)' }}>
                  ((end / start) ^ (1 / years) - 1) * 100
                </code>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="my-12" style={{ borderTop: '1px solid var(--color-border-subtle)' }} />

          {/* Limitations */}
          <section className="animate-fade-up delay-4">
            <h2 className="pl-4 font-[Crimson_Pro] text-2xl font-bold" style={{ color: 'var(--color-text)', borderLeft: '2px solid var(--color-accent)' }}>
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
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-accent-warm)' }} />
                  </div>
                  <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="my-12" style={{ borderTop: '1px solid var(--color-border-subtle)' }} />
        </div>
      </div>
    </div>
  );
}
