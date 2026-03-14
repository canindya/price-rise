export interface MonthlyDataPoint {
  year: number;
  month: number; // 1-12
  value: number | null;
  indexed: number | null; // base period = 100
}

export type MospiSubGroup =
  | 'general'
  | 'food_beverages'
  | 'fuel_light'
  | 'clothing'
  | 'education'
  | 'health'
  | 'housing'
  | 'miscellaneous';

export type MospiCoverage = 'all_india' | 'rural' | 'urban';

export interface MospiCPIFile {
  baseYear: number;
  lastUpdated: string;
  source: string;
  coverage: Record<MospiCoverage, Record<MospiSubGroup, MonthlyDataPoint[]>>;
}

export interface HCESWeightsFile {
  source: string;
  surveyYear: string;
  weights: Record<MospiSubGroup, number>;
  ruralWeights: Record<MospiSubGroup, number>;
  urbanWeights: Record<MospiSubGroup, number>;
}

export interface IndiaEvent {
  year: number;
  month: number;
  label: string;
  subGroup: MospiSubGroup | 'general';
}

export const MOSPI_SUBGROUP_LABELS: Record<MospiSubGroup, string> = {
  general: 'General CPI',
  food_beverages: 'Food & Beverages',
  fuel_light: 'Fuel & Light',
  clothing: 'Clothing & Footwear',
  education: 'Education',
  health: 'Health',
  housing: 'Housing',
  miscellaneous: 'Miscellaneous',
};

export const MOSPI_SUBGROUP_COLORS: Record<MospiSubGroup, string> = {
  general: 'var(--color-cpi)',
  food_beverages: 'var(--color-food)',
  fuel_light: 'var(--color-energy)',
  clothing: 'var(--color-retail)',
  education: 'var(--color-education)',
  health: 'var(--color-india-health)',
  housing: 'var(--color-india-housing)',
  miscellaneous: 'var(--color-india-misc)',
};
