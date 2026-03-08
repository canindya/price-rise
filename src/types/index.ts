export interface DataPoint {
  year: number;
  value: number | null;
  indexed: number | null;
}

export interface CountrySeries {
  countryCode: string;
  countryName: string;
  region: string;
  dataPoints: DataPoint[];
}

export interface CategoryDataFile {
  baseYear: number;
  lastUpdated: string;
  source: string;
  countries: Record<string, DataPoint[]>;
}

export interface CountryMeta {
  code: string;
  name: string;
  iso3: string;
  region: string;
}

export type TimeRange = '1Y' | '5Y' | '10Y' | 'custom';
export type Category = 'overall_cpi' | 'food_cpi' | 'energy_benchmark' | 'energy_retail' | 'education_spend';
export type ViewMode = 'indexed' | 'pct_change' | 'local_currency' | 'ppp_adjusted';

export interface PPPFactorsFile {
  countries: Record<string, { year: number; value: number }[]>;
}

export interface EventAnnotation {
  year: number;
  label: string;
  category: Category | 'all';
}

export interface AppState {
  selectedCountry: string | null;
  timeRange: TimeRange;
  customRange?: { startYear: number; endYear: number };
  activeCategories: Category[];
  viewMode: ViewMode;
}

export type AppAction =
  | { type: 'SELECT_COUNTRY'; payload: string | null }
  | { type: 'SET_TIME_RANGE'; payload: TimeRange }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'TOGGLE_CATEGORY'; payload: Category }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_CUSTOM_RANGE'; payload: { startYear: number; endYear: number } };
