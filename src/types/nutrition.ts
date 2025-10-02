export interface SelectOption {
  unit: string
  products: {
    id: string
    defaultAmount: number
    volume: number
  }[]
}

export interface SelectData {
  selectedId: string
  selectOptions: SelectOption[]
}

export interface IngredientsData {
  calories: number
  carbohydrate: number
  protein: number
  fat: number
  phosphorus: number
  potassium: number
  sodium: number
  fiber: number
}

export interface ProductData {
  id: string
  name: string
  engName: string
  brand: string
  defaultAmount: number
  quantity: number | string
  checked: boolean
  select: SelectData
  ingredients: IngredientsData
  categories: string[]
}

export interface NutritionConfig {
  key: keyof IngredientsData
  label: string
  unit: string
  hasChart: boolean
  infoText?: string
}