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

export type TDEEFactors = {
  activityFactor: number
  stressFactor: number
}

export type ProteinFactors = {
  min: number
  max: number
}

type BioInfoContextType = {
  formData: FormData
  gender: Gender
  submittedValues: SubmittedValues
  tdeeFactors: TDEEFactors
  proteinFactors: ProteinFactors
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  setGender: React.Dispatch<React.SetStateAction<Gender>>
  setSubmittedValues: React.Dispatch<React.SetStateAction<SubmittedValues>>
  setTdeeFactors: React.Dispatch<React.SetStateAction<TDEEFactors>>
  setProteinFactors: React.Dispatch<React.SetStateAction<ProteinFactors>>
}

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
  const [tdeeFactors, setTdeeFactors] = useState<TDEEFactors>({
    activityFactor: 1,
    stressFactor: 1,
  })
  const [proteinFactors, setProteinFactors] = useState<ProteinFactors>({
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