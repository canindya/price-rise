import { useState, useCallback } from 'react';
import type { Category } from '../types/index';

/** Categories available for basket weighting. */
export const BASKET_CATEGORIES: { key: Category; label: string }[] = [
  { key: 'overall_cpi', label: 'Overall CPI' },
  { key: 'food_cpi', label: 'Food & Essentials' },
  { key: 'energy_benchmark', label: 'Energy (Oil)' },
  { key: 'energy_retail', label: 'Retail Energy' },
  { key: 'education_spend', label: 'Education' },
];

export type BasketWeights = Record<Category, number>;

const DEFAULT_WEIGHTS: BasketWeights = {
  overall_cpi: 25,
  food_cpi: 35,
  energy_benchmark: 15,
  energy_retail: 15,
  education_spend: 10,
};

const STORAGE_KEY = 'personal_basket_weights';

function loadWeights(): BasketWeights {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BasketWeights;
      // Validate: all keys present and sum roughly to 100
      const keys: Category[] = ['overall_cpi', 'food_cpi', 'energy_benchmark', 'energy_retail', 'education_spend'];
      const valid = keys.every((k) => typeof parsed[k] === 'number' && parsed[k] >= 0);
      if (valid) return parsed;
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_WEIGHTS };
}

function saveWeights(weights: BasketWeights): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
}

/**
 * Compute a weighted average inflation number.
 * `changes` maps each category to its % change; missing categories are skipped.
 */
export function calculatePersonalInflation(
  weights: BasketWeights,
  changes: Partial<Record<Category, number>>,
): number | null {
  let totalWeight = 0;
  let weighted = 0;

  for (const { key } of BASKET_CATEGORIES) {
    const w = weights[key];
    const change = changes[key];
    if (w > 0 && change != null) {
      totalWeight += w;
      weighted += w * change;
    }
  }

  if (totalWeight === 0) return null;
  return weighted / totalWeight;
}

interface UsePersonalBasketReturn {
  weights: BasketWeights;
  setWeight: (category: Category, value: number) => void;
  resetToDefault: () => void;
}

export function usePersonalBasket(): UsePersonalBasketReturn {
  const [weights, setWeights] = useState<BasketWeights>(loadWeights);

  const setWeight = useCallback((category: Category, value: number) => {
    setWeights((prev) => {
      const clamped = Math.max(0, Math.min(100, Math.round(value)));
      const oldValue = prev[category];
      const diff = clamped - oldValue;

      if (diff === 0) return prev;

      // Auto-adjust other categories proportionally so total stays at 100
      const otherKeys = BASKET_CATEGORIES.map((c) => c.key).filter((k) => k !== category);
      const otherTotal = otherKeys.reduce((s, k) => s + prev[k], 0);

      const next = { ...prev, [category]: clamped };

      if (otherTotal === 0) {
        // Distribute evenly among others
        const each = Math.floor((100 - clamped) / otherKeys.length);
        let remainder = 100 - clamped - each * otherKeys.length;
        for (const k of otherKeys) {
          next[k] = each + (remainder > 0 ? 1 : 0);
          if (remainder > 0) remainder--;
        }
      } else {
        // Proportional redistribution
        const newOtherTotal = 100 - clamped;
        let assigned = 0;
        for (let i = 0; i < otherKeys.length; i++) {
          const k = otherKeys[i];
          if (i === otherKeys.length - 1) {
            // Last one gets the remainder to avoid rounding errors
            next[k] = Math.max(0, newOtherTotal - assigned);
          } else {
            const proportion = prev[k] / otherTotal;
            const val = Math.max(0, Math.round(proportion * newOtherTotal));
            next[k] = val;
            assigned += val;
          }
        }
      }

      saveWeights(next);
      return next;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    const defaults = { ...DEFAULT_WEIGHTS };
    setWeights(defaults);
    saveWeights(defaults);
  }, []);

  return { weights, setWeight, resetToDefault };
}

export { DEFAULT_WEIGHTS };
