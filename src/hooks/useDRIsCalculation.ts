import { useMemo } from "react";
import { useBioInfo } from "@/contexts/BioInfoContext"
import { DRIS } from "@/utils/constants"

export function useDRIsCalculation(
  nutrient: string,
  nutrientValue: number,
  state: null | { type: 'pregnancy' | 'lactation', pregnancyState: number | null },
  caloriesValue?: number,
) {
  const { submittedValues } = useBioInfo()
  const { gender, age } = submittedValues

  const drisContent = useMemo(() => {
    const drisForNutrient = DRIS[nutrient]
    if (!drisForNutrient) return null

    let ageGroup = 0
    Object.keys(drisForNutrient.age).forEach(ageScope => {
      if (ageScope <= age) ageGroup = ageScope
    })

    const ageGroupData = drisForNutrient.age[ageGroup]
    if (!ageGroupData) return null

    return Object.keys(ageGroupData).map(item => {
      // amdr
      if (item === 'amdr') {
        return { item, value: ageGroupData?.[item] }
      }

      // 非 amdr
      let driValue = ageGroupData?.[item]?.[gender] || 0
      
      // 考慮懷孕、哺乳的情況
      if (state) {
        const stateDri = drisForNutrient.state?.[state.type]
        if (stateDri) {
          if (state.type === 'pregnancy' && state.pregnancyState) {
            const pregnancyDriValue = stateDri?.[state.pregnancyState]?.[item] ?? 0
            if (pregnancyDriValue > 0) {
              if (item === 'ul') driValue = Math.max(driValue, pregnancyDriValue)
              else driValue += pregnancyDriValue
            }
          } else if (state.type === 'lactation') {
            const lactationDriValue = stateDri?.[item] ?? 0
            if (lactationDriValue > 0) {
              if (item === 'ul') driValue = Math.max(driValue, lactationDriValue)
              else driValue += lactationDriValue
            }
          }
        }
      }

      const validValue = driValue % 1 === 0 ? driValue : Number(driValue.toFixed(1))

      return { item, value: validValue }
    })
  }, [nutrient, age, gender, state])

  const standardRange = useMemo(() => {
    if (!drisContent) return null

    let range = [0, 0]
    drisContent.forEach(({ item, value }) => {
      if (item === 'amdr') {
        if (Array.isArray(value) && value.length === 2) range = value
        else range = [0, value]
      }
      else if (item === 'ul' || item === 'cdrr') range[1] = value
      else range = [value, Infinity]
    })

    return range
  }, [drisContent])

  const calculatedValue = useMemo(() => {
    if (!drisContent) return nutrientValue

    const hasAMDR = drisContent.some(({ item }) => item === 'amdr')

    if (hasAMDR && caloriesValue && caloriesValue > 0) {
      return Number((nutrientValue * 9 / caloriesValue) * 100).toFixed(1)
    }

    return nutrientValue
  }, [nutrientValue, drisContent, caloriesValue])

  const markColor = useMemo(() => {
    if (!standardRange) return 'text-gray-400'
    const [min, max] = standardRange
    
    if (calculatedValue < min) return 'text-yellow-500'
    if (calculatedValue > max) return 'text-red-600'
    return 'text-green-600'
  }, [calculatedValue, standardRange])

  return {
    drisContent,
    standardRange,
    calculatedValue,
    markColor,
  }
}