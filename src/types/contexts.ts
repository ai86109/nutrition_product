import type { ApiProductData } from './api'

export interface FormData {
  height: string | number
  weight: string | number
  age: string | number
}

export type Gender = "man" | "woman"

export interface SubmittedValues {
  height: number
  weight: number
  age: number
  gender: Gender
}

export interface CalorieType {
  id: string
  label: string
  checked: boolean
}

export interface ProteinRange {
  min: number | string
  max: number | string
}

export interface BrandOption {
  id: string
  name: string
}

export interface BioInfoContextType {
  formData: FormData
  gender: Gender
  submittedValues: SubmittedValues
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  setGender: React.Dispatch<React.SetStateAction<Gender>>
  setSubmittedValues: React.Dispatch<React.SetStateAction<SubmittedValues>>
  calorieTypeLists: CalorieType[]
  setCalorieTypeLists: React.Dispatch<React.SetStateAction<CalorieType[]>>
  tdee: number | string
  setTdee: React.Dispatch<React.SetStateAction<number | string>>
  proteinRange: ProteinRange
  setProteinRange: React.Dispatch<React.SetStateAction<ProteinRange>>
}

export interface ProductContextType {
  allProducts: ApiProductData[]
  productList: string[]
  setProductList: React.Dispatch<React.SetStateAction<string[]>> 
  brandOptions: BrandOption[]
}