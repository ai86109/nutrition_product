import { useBioInfo } from "@/contexts/BioInfoContext"
import { useBioInfoCalculations } from "@/hooks/useBioInfoCalculations"
import { IngredientsData } from "@/types"
import { Fragment, useMemo, useState } from "react"
import {
  NUTRIENTS_GROUP,
  MACRO_NUTRIENTS,
  MACRO_MINERALS,
  TRACE_MINERALS,
  VITAMINS,
} from "@/utils/constants"
import { Switch } from "@/components/ui/switch"
import { WomanStateSelector } from "@/components/product-calculate/chart/woman-state-selector"
import { CalorieHeroCard } from "./calorie-hero-card"
import { ProteinHeroCard } from "./protein-hero-card"
import { NutrientRow } from "./nutrient-row"

export function NutritionTable({
  ingredientsData,
}: {
  ingredientsData: IngredientsData
}) {
  const { rounding } = useBioInfoCalculations()
  const { submittedValues } = useBioInfo()
  const { gender, age } = submittedValues

  const [isShowDetail, setIsShowDetail] = useState(false)
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

  const {
    macroNutrientsList,
    macroMineralsList,
    traceMineralsList,
    vitaminsList,
    otherNutrientsList,
  } = useMemo(() => {
    const validKeys = Object.keys(ingredientsData).filter(key => {
      const value = ingredientsData[key]
      return value !== undefined && value >= 0
    })

    const othersList = validKeys.filter(
      key =>
        !MACRO_NUTRIENTS.includes(key) &&
        !MACRO_MINERALS.includes(key) &&
        !TRACE_MINERALS.includes(key) &&
        !VITAMINS.includes(key),
    )

    return {
      macroNutrientsList: MACRO_NUTRIENTS.filter(key => validKeys.includes(key)),
      macroMineralsList: MACRO_MINERALS.filter(key => validKeys.includes(key)),
      traceMineralsList: TRACE_MINERALS.filter(key => validKeys.includes(key)),
      vitaminsList: VITAMINS.filter(key => validKeys.includes(key)),
      otherNutrientsList: othersList.sort(),
    }
  }, [ingredientsData])

  const orderedGroups = useMemo(() => {
    // 熱量、蛋白質改由 hero card 呈現，這裡的 list 不再顯示這兩列
    const macroNutrientsListWithoutHero = macroNutrientsList.filter(
      key => key !== "calories" && key !== "protein",
    )
    const groups = [
      { key: "macroNutrients", items: macroNutrientsListWithoutHero },
      { key: "macroMinerals", items: macroMineralsList },
      { key: "traceMinerals", items: traceMineralsList },
      { key: "vitamins", items: vitaminsList },
      { key: "others", items: otherNutrientsList },
    ]

    return groups.filter(group => group.items.length > 0)
  }, [
    macroNutrientsList,
    macroMineralsList,
    traceMineralsList,
    vitaminsList,
    otherNutrientsList,
  ])

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

  const simpleList = useMemo(
    () =>
      macroNutrientsList.filter(
        key => key !== "calories" && key !== "protein",
      ),
    [macroNutrientsList],
  )

  return (
    <div className="flex flex-col space-y-4 w-full max-w-[400px]">
      <div className="flex items-center space-x-2 font-medium text-sm">
        <Switch
          checked={isShowDetail}
          onCheckedChange={setIsShowDetail}
          className="cursor-pointer"
        />
        <span>顯示全部營養素</span>
      </div>

      {isShowWomanStateOptions && (
        <WomanStateSelector
          womanState={womanState}
          pregnancyState={pregnancyState}
          handleWomanStateToggle={handleWomanStateToggle}
          setPregnancyState={setPregnancyState}
        />
      )}

      {macroNutrientsList.includes("calories") && (
        <CalorieHeroCard value={caloriesValue} state={state} />
      )}

      {macroNutrientsList.includes("protein") && (
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
  )
}
