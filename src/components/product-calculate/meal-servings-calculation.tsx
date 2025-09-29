import { useNutritionCalculations } from "@/hooks/useNutritionCalculations";
import { useBioInfo } from "@/contexts/BioInfoContext"
import { ProductData, SelectData } from "@/types/nutrition";
import { CALC_UNIT_MAPPINGS } from "@/utils/constants";

const getProductUnit = ({ selectedId, selectOptions }: SelectData) => {
  const result = selectOptions.map((type) => {
    const { unit, products } = type
    if (products.find((product) => selectedId === product.id)) return unit
    return null
  }).filter((item) => item !== null)

  return result[0]
}

interface ProteinRangeBlockProps {
  proteinPerMeal: number
  mealsPerDay: number | string
}

function ProteinRangeBlock({ proteinPerMeal, mealsPerDay }: ProteinRangeBlockProps): React.ReactElement | null {
  const { rounding } = useNutritionCalculations()
  const { proteinRange } = useBioInfo();
  const { min, max } = proteinRange
  const minValue = Number(Math.min(Number(min), Number(max)))
  const maxValue = Number(Math.max(Number(min), Number(max)))
  if (minValue <= 0 && maxValue <= 0) return null

  const totalProtein = proteinPerMeal * Number(mealsPerDay)
  const isProteinInRange: boolean = totalProtein >= minValue && totalProtein <= maxValue
  let proteinRangeText = ''
  if (!isProteinInRange) {
    if (totalProtein < minValue) proteinRangeText = `低於`
    else if (totalProtein > maxValue) proteinRangeText = `高於`
  }

  return (
    <p>
      <span className="mr-1">含蛋白質：{rounding(proteinPerMeal)}g</span>
      <span className={`text-xs ${proteinRangeText ? 'text-red-700' : 'text-green-700'}`}>
        <span>({proteinRangeText}蛋白質設定範圍:{rounding(minValue / Number(mealsPerDay))}g - {rounding(maxValue / Number(mealsPerDay))}g / 餐)</span>
      </span>
    </p>
  )
}

interface CalculateDailyServingsPerMealProps {
  mealsPerDay: number | string
  item: ProductData
}

export function MealServingsCalculation({ mealsPerDay, item }: CalculateDailyServingsPerMealProps): React.ReactElement {
  const { rounding } = useNutritionCalculations()
  const { tdee } = useBioInfo();

  // get current ratio
  const { select, defaultAmount, ingredients } = item
  const { selectedId, selectOptions } = select
  const currentAmount: number = selectOptions.map((type) => {
    const { products } = type
    return products.find((product) => selectedId === product.id)?.volume || null
  }).filter((item) => item !== null)[0] || 0

  const ratio = currentAmount / defaultAmount

  // calculate servings per meal
  const servingsPerMeal = ((Number(tdee)) / Number(mealsPerDay)) / (ingredients.calories * ratio)
  const unit = getProductUnit(select)
  const proteinPerMeal = (ingredients.protein * ratio) * servingsPerMeal

  return (
    <div className="bg-blue-50 p-2 rounded w-[200px] text-wrap lg:w-auto">
      <p>
        <span className="font-bold">每餐需要 {rounding(servingsPerMeal)} {unit} = {rounding(currentAmount * servingsPerMeal)}{CALC_UNIT_MAPPINGS[unit]}</span>
        <span>（總共 {rounding(servingsPerMeal * Number(mealsPerDay))} {unit} = {rounding(currentAmount * servingsPerMeal * Number(mealsPerDay))}{CALC_UNIT_MAPPINGS[unit]}）</span>
      </p>
      <ProteinRangeBlock proteinPerMeal={proteinPerMeal} mealsPerDay={mealsPerDay} />
    </div>
  )
}