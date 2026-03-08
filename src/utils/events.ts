import type { EventAnnotation } from '../types/index';

/**
 * Major global economic events for chart annotations.
 */
export const GLOBAL_EVENTS: EventAnnotation[] = [
  { year: 2008, label: '2008 Financial Crisis', category: 'all' },
  { year: 2010, label: 'European Debt Crisis', category: 'all' },
  { year: 2011, label: 'Arab Spring', category: 'food_cpi' },
  { year: 2012, label: 'Eurozone Crisis Peak', category: 'all' },
  { year: 2014, label: 'Oil Price Collapse', category: 'energy_benchmark' },
  { year: 2015, label: 'China Stock Market Crash', category: 'all' },
  { year: 2016, label: 'Brexit Referendum', category: 'all' },
  { year: 2018, label: 'US-China Trade War Begins', category: 'all' },
  { year: 2020, label: 'COVID-19 Pandemic', category: 'all' },
  { year: 2021, label: 'Global Supply Chain Crisis', category: 'all' },
  { year: 2022, label: 'Ukraine Conflict / Food & Energy Crisis', category: 'all' },
  { year: 2023, label: 'US/European Banking Crisis', category: 'all' },
  { year: 2024, label: 'Red Sea Shipping Disruption', category: 'energy_benchmark' },
  { year: 2025, label: 'Global Trade Tariff Escalation', category: 'all' },
];
