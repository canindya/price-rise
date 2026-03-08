# Global Cost of Living Change Tracker — Project Specification

> **Purpose:** This document is a complete brief for Claude Code to build a web-based platform that shows how the cost of living has changed across countries and major cities over 1, 5, and 10-year periods — broken down by Fuel/Energy, Food/Essentials, and Education.

---

## 1. The Problem Statement

Most cost-of-living tools answer the question **"How expensive is City A vs City B right now?"**. Nobody answers the question **"How has the cost of living changed in the place I live over the past 5 years, broken down by what I actually spend money on?"**

This product fills that gap. It is a **time-series tracker**, not a point-in-time comparator.

---

## 2. Existing Solutions & Why This Is Different

| Tool | What it does | Gap |
|---|---|---|
| **Numbeo** | City-level cost snapshot + comparison | No time-series; API is paid; crowdsourced data quality varies |
| **Expatistan** | City-to-city snapshot comparison | No historical trends |
| **Mercer / EIU** | Enterprise cost of living surveys | Paid, not consumer-facing |
| **World Bank / Our World in Data** | Excellent macro data (CPI, food inflation) | Raw data, no visualization product |
| **Bankrate / SmartAsset** | US-focused relocation calculators | Not global, no time dimension |

**The gap:** No free, consumer-friendly, globally-scoped tool shows *change over time* by specific spending category. This is the product opportunity.

---

## 3. Key Design Decisions

### 3.1 Geographic Granularity: Country-Level First, City-Level Second

**Decision: Country-level is the primary unit. City-level is a Phase 2 enhancement.**

**Rationale:**
- All high-quality free data (World Bank, FAO, IMF) is country-level
- City-level historical data exists only for ~500 major cities (Numbeo, paid API)
- Coordinate-level data does **not exist** in any meaningful dataset — coordinates must be reverse-geocoded to a city, which still maps to city-level data anyway
- Country-level data covers 180+ countries; city-level covers a fraction of the world's population

**City-level plan:** In Phase 2, integrate Numbeo's paid API (or scrape-safe data sources) to overlay city-specific indices for major metros.

### 3.2 Base Rate / Indexing Method

**Decision: Use an indexed approach where the user's chosen start year = 100.**

This is cleaner than showing raw CPI values (which are meaningless to most users) and more universally relatable than USD values (which introduce exchange rate complexity).

Display: A line starting at 100 in Year X. A value of 142 means "42% more expensive than in Year X."

**Also offer:**
- Toggle to local currency view (actual price levels where available)
- Toggle to USD-adjusted view (for cross-country comparison / expat use cases)
- PPP-adjusted view in Phase 2 (for "real" purchasing power comparison)

### 3.3 Time Periods

Offer three preset windows: **1 year, 5 years, 10 years**, plus a custom date range slider. The underlying data supports going back to 2000 (FAO) and 1960 (World Bank CPI) for most countries.

---

## 4. Data Sources — Complete Map

### 4.1 Overall Cost of Living (CPI)

| Source | API? | Free? | Coverage | Frequency | Indicator |
|---|---|---|---|---|---|
| **World Bank WDI** | Yes, REST | Yes | 200+ countries | Annual | `FP.CPI.TOTL` (CPI index, 2010=100) |
| **World Bank WDI** | Yes, REST | Yes | 200+ countries | Annual | `FP.CPI.TOTL.ZG` (CPI % change YoY) |
| **IMF IFS** | Yes, REST | Yes | 190+ countries | Monthly/Annual | CPI by component |
| **FAOSTAT** | Yes, REST | Yes | 245 countries | Monthly from 2000 | Food CPI |

**Primary recommendation: World Bank API** — clean REST endpoints, no auth required, JSON output, 200+ countries, back to 1960.

API example:
```
https://api.worldbank.org/v2/country/IN/indicator/FP.CPI.TOTL?format=json&date=2014:2024&per_page=50
```

### 4.2 Fuel & Energy

