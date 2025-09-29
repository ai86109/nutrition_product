import { useCallback, useMemo } from "react"
import { useNutritionCalculations } from "./useNutritionCalculations"
import { useBioInfo } from "@/contexts/BioInfoContext"

export function useNutritionChartData() {
  const { rounding } = useNutritionCalculations()
  const { tdee, proteinRange } = useBioInfo()
  
  const getPercentage = useCallback((value: number): number => {
    return rounding(value * 100, 1)
  }, [rounding])

  const validationState = useMemo(() => ({
    isTdeeValid: !isNaN(Number(tdee)) || Number(tdee) > 0,
    isProteinRangeValid: [proteinRange.min, proteinRange.max].every(val => Number(val) > 0)
  }), [tdee, proteinRange])

  const createChartData = useCallback((
    value: number,
    target: number,
    type: "calories" | "protein"
  ) => {
    if (value <= 0) return []

    const percentage = getPercentage(value / target)
    const displayBarPercentage = Math.min(percentage, 100)

    return [{
      label: type,
      percentage: displayBarPercentage,
      target: 100,
      text: `${percentage}%`
    }]
  }, [getPercentage])

  const getCaloriesChartData = useCallback((calories: number) => {
    if (!validationState.isTdeeValid) return []
    return createChartData(calories, Number(tdee), "calories")
  }, [createChartData, tdee, validationState.isTdeeValid])

  const getProteinChartData = useCallback((protein: number) => {
    if (!validationState.isProteinRangeValid) return []

    const minProteinRequirement = Math.min(Number(proteinRange.min), Number(proteinRange.max))
    return createChartData(protein, minProteinRequirement, "protein")
  }, [createChartData, proteinRange.max, proteinRange.min, validationState.isProteinRangeValid])

  return {
    ...validationState,
    getCaloriesChartData,
    getProteinChartData
  }
}