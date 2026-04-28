import { useMemo } from "react"
import { useBioInfo } from "@/contexts/BioInfoContext"
import { CALC_UNIT_MAPPINGS } from "@/utils/constants"
import type { ProductData } from "@/types"
import type {
  PatientSnapshotInput,
  SnapshotSelectedProduct,
} from "@/types/patient"

interface UseCurrentSnapshotArgs {
  listData: ProductData[]
  isCalculateServings: boolean
  mealsPerDay: number | string
}

/**
 * 把當前的 section state 收集成 PatientSnapshotInput，給儲存 dialog 當預設值。
 *
 * 注意：因為 useProductCalculation / useMealCalculation 是在 ProductCalculateSection
 * 內部 call 的（local state，不是 context），這裡不能自己 call 它們，必須用 props 傳入。
 *
 * patient_id 留空字串 — 由 dialog 在使用者選 / 建立病人後再填。
 */
export function useCurrentSnapshot({
  listData,
  isCalculateServings,
  mealsPerDay,
}: UseCurrentSnapshotArgs): Omit<PatientSnapshotInput, "patient_id"> {
  const { formData, gender, tdee, proteinRange } = useBioInfo()

  return useMemo(() => {
    // 從每筆勾選的 listData 萃出 serving 資訊
    const selectedProducts: SnapshotSelectedProduct[] = listData
      .filter((item) => item.checked)
      .map((item) => {
        const { selectedId, selectOptions } = item.select

        // 找到選中的 option
        const matchedOption = selectOptions.find((opt) =>
          opt.products.some((p) => p.id === selectedId)
        )
        const matchedProduct = matchedOption?.products.find(
          (p) => p.id === selectedId
        )

        const unit = matchedOption?.unit ?? ""
        const defaultAmount = matchedProduct?.defaultAmount ?? 0
        const volume = matchedProduct?.volume ?? 0
        const servingAmount = defaultAmount * volume
        const servingUnit = CALC_UNIT_MAPPINGS[unit] ?? ""

        const quantityNum =
          typeof item.quantity === "number"
            ? item.quantity
            : Number(item.quantity) || 0

        return {
          product_id: item.id,
          name_zh: item.name,
          name_en: item.engName,
          brand: item.brand,
          serving_label: `${defaultAmount}${unit}`,
          serving_amount: servingAmount,
          serving_unit: servingUnit,
          quantity: quantityNum,
        }
      })

    const heightNum = Number(formData.height) || null
    const weightNum = Number(formData.weight) || null
    const ageNum = Number(formData.age) || null

    const calorieNum =
      tdee === "" || tdee === null || tdee === undefined
        ? null
        : Number(tdee)

    const proteinMin =
      proteinRange.min === "" ? null : Number(proteinRange.min)
    const proteinMax =
      proteinRange.max === "" ? null : Number(proteinRange.max)
    const hasProtein = proteinMin !== null || proteinMax !== null

    const mealsNum =
      isCalculateServings && mealsPerDay !== "" && Number(mealsPerDay) > 0
        ? Number(mealsPerDay)
        : null

    return {
      bio_info: {
        height: heightNum,
        weight: weightNum,
        age: ageNum,
        gender,
      },
      calorie_target: calorieNum,
      protein_range: hasProtein ? { min: proteinMin, max: proteinMax } : null,
      meals_per_day: mealsNum,
      selected_products: selectedProducts,
      notes: null,
    }
  }, [
    formData,
    gender,
    tdee,
    proteinRange,
    listData,
    isCalculateServings,
    mealsPerDay,
  ])
}
