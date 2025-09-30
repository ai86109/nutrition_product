"use client"

import { useBioInfo } from "@/contexts/BioInfoContext"
import { useCallback, useMemo } from "react"

const rounding = (value: number, digits: number = 2): number => {
  if (!isFinite(value) || isNaN(value)) return 0

  const validDigits = Math.max(0, Math.floor(digits))
  const multiplier = Math.pow(10, validDigits)
  return Math.round(value * multiplier) / multiplier
}

type NutritionCalculationsReturn = {
  bmi: number
  pbw: number
  ibw: number
  abw: number
  calculateTDEE: (adjustedFactor: number) => number
  calculateProtein: (proteinFactor: number) => number
  rounding: (value: number, digits?: number) => number
}

export function useNutritionCalculations(): NutritionCalculationsReturn {
  const { submittedValues } = useBioInfo()

  const bmi = useMemo((): number => {
    const { height, weight } = submittedValues
    if (!height || !weight || height <= 0 || weight <= 0) return 0

    const bmi = weight / ((height / 100) ** 2)

    if (!isFinite(bmi) || isNaN(bmi)) return 0
    return rounding(bmi, 1)
  }, [rounding, submittedValues.weight, submittedValues.height])

  const ibw = useMemo((): number => {
    const { height } = submittedValues
    if (!height || height <= 0) return 0

    const idealWeight = (height / 100) ** 2 * 22
    if (!isFinite(idealWeight) || isNaN(idealWeight)) return 0
    return rounding(idealWeight, 0)
  }, [rounding, submittedValues.height])

  const pbw = useMemo((): number => {
    const { weight } = submittedValues
    if (!weight || weight <= 0) return 0

    return rounding(weight, 0)
  }, [rounding, submittedValues.weight])

  const abw = useMemo((): number => {
    if (ibw <= 0 || pbw <= 0) return 0

    return rounding(ibw + 0.25 * (pbw - ibw), 0)
  }, [rounding, ibw, pbw])

  // 沒有體重感覺也可以算
  const calculateTDEE = useCallback((adjustedFactor: number): number => {
    if (!adjustedFactor || adjustedFactor <= 0) return 0
    const { height, weight, age, gender } = submittedValues
    if (!height || !weight || !age || height <= 0 || weight <= 0 || age <= 0) return 0

    if (pbw <= 0) return 0

    const manBEE = 13.7 * pbw + 5 * height - 6.8 * age + 66
    const womanBEE = 9.6 * pbw + 1.8 * height - 4.7 * age + 655
    const BEE = gender === "man" ? manBEE : womanBEE
    const TDEE = BEE * adjustedFactor

    if (!isFinite(TDEE) || isNaN(TDEE)) return 0
    return rounding(TDEE, 0)
  }, [rounding, submittedValues, pbw])

  const calculateProtein = useCallback((proteinFactor: number): number => {
    const idealWeight = ibw
    if (idealWeight <= 0) return 0
    if (proteinFactor <= 0) return 0

    return rounding(proteinFactor * idealWeight, 1)
  }, [rounding, ibw])

  return { 
    bmi,
    pbw,
    ibw,
    abw,
    calculateTDEE,
    calculateProtein,
    rounding
  }
}