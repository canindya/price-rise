export default function About() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="text-3xl font-bold text-gray-900">About This Tool</h1>
      <p className="mt-4 leading-relaxed text-gray-600">
        The Global Cost of Living Tracker visualizes how consumer prices have
        changed over time across countries. By indexing data to a common base
        year and presenting it alongside global economic events, the tool helps
        users understand inflation trends in an intuitive, visual way.
      </p>

      {/* Data Sources */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800">Data Sources</h2>
        <ul className="mt-4 space-y-3 text-gray-600">
          <li>
            <strong className="text-gray-800">Overall CPI</strong> —{' '}
            <a
              href="https://data.worldbank.org/indicator/FP.CPI.TOTL"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              World Bank World Development Indicators
            </a>{' '}
            (Consumer Price Index, all items)
          </li>
          <li>
            <strong className="text-gray-800">Food CPI</strong> —{' '}
            <a
              href="https://www.fao.org/faostat/en/#data/CP"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              FAOSTAT Consumer Price Indices
            </a>{' '}
            (Food and non-alcoholic beverages)
          </li>
          <li>
            <strong className="text-gray-800">Energy Benchmark</strong> —{' '}
            <a
              href="https://www.worldbank.org/en/research/commodity-markets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              World Bank Commodity Price Data
            </a>{' '}
            (Crude oil benchmark, applied uniformly across countries)
          </li>
          <li>
            <strong className="text-gray-800">Retail Energy</strong> —
            Curated retail gasoline prices (USD per liter) compiled from{' '}
            <a
              href="https://www.globalpetrolprices.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              GlobalPetrolPrices.com
            </a>
            , IEA Energy Prices, and World Bank data. Coverage is limited to
            approximately 40 countries with data from 2015-2025. Unlike the
            global oil benchmark, this reflects country-specific pump prices
            which include local taxes, subsidies, and distribution costs.
          </li>
          <li>
            <strong className="text-gray-800">Education Investment</strong> —{' '}
            <a
              href="https://data.worldbank.org/indicator/SE.XPD.TOTL.GD.ZS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              World Bank World Development Indicators
            </a>{' '}
            (Government expenditure on education as % of GDP, indicator
            SE.XPD.TOTL.GD.ZS). Note: this reflects government spending on
            education, not direct household costs. For OECD countries, tuition
            data may supplement this indicator where available.
          </li>
        </ul>
      </section>

      {/* Methodology */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800">Methodology</h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          All price series are indexed to a common base year, where the base
          year value is set to 100. A value of 142 in a subsequent year means
          prices rose by 42% relative to the base year. This indexing approach
          allows meaningful comparison across countries and categories,
          regardless of their underlying currency or absolute price levels.
        </p>
        <p className="mt-3 leading-relaxed text-gray-600">
          Percentage changes shown in the summary cards are calculated from the
          first to the last available data point within the selected time range.
          Annualized rates use compound growth:
          <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5 text-sm">
            ((end/start)^(1/years) - 1) * 100
          </code>.
        </p>
      </section>

      {/* Limitations */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800">Limitations</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-600">
          <li>
            CPI measures the average price change for a representative basket of
            goods and services. Individual households may experience inflation
            differently depending on their actual consumption patterns.
          </li>
          <li>
            Country-level data masks significant regional variation. Prices in
            major cities often differ substantially from rural areas within the
            same country.
          </li>
          <li>
            The education component of CPI reflects government-regulated tuition
            and fees, not necessarily the full household cost of education
            including private tuition, supplies, and extracurriculars.
          </li>
          <li>
            The energy benchmark uses crude oil prices as a proxy. This is a
            global benchmark and does not reflect actual pump prices, utility
            tariffs, or local energy costs which vary by country due to taxes,
            subsidies, and distribution costs.
          </li>
          <li>
            Retail energy price data covers approximately 40 countries and may
            not be available for all countries in the tracker. The data
            represents average retail gasoline prices and does not include
            electricity, natural gas, or other energy costs. Price data may
            lag actual market conditions and coverage varies by country and
            year.
          </li>
          <li>
            The education category shows government expenditure on education as a
            percentage of GDP, not direct household spending on education. This
            is a proxy for education investment and does not capture out-of-pocket
            tuition, private schooling costs, or other household education
            expenses. Changes in this metric may reflect fiscal policy shifts
            rather than changes in the cost of education for families.
          </li>
          <li>
            Data gaps exist for some countries and years. Missing data points are
            shown as gaps in charts rather than interpolated, to avoid
            misrepresenting actual trends.
          </li>
          <li>
            Currency-adjusted views have inherent limitations. Exchange rate
            fluctuations can amplify or dampen apparent price changes when
            converting to a common currency.
          </li>
        </ul>
      </section>
    </div>
  );
}
