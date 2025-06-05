"use client"

import { useBioInfo } from "@/contexts/BioInfoContext"

type ProteinCalculationResult = {
  minValue: number
  maxValue: number
}

type NutritionCalculationsReturn = {
  calculateBMI: () => number | string
  calculateIdealWeight: () => number
  calculateTDEE: () => number
  calculateProtein: () => ProteinCalculationResult
  rounding: (value: number) => number
}

export function useNutritionCalculations(): NutritionCalculationsReturn {
  const { submittedValues, tdeeFactors, proteinFactors } = useBioInfo()

  const calculateBMI = (): number | string => {
    const { height, weight } = submittedValues
    if (!height || !weight || height <= 0 || weight <= 0) return "--"

    const bmi = weight / ((height / 100) ** 2)

    if (!isFinite(bmi) || isNaN(bmi)) return "--"
    return rounding(bmi)
  }

  const calculateIdealWeight = (): number => {
    const { height } = submittedValues
    if (!height || height <= 0) return 0

    const idealWeight = (height / 100) ** 2 * 22
    if (!isFinite(idealWeight) || isNaN(idealWeight)) return 0
    return rounding(idealWeight)
  }

  const calculateTDEE = (): number => {
    const { height, weight, age, gender } = submittedValues
    const { activityFactor, stressFactor } = tdeeFactors
    if (!height || !weight || !age || height <= 0 || weight <= 0 || age <= 0) return 0

    const idealWeight = calculateIdealWeight()
    if (typeof idealWeight !== "number" || idealWeight <= 0) return 0

    const manBEE = 13.7 * idealWeight + 5 * height - 6.8 * age + 66
    const womanBEE = 9.6 * idealWeight + 1.8 * height - 4.7 * age + 655
    const BEE = gender === "man" ? manBEE : womanBEE
    const TDEE = BEE * activityFactor * stressFactor

    if (!isFinite(TDEE) || isNaN(TDEE)) return 0
    return rounding(TDEE)
  }

  const calculateProtein = (): ProteinCalculationResult => {
    const idealWeight = calculateIdealWeight()
    const { min, max } = proteinFactors
    if (typeof idealWeight !== "number" || idealWeight <= 0 || !min || !max || min <= 0 || max <= 0) return { minValue: 0, maxValue: 0 }

    const minValue = rounding(Math.min(min * idealWeight, max * idealWeight))
    const maxValue = rounding(Math.max(min * idealWeight, max * idealWeight))

    return { minValue, maxValue }
  }

  const rounding = (value: number): number => {
    if (!isFinite(value) || isNaN(value)) return 0
    return Math.round(value * 100) / 100
  }

  return { calculateBMI, calculateIdealWeight, calculateTDEE, calculateProtein, rounding }
}