| Source | API? | Free? | Coverage | Notes |
|---|---|---|---|---|
| **Global Petrol Prices** | Yes (paid) | No — trial only | 135 countries, since 2005 | Best historical weekly fuel price data globally |
| **World Bank Commodity Prices** | Yes, REST | Yes | Global commodity basket | Crude oil price (Brent/WTI), not pump price |
| **IEA (International Energy Agency)** | CSV downloads | Free for select | OECD countries | Electricity/gas retail prices, annual |
| **Our World in Data (IEA-sourced)** | CSV | Free | ~100 countries | Electricity prices per kWh |
| **EIA (US Energy Info Admin)** | Yes, REST | Yes | US + international | US retail gas + global oil benchmark |

**Recommendation:** Use two-layer approach:
- **Crude oil / energy benchmark** → World Bank Commodity API (free, global proxy)
- **Retail pump prices** → Global Petrol Prices (budget for API key, ~$30-50/month) OR use Our World in Data CSVs bundled as static data

**Important caveat:** Fuel prices are heavily subsidy-dependent. Saudi Arabia, Iran, and Venezuela have government-controlled prices that don't reflect market costs. Add a "fuel subsidy flag" indicator where relevant.

### 4.3 Food & Essentials

| Source | API? | Free? | Coverage | Notes |
|---|---|---|---|---|
| **FAO Food Price Index (FFPI)** | Yes, REST | Yes | Global (international basket) | Monthly from 1990, 5 commodity groups |
| **FAOSTAT Consumer Price (Food CPI)** | Yes, REST | Yes | 245 countries | Monthly from 2000, country-level food inflation |
| **World Bank Food CPI** | Yes, REST | Yes | 200+ countries | Annual food inflation `FP.CPI.TOTL` sub-components |
| **WFP VAM** | Yes | Free | 70+ developing countries | Sub-national food basket prices |

**Recommendation:** FAOSTAT Food CPI for country-level domestic food inflation. FAO FFPI for global benchmark to contextualize ("India's food prices rose 12%, vs the global food price index which rose 8%").

FAOSTAT API example:
```
https://fenixservices.fao.org/faostat/api/v1/en/data/CP?area=100&element=11&year=2020,2021,2022,2023,2024
```

### 4.4 Education

**This is the hardest category. Be upfront about its limitations.**

| Source | API? | Free? | Coverage | Notes |
|---|---|---|---|---|
| **UNESCO Institute for Statistics** | Yes, REST | Yes | 200+ countries | Government expenditure on education (% of GDP, % of govt budget) — not cost to household |
| **OECD Education at a Glance** | CSV | Free | 38 OECD countries only | Tuition fees, household education expenditure |
| **World Bank EdStats** | Yes, REST | Yes | Global | Government education spend |
| **Numbeo (Education)** | Paid API | No | ~500 cities | Private school fees per year, city-level |

**Honest gap:** There is **no free global dataset of education costs to households** (tuition, school fees, books, etc.) that is comprehensive and historical. What exists:
- Government *spending* on education (proxy: system quality investment)
- OECD tuition fee data (rich countries only)
- Numbeo city data (paid)

**Recommendation for MVP:** Show "Government expenditure on education as % of GDP" as a proxy, with a clear label: "Higher = government invests more, generally associated with lower household burden." Flag OECD country tuition data where available. In Phase 2, integrate Numbeo for private school costs in major cities.

---

## 5. Data Availability Reality Check

| Category | Free Global Data? | Historical Depth | Granularity |
|---|---|---|---|
| Overall CPI | ✅ Yes (World Bank) | 1960–present | Country |
| Food CPI | ✅ Yes (FAOSTAT) | 2000–present | Country |
| Energy (crude benchmark) | ✅ Yes (World Bank Commodities) | 1960–present | Global only |
| Energy (retail pump price) | ⚠️ Partial (Our World in Data CSVs) | 2000–present | Country (static) |
| Electricity price | ⚠️ Partial (IEA, OECD-heavy) | 2010–present | Country (limited) |
| Education (govt spend) | ✅ Yes (UNESCO) | 1970–present | Country |
| Education (household cost) | ❌ No free global source | N/A | N/A (OECD only) |
| City-level any category | ⚠️ Numbeo (paid) | 2010–present | City |

