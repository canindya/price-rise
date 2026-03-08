# CLAUDE.md

## Project Overview

Global Cost of Living Change Tracker — a time-series web app showing how cost of living has changed across 193 countries over 1, 5, and 10-year periods, broken down by category.

## Tech Stack

- **Frontend**: React 19 + TypeScript, Vite
- **Styling**: Tailwind CSS v4 (via @tailwindcss/vite plugin) + inline styles for dark theme
- **Charts**: Recharts (ComposedChart with Line, no Area to avoid duplicate tooltips)
- **Map**: Leaflet + react-leaflet (choropleth world map)
- **Routing**: react-router-dom v7
- **Data**: Static JSON bundles in `public/data/`, pre-fetched via Node.js scripts
- **State**: React Context + useReducer (no Redux)

## Design System

Dark editorial aesthetic inspired by Anthropic's frontend aesthetics cookbook.

- **Palette**: `#0c0f14` (bg), `#141820` (cards), `#1a1f2e` (elevated), `rgba(255,255,255,0.06)` (borders)
- **Text**: `#e8eaed` (primary), `#8b95a5` (secondary), `#555e6e` (muted)
- **Fonts**: Crimson Pro (serif headings), DM Sans (body), JetBrains Mono (numbers/data)
- **Accent**: `#4ade80` (green primary), `#60a5fa` (blue), `#fbbf24` (amber), `#fb923c` (orange), `#c084fc` (purple)
- **Category colors**: CPI `#60a5fa`, Food `#4ade80`, Energy `#fbbf24`, Retail `#fb923c`, Education `#c084fc`
- **CSS utilities**: `.glass-card`, `.mesh-bg`, `.glow-green`, `.animate-fade-up`, `.delay-1` through `.delay-5`, `.toggle-switch`
- **CSS custom properties**: Defined in `src/index.css` under `:root`

## Commands

- `npm run dev` — Start dev server
- `npm run build` — TypeScript check + Vite production build
- `npm run preview` — Preview production build
- `npm run lint` — ESLint
- `npm run fetch-data` — Run data pipeline (`npx tsx scripts/build-all.ts`) to refresh all JSON data from APIs

## Project Structure

```
src/
  index.css               — Design system: CSS variables, fonts, animations, utilities
  types/index.ts          — All TypeScript interfaces (DataPoint, Category, AppState, etc.)
  context/AppContext.tsx   — React context with reducer for app state
  hooks/
    useCountryData.ts     — Loads JSON data, re-keys energy_retail ISO-2→ISO-3,
                            expands energy_benchmark WORLD to all countries
    usePersonalBasket.ts  — My Basket weights (localStorage)
    useUserLocation.ts    — IP geolocation auto-detect
  utils/
    dataTransforms.ts     — filterByTimeRange, reindexSeries, calculateChange, transformForViewMode, getDataQuality
    countryCodeMap.ts     — 193 countries with ISO-2/ISO-3 mappings
    events.ts             — 14 global economic event annotations
  components/
    Layout.tsx            — App shell: dark nav header, gradient accent bar, alert bell, mobile hamburger
    WorldMap.tsx           — Leaflet choropleth with dark tiles, color legend, click-to-select
    TrendChart.tsx         — Recharts ComposedChart (lines only, custom tooltip/legend, max 3 events)
    ComparisonChart.tsx    — Dual-country overlay chart (blue=A, red=B)
    CategoryCards.tsx      — 5-column summary stat cards per category with colored left borders
    CountrySearch.tsx      — Autocomplete with keyboard nav, dark styled
    TimeRangeSelector.tsx  — 1Y/5Y/10Y/Custom pills with green active state
    ViewModeSelector.tsx   — Indexed/% YoY/Local/PPP toggles
    DataQualityBadge.tsx   — Colored dot indicator (green/amber/red)
    MyBasket.tsx           — Weighted personal inflation modal
    AlertSetup.tsx         — Threshold alert modal
  pages/
    Home.tsx              — Landing page with mesh-bg hero, animated search, feature cards
    Explore.tsx           — Main dashboard (map + chart + controls + category cards)
    CountryDetail.tsx     — Full country history, CSV download, category breakdown
    Compare.tsx           — Side-by-side country comparison with dual search
    About.tsx             — Methodology, data sources table, limitations

scripts/                  — Data pipeline (TypeScript, run with tsx)
  country-list.ts         — 193 countries with ISO/FAOSTAT codes
  fetch-world-bank.ts     — CPI data (FP.CPI.TOTL)
  fetch-faostat.ts        — Food CPI (with retry + World Bank fallback)
  fetch-energy.ts         — Brent crude benchmark (global, single WORLD key)
  fetch-energy-retail.ts  — Retail gasoline prices (41 countries, static, ISO-2 codes)
  fetch-education.ts      — Education spend % GDP (SE.XPD.TOTL.GD.ZS)
  fetch-ppp.ts            — PPP conversion factors (PA.NUS.PPP)
  fetch-geojson.ts        — World boundaries from world-atlas TopoJSON
  build-all.ts            — Master orchestrator

public/data/              — Pre-fetched static JSON (DO NOT edit manually)
```

