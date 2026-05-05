"use client"

import { CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import ChartSection from "@/components/product-calculate/chart-section"
import { useBioInfo } from "@/contexts/BioInfoContext"
import { useProduct } from "@/contexts/ProductContext"
import BioSettings from "../product-calculate/bio-settings";
import MealCalculationSettings from "../product-calculate/meal-calculation-settings";
import ProductTable from "../product-calculate/product-table";
import { useProductCalculation } from "@/hooks/useProductCalculation";
import { useIngredientCalculation } from "@/hooks/product-calculate/useIngredientCalculation";
import { useMealCalculation } from "@/hooks/product-calculate/useMealCalculation";
import ConditionalContent from "@/components/conditional-content"
import SaveSnapshotButton from "@/components/patient-tracking/save-snapshot-button"


export default function ProductCalculateSection() {
  const { listData, setUserInputs } = useProductCalculation()
  const { loadingProductIds, productList } = useProduct()
  const { ingredientsData } = useIngredientCalculation(listData)
  const { mealsPerDay, isCalculateServings, setIsCalculateServings, handleMealsInputChange } = useMealCalculation()
  const { calorieRange } = useBioInfo();
  const calorieMin = Math.min(Number(calorieRange.min), Number(calorieRange.max))

  const isServingsCanBeUsed = calorieMin > 0 && listData.filter((item) => item.checked).length === 1
  const isShowServings = isCalculateServings && typeof mealsPerDay == 'number' && mealsPerDay > 0 && calorieMin > 0
  const hasAnyProduct = productList.length > 0

  return (
    <div className="flex flex-col items-center mt-4 p-2">
      {/* 手機版專屬：標題 + 儲存按鈕同一行 */}
      <div className="sm:hidden w-full flex justify-between items-center gap-4 px-6 mb-2">
        <h2 className="text-[20px] font-semibold">營養品成分計算</h2>
        {hasAnyProduct && (
          <SaveSnapshotButton
            listData={listData}
            isCalculateServings={isCalculateServings}
            mealsPerDay={mealsPerDay}
          />
        )}
      </div>

      <ConditionalContent
        condition={hasAnyProduct}
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
            <div className="flex justify-between items-start gap-4">
              <BioSettings />
              {/* 桌面版才顯示在 BioSettings 旁；手機版上面那一行已經渲染過 */}
              <div className="hidden sm:block">
                <SaveSnapshotButton
                  listData={listData}
                  isCalculateServings={isCalculateServings}
                  mealsPerDay={mealsPerDay}
                />
              </div>
            </div>
            <MealCalculationSettings
              isServingsCanBeUsed={isServingsCanBeUsed}
              isCalculateServings={isCalculateServings}
              mealsPerDay={mealsPerDay}
              setIsCalculateServings={setIsCalculateServings}
              handleMealsInputChange={handleMealsInputChange}
            />
            <Separator className="my-4" />

            {/* 正在載入的產品顯示 skeleton */}
            {loadingProductIds.size > 0 && (
              <div className="mb-3 space-y-2">
                {Array.from(loadingProductIds).map((id) => (
                  <div key={id} className="flex items-center gap-3 px-1">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 flex-1 rounded" />
                    <Skeleton className="h-8 w-20 rounded" />
                    <Skeleton className="h-8 w-24 rounded" />
                    <Skeleton className="h-8 w-12 rounded" />
                  </div>
                ))}
              </div>
            )}

            {listData.length > 0 && (
              <ProductTable
                listData={listData}
                isServingsCanBeUsed={isServingsCanBeUsed}
                isShowServings={isShowServings}
                mealsPerDay={mealsPerDay}
                setUserInputs={setUserInputs}
              />
            )}
          </CardContent>

          {listData.length > 0 && (
            <>
              <Separator className="my-4" />
              <ChartSection ingredientsData={ingredientsData} />
            </>
          )}
        </div>
      </ConditionalContent>
    </div>
  )
}
