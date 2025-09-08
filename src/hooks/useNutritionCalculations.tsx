"use client"

import { useBioInfo } from "@/contexts/BioInfoContext"

type ProteinCalculationResult = {
  minValue: number
  maxValue: number
}

type NutritionCalculationsReturn = {
  calculateBMI: () => number
  calculatePBW: () => number
  calculateIBW: () => number
  calculateABW: () => number
  calculateTDEE: (adjustedFactor: number) => number
  calculateProtein: (proteinFactor: number) => number
  rounding: (value: number, digits?: number) => number
}

export function useNutritionCalculations(): NutritionCalculationsReturn {
  const { submittedValues, proteinFactors } = useBioInfo()

  const calculateBMI = (): number => {
    const { height, weight } = submittedValues
    if (!height || !weight || height <= 0 || weight <= 0) return 0

    const bmi = weight / ((height / 100) ** 2)

    if (!isFinite(bmi) || isNaN(bmi)) return 0
    return rounding(bmi, 1)
  }

  const calculateIBW = (): number => {
    const { height } = submittedValues
    if (!height || height <= 0) return 0

    const idealWeight = (height / 100) ** 2 * 22
    if (!isFinite(idealWeight) || isNaN(idealWeight)) return 0
    return rounding(idealWeight, 0)
  }

  const calculatePBW = (): number => {
    const { weight } = submittedValues
    if (!weight || weight <= 0) return 0

    return rounding(weight, 0)
  }

  const calculateABW = (): number => {
    const IBW = calculateIBW()
    const PBW = calculatePBW()
    if (IBW <= 0 || PBW <= 0) return 0

    return rounding(IBW + 0.25 * (PBW - IBW), 0)
  }

  // 沒有體重感覺也可以算
  const calculateTDEE = (adjustedFactor: number): number => {
    if (!adjustedFactor || adjustedFactor <= 0) return 0
    const { height, weight, age, gender } = submittedValues
    if (!height || !weight || !age || height <= 0 || weight <= 0 || age <= 0) return 0

    const idealWeight = calculateIBW()
    if (idealWeight <= 0) return 0

    const manBEE = 13.7 * idealWeight + 5 * height - 6.8 * age + 66
    const womanBEE = 9.6 * idealWeight + 1.8 * height - 4.7 * age + 655
    const BEE = gender === "man" ? manBEE : womanBEE
    const TDEE = BEE * adjustedFactor

    if (!isFinite(TDEE) || isNaN(TDEE)) return 0
    return rounding(TDEE, 0)
  }

  const calculateProtein = (proteinFactor: number): number => {
    const idealWeight = calculateIBW()
    if (idealWeight <= 0) return 0

    return rounding(proteinFactor * idealWeight, 1)
  }

  const rounding = (value: number, digits: number = 2): number => {
    if (!isFinite(value) || isNaN(value)) return 0

    const validDigits = Math.max(0, Math.floor(digits))
    const multiplier = Math.pow(10, validDigits)
    return Math.round(value * multiplier) / multiplier
  }

  return { 
    calculateBMI,
    calculatePBW,
    calculateIBW,
    calculateABW,
    calculateTDEE,
    calculateProtein,
    rounding
  }
}