---

## 6. Proposed Architecture

### 6.1 Tech Stack

```
Frontend:        React + TypeScript
Styling:         Tailwind CSS
Charts:          Recharts (line charts, area charts, bar charts)
Map:             Leaflet.js + react-leaflet (choropleth world map)
Data layer:      Static JSON bundles for MVP + optional API fetch layer
Hosting:         Vercel or Netlify (free tier, static export)
Build:           Vite
```

### 6.2 Data Pipeline (Two-Stage Approach)

**Stage 1 — Pre-fetch & Bundle (for MVP)**

Write a Node.js/Python data fetch script that:
1. Pulls data from World Bank API, FAOSTAT API, UNESCO API
2. Processes and normalizes into a unified JSON schema
3. Stores as static JSON files in `/public/data/`
4. This script runs manually (or via GitHub Actions on a schedule) to refresh data

Benefit: Zero runtime API dependency, instant page loads, no API rate limits.

**Stage 2 — Live API Layer (Phase 2)**

A lightweight backend (Node/Express or Python/FastAPI) on Vercel serverless that:
- Proxies World Bank / FAOSTAT API with caching
- Adds Numbeo city data (paid key stored server-side)

### 6.3 Unified Data Schema

All data normalized to this structure before storage:

```json
{
  "country_code": "IN",
  "country_name": "India",
  "region": "South Asia",
  "series": {
    "overall_cpi": [
      { "year": 2014, "value": 100, "indexed": 100 },
      { "year": 2015, "value": 104.9, "indexed": 104.9 },
      ...
    ],
    "food_cpi": [...],
    "energy_benchmark": [...],
    "education_spend_pct_gdp": [...]
  },
  "metadata": {
    "cpi_source": "World Bank WDI FP.CPI.TOTL",
    "base_year": 2014,
    "last_updated": "2024-12-01",
    "data_gaps": ["electricity_retail_price"]
  }
}
```

---

## 7. Application Structure & Features

### 7.1 Pages / Views

```
/                 → Landing page (hero + explanation)
/explore          → Main interactive dashboard
/country/:code    → Country detail page (all categories, full history)
/compare          → Side-by-side country comparison (Phase 2)
/about            → Methodology and data sources
```

### 7.2 Main Dashboard (`/explore`) — Feature Spec

**Controls panel:**
- Country / region search box (autocomplete)
- Time period selector: 1Y | 5Y | 10Y | Custom
- Category toggle: Overall | Food | Energy | Education | All
- View mode: Indexed (base=100) | % Change | Local Currency

**Visualization panel:**

1. **World Choropleth Map** — Color-coded by overall CPI change % for the selected period. Click a country to load its detail. Darker = higher inflation.

2. **Line Chart (Primary)** — Selected country/countries over selected time period, lines per category. Hover tooltip shows exact indexed value and year-on-year change.

3. **Category Breakdown Cards** — For the selected country and period:
   - Overall CPI: X% change
   - Food: X% change
   - Energy (benchmark): X% change
   - Education investment: X% change

4. **Global Benchmark Line** — Toggle to show world average on the same chart ("Your country vs. world average")

5. **Event Annotations** — Major events overlaid on the chart (e.g., "COVID-19 pandemic", "Ukraine conflict / food price spike", "2008 financial crisis") to give context to spikes.

### 7.3 Country Detail Page

- Full time-series for all categories, 1960–present where available
- Summary box: "Over the last 10 years, the overall cost of living in [Country] rose by X%. Food costs rose by Y%, which was [above/below] the global average of Z%."
- Data source attribution with links
- Download data as CSV button

---

## 8. Development Phases

### Phase 1 — MVP (Build First)

