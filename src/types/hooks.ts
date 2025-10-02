export interface SearchState {
  searchValue: string
  selectedBrand: string
  selectedType: string
  selectedCate: string[]
}

export type SearchAction = 
  | { type: 'SET_FIELD'; field: keyof SearchState; value: string | string[] }
  | { type: 'RESET' }
  | { type: 'APPLY_SEARCH' }

export interface TDEEList {
  name: string
  activityFactor: string | number
  stressFactor: string | number
}

export interface ProteinList {
  id: number
  value: number | string
  checked: boolean
}

export interface CalorieFactorList {
  id: number
  value: number | string
  checked: boolean
}

export interface UserInput {
  selectedId: string
  quantity: number | string
  checked: boolean
}

export interface NutritionCalculationsReturn {
  bmi: number
  pbw: number
  ibw: number
  abw: number
  rounding: (value: number, digits?: number) => number
  calculateTDEE: (adjustedFactor: number) => number
  calculateProtein: (proteinFactor: number) => number
}
