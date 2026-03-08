import { createContext, useContext, useReducer } from 'react';
import type { Dispatch, ReactNode } from 'react';
import type { AppState, AppAction } from '../types/index';

const DEFAULT_STATE: AppState = {
  selectedCountry: null,
  timeRange: '10Y',
  activeCategories: ['overall_cpi', 'food_cpi', 'energy_benchmark', 'energy_retail', 'education_spend'],
  viewMode: 'indexed',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_COUNTRY':
      return { ...state, selectedCountry: action.payload };

    case 'SET_TIME_RANGE':
      return { ...state, timeRange: action.payload };

    case 'SET_CATEGORIES':
      return { ...state, activeCategories: action.payload };

    case 'TOGGLE_CATEGORY': {
      const category = action.payload;
      const current = state.activeCategories;
      const exists = current.includes(category);
      // Prevent removing the last active category
      if (exists && current.length === 1) {
        return state;
      }
      const next = exists
        ? current.filter((c) => c !== category)
        : [...current, category];
      return { ...state, activeCategories: next };
    }

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'SET_CUSTOM_RANGE':
      return {
        ...state,
        timeRange: 'custom' as const,
        customRange: action.payload,
      };
  }
}

const AppStateContext = createContext<AppState | null>(null);
const AppDispatchContext = createContext<Dispatch<AppAction> | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, DEFAULT_STATE);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

/**
 * Returns the current AppState. Must be used within an AppProvider.
 */
export function useAppState(): AppState {
  const state = useContext(AppStateContext);
  if (state === null) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return state;
}

/**
 * Returns the dispatch function for AppActions. Must be used within an AppProvider.
 */
export function useAppDispatch(): Dispatch<AppAction> {
  const dispatch = useContext(AppDispatchContext);
  if (dispatch === null) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return dispatch;
}
