"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

type FormData = {
  height: string | number
  weight: string | number
  age: string | number
}

type SubmittedValues = {
  height: number
  weight: number
  age: number
  gender: string
}

type TDEEFactors = {
  activityFactor: number
  stressFactor: number
}

type ProteinFactors = {
  min: number
  max: number
}

type BioInfoContextType = {
  formData: FormData
  gender: string
  submittedValues: SubmittedValues
  tdeeFactors: TDEEFactors
  proteinFactors: ProteinFactors
  setFormData: (data: FormData) => void
  setGender: (gender: string) => void
  setSubmittedValues: (values: SubmittedValues) => void
  setTdeeFactors: (factors: TDEEFactors) => void
  setProteinFactors: (factors: ProteinFactors) => void
}

const BioInfoContext = createContext<BioInfoContextType | undefined>(undefined)

export function BioInfoProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    age: "",
  })
  const [gender, setGender] = useState("man")
  const [submittedValues, setSubmittedValues] = useState({
    height: 0,
    weight: 0,
    age: 0,
    gender: "man",
  })
  const [tdeeFactors, setTdeeFactors] = useState({
    activityFactor: 1,
    stressFactor: 1,
  })
  const [proteinFactors, setProteinFactors] = useState({
    min: 0.8,
    max: 1,
  })

  return (
    <BioInfoContext.Provider value={{
      formData,
      gender,
      submittedValues,
      tdeeFactors,
      proteinFactors,
      setFormData,
      setGender,
      setSubmittedValues,
      setTdeeFactors,
      setProteinFactors,
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