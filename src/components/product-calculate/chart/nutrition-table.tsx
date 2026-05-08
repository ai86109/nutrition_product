import { useBioInfo } from "@/contexts/BioInfoContext"
import { useBioInfoCalculations } from "@/hooks/useBioInfoCalculations"
import { IngredientsData } from "@/types"
import { Fragment, useMemo, useState } from "react"
import { NUTRIENTS_GROUP } from "@/utils/constants"
import {
  getValidNutrientKeys,
  groupNutrientsByCategory,
} from "@/utils/nutrition-groups"
import { Switch } from "@/components/ui/switch"
import { WomanStateSelector } from "@/components/product-calculate/chart/woman-state-selector"
import { CalorieHeroCard } from "./calorie-hero-card"
import { ProteinHeroCard } from "./protein-hero-card"
import { NutrientRow } from "./nutrient-row"
import { ReportTrigger } from "@/components/dialogs/product-detail-dialog/report-trigger"
import ProductReportDialog from "@/components/dialogs/product-report-dialog"

export function NutritionTable({
  ingredientsData,
  productId,
  productName,
}: {
  ingredientsData: IngredientsData
  productId?: string
  productName?: string
}) {
  const { rounding } = useBioInfoCalculations()
  const { submittedValues } = useBioInfo()
  const { gender, age } = submittedValues

  const [isShowDetail, setIsShowDetail] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const isSingleProduct = !!productId && !!productName
  const [womanState, setWomanState] = useState<
    "none" | "pregnancy" | "lactation"
  >("none")
  const [pregnancyState, setPregnancyState] = useState("state1")

  const isShowWomanStateOptions = gender === "woman" && age > 0

  const state = useMemo(() => {
    if (!isShowWomanStateOptions) return null
    if (womanState === "none") return null
    return {
      type: womanState,
      pregnancyState: womanState === "pregnancy" ? pregnancyState : null,
    }
  }, [isShowWomanStateOptions, womanState, pregnancyState])

  const validKeys = useMemo(
    () => getValidNutrientKeys(ingredientsData),
    [ingredientsData],
  )

  const baseGroups = useMemo(
    () => groupNutrientsByCategory(validKeys),
    [validKeys],
  )

  const hasCalories = validKeys.includes("calories")
  const hasProtein = validKeys.includes("protein")

  // 熱量、蛋白質改由 hero card 呈現，這裡的 macroNutrients 群組要把它們濾掉
  const orderedGroups = useMemo(() => {
    return baseGroups
      .map(g =>
        g.key === "macroNutrients"
          ? {
              ...g,
              items: g.items.filter(
                k => k !== "calories" && k !== "protein",
              ),
            }
          : g,
      )
      .filter(g => g.items.length > 0)
  }, [baseGroups])

  const handleWomanStateToggle = (state: "pregnancy" | "lactation") => {
    setWomanState(prev => (prev === state ? "none" : state))
  }

  const caloriesValue = useMemo(
    () => rounding(ingredientsData["calories"] || 0),
    [ingredientsData, rounding],
  )
  const proteinValue = useMemo(
    () => rounding(Number(ingredientsData["protein"] || 0)),
    [ingredientsData, rounding],
  )

  // 精簡模式只顯示巨量營養素（同樣去掉 calories/protein，那兩個由 hero card 呈現）
  const simpleList = useMemo(
    () =>
      baseGroups
        .find(g => g.key === "macroNutrients")
        ?.items.filter(k => k !== "calories" && k !== "protein") ?? [],
    [baseGroups],
  )

  return (
    <>
    <div className="flex flex-col space-y-4 w-full max-w-[400px]">
      <div className="flex items-center space-x-2 font-medium text-sm">
        <Switch
          checked={isShowDetail}
          onCheckedChange={setIsShowDetail}
          className="cursor-pointer"
        />
        <span>顯示全部營養素</span>
        {isSingleProduct && (
          <ReportTrigger
            onClick={() => setReportOpen(true)}
            className="ml-2"
          />
        )}
      </div>

      {isShowWomanStateOptions && (
        <WomanStateSelector
          womanState={womanState}
          pregnancyState={pregnancyState}
          handleWomanStateToggle={handleWomanStateToggle}
          setPregnancyState={setPregnancyState}
        />
      )}

      {hasCalories && (
        <CalorieHeroCard value={caloriesValue} state={state} />
      )}

      {hasProtein && (
        <ProteinHeroCard value={proteinValue} state={state} />
      )}

      {isShowDetail ? (
        <div className="flex flex-col">
          {orderedGroups.map(group => (
            <Fragment key={group.key}>
              <p className="font-bold mt-3 mb-1 text-amber-800">
                {NUTRIENTS_GROUP[group.key]}
              </p>
              <div className="flex flex-col divide-y divide-border">
                {group.items.map(key => (
                  <NutrientRow
                    key={key}
                    nutrient={key}
                    value={rounding(Number(ingredientsData[key]))}
                    state={state}
                    caloriesValue={caloriesValue}
                  />
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      ) : (
        simpleList.length > 0 && (
          <div className="flex flex-col divide-y divide-border">
            {simpleList.map(key => (
              <NutrientRow
                key={key}
                nutrient={key}
                value={rounding(Number(ingredientsData[key]))}
                state={state}
                caloriesValue={caloriesValue}
              />
            ))}
          </div>
        )
      )}
    </div>
    {isSingleProduct && (
      <ProductReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        productId={productId}
        productName={productName}
      />
    )}
    </>
  )
}
