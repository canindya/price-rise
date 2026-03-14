import type { IndiaEvent } from '../types/india';

/**
 * Major Indian economic events for chart annotations.
 * Monthly granularity for the spike timeline feature.
 */
export const INDIA_EVENTS: IndiaEvent[] = [
  { year: 2013, month: 8, label: 'Onion Price Crisis', subGroup: 'food_beverages' },
  { year: 2014, month: 10, label: 'Diesel Price Deregulation', subGroup: 'fuel_light' },
  { year: 2015, month: 1, label: 'LPG Subsidy Reform (DBTL)', subGroup: 'fuel_light' },
  { year: 2016, month: 7, label: '7th Pay Commission Implementation', subGroup: 'general' },
  { year: 2016, month: 11, label: 'Demonetisation', subGroup: 'general' },
  { year: 2017, month: 7, label: 'GST Rollout', subGroup: 'general' },
  { year: 2018, month: 9, label: 'Fuel Price Surge (Crude $85)', subGroup: 'fuel_light' },
  { year: 2019, month: 9, label: 'Onion Prices Hit Record', subGroup: 'food_beverages' },
  { year: 2020, month: 3, label: 'COVID-19 Lockdown', subGroup: 'general' },
  { year: 2020, month: 5, label: 'Fuel Excise Hike During Lockdown', subGroup: 'fuel_light' },
  { year: 2021, month: 5, label: 'COVID 2nd Wave / Oxygen Crisis', subGroup: 'health' },
  { year: 2021, month: 10, label: 'Edible Oil Price Surge', subGroup: 'food_beverages' },
  { year: 2022, month: 3, label: 'Ukraine War / Global Commodity Shock', subGroup: 'general' },
  { year: 2022, month: 6, label: 'Wheat Export Ban', subGroup: 'food_beverages' },
  { year: 2022, month: 11, label: 'Fuel Excise Cut', subGroup: 'fuel_light' },
  { year: 2023, month: 7, label: 'Tomato Price Spike (300%)', subGroup: 'food_beverages' },
  { year: 2024, month: 1, label: 'New CPI Base Year (2024=100)', subGroup: 'general' },
  { year: 2024, month: 7, label: 'Budget Education Allocation Increase', subGroup: 'education' },
];
