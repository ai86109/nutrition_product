export type SelectOption = {
  unit: string
  products: {
    id: string
    defaultAmount: number
    volume: number
  }[]
}

export type SelectData = {
  selectedId: string
  selectOptions: SelectOption[]
}

export type IngredientsData = {
  calories: number
  carbohydrate: number
  protein: number
  fat: number
  phosphorus: number
  potassium: number
  sodium: number
  fiber: number
}

export type ProductData = {
  id: string
  name: string
  engName: string
  brand: string
  defaultAmount: number
  quantity: number
  checked: boolean
  select: SelectData
  ingredients: IngredientsData
  categories: string[]
}