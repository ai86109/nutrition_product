import { IngredientsData, ProductData } from "@/types";
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
  
  const ingredientsData = useMemo((): IngredientsData => {
    return listData.reduce((acc: IngredientsData, item: ProductData) => {
      if (!item.checked) return acc;
      
      const { ingredients } = item
      const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 0
      const ratio = calculateRatio(item)
      
      return {
        calories: acc.calories + (quantity * ratio * ingredients.calories),
        carbohydrate: acc.carbohydrate + (quantity * ratio * ingredients.carbohydrate),
        protein: acc.protein + (quantity * ratio * ingredients.protein),
        fat: acc.fat + (quantity * ratio * ingredients.fat),
        phosphorus: acc.phosphorus + (quantity * ratio * ingredients.phosphorus),
        potassium: acc.potassium + (quantity * ratio * ingredients.potassium),
        sodium: acc.sodium + (quantity * ratio * ingredients.sodium),
        fiber: acc.fiber + (quantity * ratio * ingredients.fiber),
      }
    }, {
      calories: 0,
      carbohydrate: 0,
      protein: 0,
      fat: 0,
      phosphorus: 0,
      potassium: 0,
      sodium: 0,
      fiber: 0,
    })
  }, [listData])

  return { ingredientsData };
}