## Key Types

```typescript
type Category = 'overall_cpi' | 'food_cpi' | 'energy_benchmark' | 'energy_retail' | 'education_spend';
type TimeRange = '1Y' | '5Y' | '10Y' | 'custom';
type ViewMode = 'indexed' | 'pct_change' | 'local_currency' | 'ppp_adjusted';
```

## Data Flow

1. JSON files loaded once by `useCountryData` hook on app mount
2. On load: energy_retail countries re-keyed from ISO-2 to ISO-3; energy_benchmark WORLD series copied to all country codes
3. `AppContext` holds selected country, time range, active categories, view mode
4. Components read from context and call hook accessors (`getCountrySeries`, `getAllCountriesChange`)
5. Data transforms applied: filter by time range → transform for view mode → render

## Conventions

- Use `import type` for type-only imports (verbatimModuleSyntax is enabled)
- Dark theme via inline styles + CSS custom properties — no Tailwind color utility classes for theme colors
- Country codes flow as ISO-3 strings through the app
- All data files indexed to base year 2015 = 100
- No `any` types — use `unknown` with type narrowing (eslint-disable for Recharts callback props)
- Components are default exports, hooks/utils are named exports
- Charts use custom tooltip/legend components (not Recharts built-in Legend) to avoid duplicates

## Data Sources (all free, no auth required)

- **World Bank WDI API**: CPI (191 countries), education spend (79), PPP factors (190)
- **FAOSTAT API**: Food CPI (48 countries, unreliable — has World Bank fallback)
- **Static data**: Energy retail prices (41 countries, ISO-2 codes), Brent crude benchmark (global)
- **world-atlas npm package**: Country boundaries GeoJSON (177 features)

## Known Issues & Gotchas

- FAOSTAT API frequently returns 521 errors — the pipeline has 3-retry logic and falls back to World Bank food price index
- `energy_retail.json` uses ISO-2 codes (`US`, `GB`) — `useCountryData` re-keys to ISO-3 at runtime
- `energy_benchmark.json` has only a `"WORLD"` key — `useCountryData` expands it to all country codes at runtime
- The `public/data/` files are generated artifacts — refresh with `npm run fetch-data`
- Leaflet CSS must be imported in WorldMap.tsx (`import 'leaflet/dist/leaflet.css'`)
- GeoJSON properties vary: check `ISO_A3`, `iso_a3`, `ADM0_A3` variants
- Education data is government spending (% GDP), NOT household cost — always label clearly
- CSS `@import url(...)` warning in build is cosmetic (after `@import "tailwindcss"`) — not a real issue
- Recharts Area elements cause duplicate tooltip/legend entries — use Line only
