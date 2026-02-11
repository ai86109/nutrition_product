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

export interface CoreNutrients {
  calories: number
  carbohydrates: number
  protein: number
  fat: number
  phosphorus: number
  potassium: number
  sodium: number
  dietary_fiber: number
}

export interface IngredientsData extends CoreNutrients {
  [key: string]: number | undefined
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

export interface DRISData {
  [key: string]: {
    age: {
      [key: number]: {
        [key: string]: number | number[] | { [key: string]: number }
      }
    },
    state?: {
      pregnancy?: {
        [key: string]: {
          [key: string]: number
        }
      },
      lactation?: {
        [key: string]: number
      }
    }
  }
}