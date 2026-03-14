# Changelog

## [2026-03-15]

### Added

- **India Section**: New "India" menu with 6 dedicated features powered by MOSPI CPI data (monthly, sub-category granularity)
- **Purchasing Power Eroder**: Input a savings amount and year, see how inflation eroded purchasing power across food, fuel, education, health, housing, and clothing
- **Reverse Price Lookup**: Select a product category and year, compare estimated price then vs now with percentage delta and CPI index chart
- **Inflation Spike Timeline**: Monthly heatmap showing worst food/fuel/education inflation spikes from 2012-2025, with event annotations (onion crisis, GST, COVID, etc.)
- **Household Budget Stress Score**: Input monthly spend allocation, get a weighted stress index showing how much more your basket costs today vs 5/10 years ago
- **Inflation Winners & Losers**: Two-column sector cards showing which categories surged vs stayed stable, with sparklines and narratives
- **Share My Inflation Story**: Generate branded shareable image cards (purchasing power, category comparison, worst month, custom stat) for WhatsApp/LinkedIn, using html-to-image
- **MOSPI Data Pipeline**: Fetch script (`scripts/fetch-mospi.ts`) generating 168 months x 8 sub-groups x 3 coverages (All India, Rural, Urban) of CPI data
- **HCES Weights**: Household expenditure shares from HCES 2023-24 survey for realistic budget weightings (All India, Rural, Urban splits)
- **India Events**: 18 India-specific economic event annotations with monthly granularity
- **useMospiData Hook**: Dedicated data hook for MOSPI CPI with series access, purchasing power calculation, month-over-month changes
- **India Types**: TypeScript types for MonthlyDataPoint, MospiSubGroup, MospiCoverage, sub-group labels and color maps
- **Geolocation-Based Nav**: India menu items auto-appear when user's IP location is detected as India (via existing ipapi.co hook)

### Changed

- **Navigation**: Added India dropdown (desktop) and collapsible section (mobile) to Layout, conditionally visible based on user geolocation or active India route
- **Routing**: Added `/india/*` route group with IndiaLayout wrapper and 7 child routes
- **CSS**: Added `--color-india-health`, `--color-india-housing`, `--color-india-misc` custom properties for both light and dark themes
- **Build Pipeline**: Added MOSPI CPI fetch as Step 8/9 in `scripts/build-all.ts`
- **Dependencies**: Added `html-to-image` for social snippet image generation

## [2026-03-08]

### Added

- **Dark Mode Toggle**: Sun/moon icon in header to switch between light and dark themes, with localStorage persistence
- **Theme Hook**: `useTheme` hook managing theme state, toggling `.dark` class on `<html>`, saving preference
- **Light Theme**: Full light color palette (`:root` default) with cream backgrounds, dark text, rich category colors
- **Flash Prevention**: Inline script in `index.html` applies saved theme before React renders

### Changed

- **CSS Variables**: Expanded from 12 to 30+ CSS variables covering all theme-dependent colors (backgrounds, text, borders, charts, nav, toggles)
- **All Components**: Replaced hardcoded hex/rgba dark colors with `var(--color-*)` CSS variables across 11 components and 5 pages
- **Charts**: TrendChart and ComparisonChart use theme-aware grid, axis, cursor, reference line, and event label colors
- **Map**: WorldMap uses theme-aware background, borders, tooltips, legend, and zoom controls
- **Modals**: MyBasket and AlertSetup use theme-aware card, input, and button colors

### Fixed

- **Energy Data**: Fixed energy_retail using ISO-2 codes (US, GB) while app expects ISO-3 (USA, GBR) — added re-keying on load
- **Energy Benchmark**: Fixed energy_benchmark only having a WORLD key — now copies global oil series to all country codes
- **Duplicate Cards**: Removed redundant inline stat cards on Explore page that duplicated the CategoryCards component

### Changed

- **Dark Editorial Theme**: Complete UI overhaul to dark editorial aesthetic inspired by Anthropic's frontend aesthetics cookbook (Bloomberg Terminal meets The Economist)
- **Design System**: Custom CSS variables for dark palette (#0c0f14 bg, #141820 cards, #1a1f2e elevated), Crimson Pro serif headings, DM Sans body, JetBrains Mono numbers
- **CSS**: Added fadeUp animations with staggered delays, glass-card utility, mesh-bg radial gradients, toggle-switch component, glow effects
- **All Components**: Updated 11 components and 5 pages from light to dark theme with vivid accent colors on dark backgrounds
- **Charts**: Dark tooltips/legends, rgba borders, dark grid lines, consistent category color palette across TrendChart and ComparisonChart
- **Modals**: MyBasket and AlertSetup modals restyled with dark cards, green accent buttons, dark form inputs
- **Map**: Dark-themed WorldMap with dark tile layer, dark tooltips and legend
- **Full UI Redesign**: Professional dashboard aesthetic inspired by Our World in Data / Bloomberg
- **Layout**: Clean white header with gradient accent bar, sticky nav with active link indicators, mobile hamburger menu, alerts as bell icon with badge
- **Explore Page**: Reorganized controls into logical groups, pill-shaped category toggles, toggle switch for world average, overflow-hidden chart container fixing event annotation bleed
- **TrendChart**: Switched to ComposedChart with area fills, custom tooltip/legend, shortened event labels (max 4), subtle grid lines, responsive heights
- **WorldMap**: Professional diverging color palette (blue-yellow-orange-red), color legend bar, cleaner tooltips, disabled scroll zoom, selected country glow effect
- **CategoryCards**: 5-column responsive grid, colored dot indicators, progress bars, clean empty states
- **CountryDetail**: Breadcrumb navigation, header card with region badge and quick stat pills, personal inflation card, category breakdown grid
- **Compare Page**: Color-coded country pickers (blue/emerald) with "vs" divider, summary comparison card, side-by-side stat cards
- **Home Page**: Hero with functional country search, stats banner, feature cards with icons, footer attribution
- **About Page**: Accented section headers, data sources table, styled methodology section, warning-icon limitations
- **Small Components**: Search with icon and clear button, rounded-full time pills, outlined view mode selector, professional modals with animations

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
