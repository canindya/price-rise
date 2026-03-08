# Changelog

## [2026-03-08]

### Added

- **Project Setup**: Initialized Vite + React + TypeScript project with Tailwind CSS, Recharts, Leaflet, and React Router
- **Data Pipeline**: Node.js/TypeScript scripts to fetch and normalize data from World Bank API, FAOSTAT, and static sources
- **5 Data Categories**: Overall CPI (191 countries), Food CPI (48 countries), Energy Oil Benchmark (global), Retail Energy (41 countries), Education Investment (79 countries)
- **193 Country Coverage**: Expanded from initial 80 to full global coverage with ISO-2/ISO-3/FAOSTAT code mappings
- **Explore Dashboard**: Interactive world choropleth map (Leaflet) with click-to-select, trend line chart (Recharts), category cards, country search with autocomplete, and time range selector
- **Country Detail Page**: Full history charts per category, summary statistics, data quality badges, CSV download
- **Country Comparison Page**: Side-by-side comparison of two countries with overlaid charts and category breakdowns
- **View Modes**: Indexed (base=100), Year-over-Year % Change, Local Currency, and PPP-Adjusted views
- **Custom Date Range**: From/To year inputs alongside 1Y/5Y/10Y presets
- **Global Benchmark Toggle**: "Show World Average" dashed overlay lines for comparison
- **Data Quality Indicators**: Green/yellow/red badges per category with "Insufficient data" fallback for sparse data
- **Event Annotations**: 14 major global economic events (2008-2025) rendered as vertical markers on charts
- **User Location Detection**: IP-based geolocation (ipapi.co) to auto-select user's country on first visit
- **My Basket**: Personalized weighted inflation calculator with adjustable category sliders and localStorage persistence
- **Alert Subscriptions**: Threshold-based inflation alerts saved in localStorage with dismissible notification banners
- **PPP Data**: Purchasing Power Parity conversion factors from World Bank for 190 countries
- **About/Methodology Page**: Data sources, methodology explanation, and limitations documentation
- **Landing Page**: Hero section with feature highlights and CTA to Explore
