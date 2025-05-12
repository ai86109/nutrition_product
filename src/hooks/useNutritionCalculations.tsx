"use client"

import { useBioInfo } from "@/contexts/BioInfoContext"

export function useNutritionCalculations() {
  const { submittedValues, tdeeFactors, proteinFactors } = useBioInfo()

  const calculateBMI = () => {
    const { height, weight } = submittedValues
    if (height === 0 || weight === 0) return 0
    
    return (weight / ((height / 100) ** 2)).toFixed(2)
  }

  const calculateIdealWeight = () => {
    const { height } = submittedValues
    if (height === 0) return 0
    return Math.abs(Number((((height / 100) ** 2) * 22).toFixed(2))) || 0
  }

  const calculateTDEE = () => {
    const { height, weight, age, gender } = submittedValues
    const { activityFactor, stressFactor } = tdeeFactors
    if (height === 0 || weight === 0 || age === 0) return 0

    const idealWeight = calculateIdealWeight()
    const manBEE = 13.7 * idealWeight + 5 * height - 6.8 * age + 66
    const womanBEE = 9.6 * idealWeight + 1.8 * height - 4.7 * age + 655
    const BEE = gender === "man" ? manBEE : womanBEE
    const TDEE = BEE * activityFactor * stressFactor
    return Number(TDEE.toFixed(2))
  }

  const calculateProtein = () => {
    const idealWeight = calculateIdealWeight()
    const { min, max } = proteinFactors
    const minValue = Number(Math.min(min * idealWeight, max * idealWeight).toFixed(2))
    const maxValue = Number(Math.max(min * idealWeight, max * idealWeight).toFixed(2))

    return { minValue, maxValue }
  }

  const rounding = (value: number) => {
    if (value === 0) return 0
    return Math.round(value * 100) / 100
  }

  return { calculateBMI, calculateIdealWeight, calculateTDEE, calculateProtein, rounding }
}