**Scope:**
- Country-level only
- 3 data categories: Overall CPI, Food CPI, Energy (crude benchmark as proxy)
- World Bank + FAOSTAT data only (both free, REST APIs)
- Static pre-fetched JSON data bundle for ~80 major countries
- Time periods: 1Y, 5Y, 10Y
- Choropleth map + line chart
- Indexed view (base year = 100) only

**Deliverable:** A working, deployable single-page React app.

### Phase 2 — Expanded Data

**Scope:**
- Add retail electricity/petrol prices (Our World in Data CSVs or Global Petrol Prices API)
- Add education category (UNESCO + OECD)
- Add city-level data for top 100 cities (Numbeo paid API)
- Add country comparison mode (2 countries on same chart)
- Add PPP-adjusted view
- Expand to all 180+ countries

### Phase 3 — Personalization & Depth

**Scope:**
- User location detection (IP-based or browser geolocation → nearest country/city)
- "My basket" — let users weight categories by their actual spending
- Alert/subscription: "Notify me when food inflation in [country] exceeds X%"
- Substack/blog integration for contextual commentary
- Mobile-first PWA

---

## 9. Challenges & Mitigations

### 9.1 Data Consistency Across Countries

**Problem:** Different countries use different base years for CPI. Some use 2010=100, others use 2000=100.

**Mitigation:** Re-index all data to a common base year at processing time (2015 recommended — middle of most data ranges). The fetch script handles this normalization before JSON storage.

### 9.2 Missing Data for Developing Countries

**Problem:** Low-income countries often have gaps, especially in food CPI and education data.

**Mitigation:** Display a "data quality indicator" per country (e.g., Green = complete, Yellow = partial, Red = estimated/sparse). Never show a percentage change if the base year is missing — show "Insufficient data" instead.

### 9.3 Fuel Prices Are Politically Distorted

**Problem:** Pump prices in heavily subsidized countries (Saudi Arabia, Iran, Venezuela, India to some extent) don't reflect economic cost.

**Mitigation:** Use crude oil benchmark (Brent) as the global energy cost indicator. For retail prices, add a "subsidy note" flag. Consider showing "effective market price" vs "subsidized retail price" in Phase 2.

### 9.4 Education Data Doesn't Measure Household Cost

**Problem:** Available free data measures government spending, not what families pay.

**Mitigation:** Be explicit in the UI. Label this metric "Government Education Investment (% of GDP)" — not "Education Cost." Add a tooltip explaining the limitation. Supplement with OECD tuition data where available. Add a disclaimer in the methodology page.

### 9.5 Currency and Exchange Rate Effects

**Problem:** When a country's currency devalues sharply (e.g., Argentina, Turkey), local CPI looks moderate but USD-denominated purchasing power collapses.

**Mitigation:** Offer three views: (1) Indexed local (removes currency effect — pure domestic inflation), (2) USD-adjusted (shows expat/import purchasing power), (3) PPP-adjusted (Phase 2 — best "real" comparison). The default is indexed local, which is most universally honest.

### 9.6 API Rate Limits & Reliability

**Problem:** World Bank API can be slow; FAOSTAT has occasional downtime.

**Mitigation:** Pre-fetch and bundle all data as static JSON (Phase 1 approach). The live app never calls external APIs at runtime. Refresh data monthly via a scheduled script.

### 9.7 Numbeo ToS for City Data

**Problem:** Scraping Numbeo violates their Terms of Service.

**Mitigation:** Use only their official paid API if/when city-level data is needed. Do not scrape. Alternative: WFP VAM data for developing country city-level food prices (free, UN-licensed).

---

## 10. Data Fetch Script — Pseudocode

