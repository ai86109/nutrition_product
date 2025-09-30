"use client"

import { CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useProductContext } from "@/contexts/ProductContext"
import ChartSection from "@/components/product-calculate/chart-section"
import { useBioInfo } from "@/contexts/BioInfoContext"
import BioSettings from "../product-calculate/bio-settings";
import MealCalculationSettings from "../product-calculate/meal-calculation-settings";
import ProductTable from "../product-calculate/product-table";
import { useProductCalculation } from "@/hooks/useProductCalculation";
import { useIngredientCalculation } from "@/hooks/useIngredientCalaculation";
import { useMealCalculation } from "@/hooks/useMealCalculation";
import ConditionalContent from "../bio-result/conditional-content"


export default function ProductCalculateSection() {
  const { allProducts } = useProductContext()
  const { listData, setUserInputs } = useProductCalculation(allProducts)
  const { ingredientsData } = useIngredientCalculation(listData)
  const { mealsPerDay, isCalculateServings, handleMealsCheck, handleMealsInputChange } = useMealCalculation()
  const { tdee } = useBioInfo();
    
  const isServingsCanBeUsed = Number(tdee) > 0 && listData.filter((item) => item.checked).length === 1
  const isShowServings = isCalculateServings && typeof mealsPerDay == 'number' && mealsPerDay > 0 && Number(tdee) > 0

  return (
    <div className="flex flex-col items-center mt-4 p-2">
      <ConditionalContent
        condition={listData.length > 0}
        fallback={
          <p className="text-sm">
            請先至少
            <span className="font-bold">
              選擇一樣營養品
            </span>
            以得到其營養成分
          </p>
        }
      >
        <div className="w-full">
          <CardContent>
            <BioSettings />
            <MealCalculationSettings
              isServingsCanBeUsed={isServingsCanBeUsed}
              isCalculateServings={isCalculateServings}
              mealsPerDay={mealsPerDay}
              handleMealsCheck={handleMealsCheck}
              handleMealsInputChange={handleMealsInputChange}
            />
            <Separator className="my-4" />

            <ProductTable 
              listData={listData}
              isServingsCanBeUsed={isServingsCanBeUsed}
              isShowServings={isShowServings}
              mealsPerDay={mealsPerDay}
              setUserInputs={setUserInputs}
            />
          </CardContent>

          <Separator className="my-4" />

          <ChartSection ingredientsData={ingredientsData} />
        </div>
      </ConditionalContent>
    </div>
  )
}
