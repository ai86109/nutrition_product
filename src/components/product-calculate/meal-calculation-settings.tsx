import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"

export default function MealCalculationSettings({ 
  isServingsCanBeUsed,
  isCalculateServings,
  setIsCalculateServings,
  mealsPerDay,
  handleMealsInputChange
}: {
  isServingsCanBeUsed: boolean,
  isCalculateServings: boolean,
  setIsCalculateServings: React.Dispatch<React.SetStateAction<boolean>>,
  mealsPerDay: string | number,
  handleMealsInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className={`mt-4 text-sm ${!isServingsCanBeUsed && 'opacity-50'}`}>
      <div className="flex items-center space-x-2">
        <Checkbox
          disabled={!isServingsCanBeUsed}
          id={'check-calculate-servings'}
          checked={isCalculateServings}
          onCheckedChange={(checked) => setIsCalculateServings(!!checked)}
        />
        計算每餐所需份量，每日
        <Input
          disabled={!isServingsCanBeUsed}
          id={'meals-per-day'}
          className="w-[60px] h-[26px] mx-2"
          type="number"
          step={1}
          placeholder="數量"
          value={mealsPerDay}
          onChange={handleMealsInputChange}
        />
        餐
      </div>
      <span className="text-xs">＊此功能僅提供：當有輸入熱量時，以及選取單一營養品時使用</span>
    </div>
  )
}