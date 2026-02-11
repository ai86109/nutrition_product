import { IngredientsData, ProductData, CoreNutrients } from "@/types";
import { CORE_NUTRIENTS } from "@/utils/constants"
import { useMemo } from "react";

export function useIngredientCalculation(listData: ProductData[]) {
  const calculateRatio = (item: ProductData) => {
    const { selectedId, selectOptions } = item.select
    const currentAmount = selectOptions.map((type) => {
      const { products } = type
      return products.find((product) => selectedId === product.id)?.volume || null
    }).filter((item) => item !== null)
    const ratio = currentAmount[0] / item.defaultAmount

    if (!isFinite(ratio) || isNaN(ratio)) {
      console.warn(`Invalid ratio for product ${item.name} (ID: ${item.id}):`, ratio)
      return 0
    }
    return ratio
  }

  const getAllNutrientKeys = (data) => {
    const keysSet = new Set<string>()

    CORE_NUTRIENTS.forEach(nutrient => keysSet.add(nutrient))

    data.forEach(item => {
      if (item.ingredients) {
        Object.keys(item.ingredients).forEach(key => keysSet.add(key))
      }
    })

    return Array.from(keysSet)
  }
  
  const ingredientsData = useMemo((): IngredientsData => {
    const allNutrientKeys = getAllNutrientKeys(listData)

    const initialData: CoreNutrients = CORE_NUTRIENTS.reduce((acc, nutrient) => {
      acc[nutrient] = 0
      return acc
    }, {} as CoreNutrients)

    return listData.reduce((acc: IngredientsData, item: ProductData) => {
      if (!item.checked) return acc;
      
      const { ingredients } = item
      const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 0
      const ratio = calculateRatio(item)

      allNutrientKeys.forEach((key) => {
        const value = ingredients[key] || 0
        const calculatedValue = quantity * ratio * value

        if (isFinite(calculatedValue) && !isNaN(calculatedValue)) {
          acc[key] = (acc[key] || 0) + calculatedValue
        }
      })

      return acc
    }, initialData)
  }, [listData])

  return { ingredientsData };
}