```python
# data_pipeline/fetch.py
# Run: python fetch.py --output ./public/data

import requests
import json

WORLD_BANK_BASE = "https://api.worldbank.org/v2"
FAOSTAT_BASE = "https://fenixservices.fao.org/faostat/api/v1/en/data"

INDICATORS = {
    "overall_cpi": "FP.CPI.TOTL",          # CPI index 2010=100
    "food_cpi_change": "FP.CPI.TOTL.ZG",    # CPI annual % change
    "education_pct_gdp": "SE.XPD.TOTL.GD.ZS"  # Education spend % GDP
}

def fetch_world_bank(country_code, indicator, start_year=2000, end_year=2024):
    url = f"{WORLD_BANK_BASE}/country/{country_code}/indicator/{indicator}"
    params = {"format": "json", "date": f"{start_year}:{end_year}", "per_page": "100"}
    response = requests.get(url, params=params)
    return response.json()

def fetch_faostat_food_cpi(area_code, start_year=2000, end_year=2024):
    # Element 11 = Consumer Price Index (Food)
    url = f"{FAOSTAT_BASE}/CP"
    params = {"area": area_code, "element": "11",
              "year": ",".join(str(y) for y in range(start_year, end_year+1)),
              "output_type": "json"}
    response = requests.get(url, params=params)
    return response.json()

def normalize_to_index(series, base_year):
    """Re-index any series so that base_year = 100"""
    base_value = next((d["value"] for d in series if d["year"] == base_year), None)
    if not base_value:
        return series  # Can't normalize without base year
    return [{"year": d["year"], "value": d["value"],
             "indexed": round((d["value"] / base_value) * 100, 2)} for d in series]

# Main loop: fetch all countries, normalize, save as JSON
```

---

## 11. World Bank API — Key Indicator Reference

| Category | Indicator Code | Description |
|---|---|---|
| Overall inflation | `FP.CPI.TOTL` | CPI index (2010=100), 200+ countries, from 1960 |
| Overall inflation % | `FP.CPI.TOTL.ZG` | Annual CPI % change |
| Food inflation % | `FP.CPI.TOTL.ZG` (sub-filtered) | Use FAOSTAT CP for dedicated food CPI |
| Education spending | `SE.XPD.TOTL.GD.ZS` | Education expenditure % of GDP |
| Education spending | `SE.XPD.TOTL.GB.ZS` | Education expenditure % of govt budget |
| Energy intensity | `EG.USE.COMM.GD.PP.KD` | Energy use per GDP (proxy for energy cost burden) |

API base: `https://api.worldbank.org/v2/country/{iso2code}/indicator/{indicator}?format=json`

No API key required. Rate limit: ~1000 calls/day per IP (generous for a batch script).

---

## 12. FAOSTAT API — Key Domains

| Domain Code | Description | Use case |
|---|---|---|
| `CP` | Consumer Price Indices | Food CPI by country, monthly from 2000 |
| `PP` | Producer Prices | Farm-gate prices |
| `FFPI` | FAO Food Price Index | Global food commodity basket (cereals, oils, dairy, meat, sugar) |

API base: `https://fenixservices.fao.org/faostat/api/v1/en/data/{domain}`

Free, no auth required.

---

## 13. UNESCO API — Education Data

API base: `https://api.uis.unesco.org/api/public/data/indicators`

Key indicator: `XGDP.FSGOV` — Government expenditure on education as % of GDP

Free with registration (API key, free tier).

---

## 14. Suggested File Structure for Claude Code

