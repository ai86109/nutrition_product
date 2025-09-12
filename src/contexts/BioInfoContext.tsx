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

export type CalorieType = {
  id: string
  label: string
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
  calorieTypeLists: CalorieType[]
  setCalorieTypeLists: React.Dispatch<React.SetStateAction<CalorieType[]>>
  tdee: number | string
  setTdee: React.Dispatch<React.SetStateAction<number | string>>
  proteinRange: ProteinRange
  setProteinRange: React.Dispatch<React.SetStateAction<ProteinRange>>
}

export const DEFAULT_CALORIE_TYPE_SETTINGS: CalorieType[] = [
  { id: 'PBW', label: 'PBW', checked: true },
  { id: 'IBW', label: 'IBW', checked: true },
  { id: 'ABW', label: 'ABW', checked: false },
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

  const [calorieTypeLists, setCalorieTypeLists] = useState<CalorieType[]>(DEFAULT_CALORIE_TYPE_SETTINGS)
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
      calorieTypeLists,
      setCalorieTypeLists,
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