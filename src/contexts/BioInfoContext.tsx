"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type FormData = {
  height: string | number
  weight: string | number
  age: string | number
}

export type Gender = "man" | "woman"

type SubmittedValues = {
  height: number
  weight: number
  age: number
  gender: Gender
}

export type CalorieFactorList = {
  id: number
  value: number | string
  checked: boolean
}

export type CalorieType = {
  id: string
  label: string
  checked: boolean
}

export type TDEEList = {
  name: string
  activityFactor: string | number
  stressFactor: string | number
}

export type ProteinList = {
  id: number
  value: number | string
  checked: boolean
}

export type ProteinRange = {
  min: number | string
  max: number | string
}

type BioInfoContextType = {
  formData: FormData
  gender: Gender
  submittedValues: SubmittedValues
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  setGender: React.Dispatch<React.SetStateAction<Gender>>
  setSubmittedValues: React.Dispatch<React.SetStateAction<SubmittedValues>>
  calorieFactorLists: CalorieFactorList[]
  setCalorieFactorLists: React.Dispatch<React.SetStateAction<CalorieFactorList[]>>
  calorieTypeLists: CalorieType[]
  setCalorieTypeLists: React.Dispatch<React.SetStateAction<CalorieType[]>>
  tdeeList: TDEEList[]
  setTDEEList: React.Dispatch<React.SetStateAction<TDEEList[]>>
  proteinList: ProteinList[]
  setProteinList: React.Dispatch<React.SetStateAction<ProteinList[]>>
  tdee: number | string
  setTdee: React.Dispatch<React.SetStateAction<number | string>>
  proteinRange: ProteinRange
  setProteinRange: React.Dispatch<React.SetStateAction<ProteinRange>>
}

export const DEFAULT_TDEE_SETTINGS = [
  {
    name: '預設',
    activityFactor: 1.2,
    stressFactor: 1.2,
  }
]

export const DEFAULT_CALORIE_SETTINGS: CalorieFactorList[] = [
  { id: 1, value: 25, checked: true },
  { id: 2, value: 30, checked: true },
  { id: 3, value: 35, checked: true },
]

export const DEFAULT_CALORIE_TYPE_SETTINGS: CalorieType[] = [
  { id: 'PBW', label: 'PBW', checked: true },
  { id: 'IBW', label: 'IBW', checked: true },
  { id: 'ABW', label: 'ABW', checked: false },
]

export const DEFAULT_PROTEIN_SETTINGS: ProteinList[] = [
  { id: 1, value: 0.6, checked: true },
  { id: 2, value: 0.8, checked: true },
  { id: 3, value: 1.0, checked: true },
  { id: 4, value: 1.2, checked: true },
  { id: 5, value: 1.5, checked: true },
  { id: 6, value: 2.0, checked: true },
]

const BioInfoContext = createContext<BioInfoContextType | undefined>(undefined)

export function BioInfoProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData>({
    height: "" as string,
    weight: "" as string,
    age: "" as string,
  })
  const [gender, setGender] = useState<Gender>("man")
  const [submittedValues, setSubmittedValues] = useState<SubmittedValues>({
    height: 0,
    weight: 0,
    age: 0,
    gender: "man",
  })

  const [calorieFactorLists, setCalorieFactorLists] = useState<CalorieFactorList[]>(DEFAULT_CALORIE_SETTINGS)
  const [calorieTypeLists, setCalorieTypeLists] = useState<CalorieType[]>(DEFAULT_CALORIE_TYPE_SETTINGS)
  const [tdeeList, setTDEEList] = useState<TDEEList[]>(DEFAULT_TDEE_SETTINGS)
  const [proteinList, setProteinList] = useState<ProteinList[]>(DEFAULT_PROTEIN_SETTINGS)
  const [tdee, setTdee] = useState<number | string>("")
  const [proteinRange, setProteinRange] = useState<ProteinRange>({
    min: "",
    max: "",
  })

  return (
    <BioInfoContext.Provider value={{
      formData,
      gender,
      submittedValues,
      setFormData,
      setGender,
      setSubmittedValues,
      calorieFactorLists,
      setCalorieFactorLists,
      calorieTypeLists,
      setCalorieTypeLists,
      tdeeList,
      setTDEEList,
      proteinList,
      setProteinList,
      tdee,
      setTdee,
      proteinRange,
      setProteinRange,
    }}>
      {children}
    </BioInfoContext.Provider>
  )
}

export function useBioInfo() {
  const context = useContext(BioInfoContext)
  if (context === undefined) {
    throw new Error('useNutrition must be used within a BioInfoProvider')
  }
  return context
}