```
cost-of-living-tracker/
├── public/
│   └── data/
│       ├── countries.json          # Country list with ISO codes, regions
│       ├── world_cpi.json          # Pre-fetched World Bank CPI data
│       ├── food_cpi.json           # Pre-fetched FAOSTAT food CPI
│       ├── energy_benchmark.json   # Crude oil + electricity (static)
│       └── education_spend.json    # UNESCO govt education spend
├── src/
│   ├── components/
│   │   ├── WorldMap.tsx            # Leaflet choropleth
│   │   ├── TrendChart.tsx          # Recharts line chart
│   │   ├── CategoryCards.tsx       # Summary metric cards
│   │   ├── CountrySearch.tsx       # Autocomplete country selector
│   │   ├── TimeRangeSelector.tsx   # 1Y/5Y/10Y/Custom toggle
│   │   └── EventAnnotations.tsx    # Historical event overlays
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Explore.tsx             # Main dashboard
│   │   ├── CountryDetail.tsx
│   │   └── About.tsx               # Methodology
│   ├── hooks/
│   │   ├── useCountryData.ts       # Data loading + normalization
│   │   └── useIndexedSeries.ts     # Re-indexing utility
│   ├── utils/
│   │   ├── dataTransforms.ts       # Normalize, reindex, gap-fill
│   │   └── countryCodeMap.ts       # ISO2 ↔ ISO3 ↔ display name
│   └── types/
│       └── index.ts                # TypeScript interfaces
├── scripts/
│   ├── fetch_world_bank.py         # Data pipeline script
│   ├── fetch_faostat.py
│   └── build_data_bundle.py        # Merges all sources into unified JSON
├── package.json
├── vite.config.ts
└── README.md
```

---

## 15. MVP Build Sequence for Claude Code

Execute in this order:

1. **Data pipeline first** — Run `scripts/fetch_world_bank.py` and `scripts/fetch_faostat.py` to generate the JSON data bundles. Validate data coverage for top 80 countries.

2. **Data types and transforms** — Build `types/index.ts` and `utils/dataTransforms.ts` with normalization logic (re-indexing, gap detection, year filtering).

3. **Core chart component** — Build `TrendChart.tsx` with Recharts. Test with hardcoded data before wiring to real data.

4. **World map component** — Build `WorldMap.tsx` with Leaflet. Choropleth coloring based on 10-year CPI change. Click-to-select country.

5. **Country search + time controls** — `CountrySearch.tsx` and `TimeRangeSelector.tsx`.

6. **Wire together in Explore page** — Connect all components with shared state.

7. **Category cards** — Summary cards showing % change per category for selected country + period.

8. **Country detail page** — Full history, all categories, CSV download.

9. **About / Methodology page** — Data sources, limitations, base year explanation.

10. **Deploy to Vercel** — Connect GitHub repo, auto-deploy on push.

---

## 16. Open Questions to Resolve Before Build Starts

1. **Domain/branding:** What is the name of the product? This affects the app title, `<head>` metadata, and About page.

2. **Fuel approach:** Use crude oil benchmark (free, globally available) as the energy proxy for MVP, or budget for Global Petrol Prices API (~$40/month) for actual pump prices? Crude is a reasonable proxy for economic cost; pump prices better reflect consumer experience.

3. **Initial country scope for MVP:** All ~180 countries where World Bank has data, or a curated list of ~80 major economies? Full coverage is achievable with the free APIs.

4. **Education decision:** Show government education spend as a proxy (clearly labeled), or skip education in MVP and add in Phase 2 when better data can be sourced?

5. **Annotation events:** Provide a curated list of ~15 major global economic events to annotate on the charts (COVID-19, 2022 food price crisis, 2008 financial crisis, 1997 Asian crisis, etc.)?

---

## 17. Appendix: Notable Limitations to Surface to Users

These should be clearly stated in the app's Methodology page:

- **CPI measures average household inflation.** High-income and low-income households within the same country may experience very different cost changes (food is a larger share of poor household budgets).
- **Country-level data masks regional variation.** Mumbai and rural Bihar have wildly different cost trajectories.
- **Education data reflects government investment, not out-of-pocket household cost** — which is what actually matters for families.
- **Fuel data (crude benchmark) reflects global commodity markets, not what you pay at the pump** — which is heavily shaped by domestic taxes and subsidies.
- **Data for some low-income countries has gaps.** Where data is missing, the chart clearly marks it rather than interpolating.
- **Currency-adjusted views require exchange rate data**, which introduces its own volatility. The indexed local view removes this noise and is the most honest measure of domestic purchasing power change.

---

*Document version: 1.0 | March 2026*
*Prepared for: Claude Code development session*
