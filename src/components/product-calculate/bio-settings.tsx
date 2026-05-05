import { Input } from "@/components/ui/input";
import { useBioInfo } from "@/contexts/BioInfoContext"

export default function BioSettings() {
  const { calorieRange, setCalorieRange, proteinRange, setProteinRange } = useBioInfo();

  return (
    <div>
      <h2 className="font-bold mb-2">輸入病人目標熱量與蛋白質區間</h2>

      <div className="flex items-center space-x-2 mb-2">
        <span className="text-sm">目標熱量(kcal)：</span>
        <Input className="w-[90px]" type="number" placeholder="最小值" value={calorieRange.min} onChange={(e) => setCalorieRange({ ...calorieRange, min: e.target.value })} />
        <span>-</span>
        <Input className="w-[90px]" type="number" placeholder="最大值" value={calorieRange.max} onChange={(e) => setCalorieRange({ ...calorieRange, max: e.target.value })} />
      </div>

      <div className="flex items-center space-x-2 mb-2">
        <span className="text-sm">蛋白質範圍(g)：</span>
        <Input className="w-[90px]" type="number" step="0.1" placeholder="最小值" value={proteinRange.min} onChange={(e) => setProteinRange({ ...proteinRange, min: e.target.value })} />
        <span>-</span>
        <Input className="w-[90px]" type="number" step="0.1" placeholder="最大值" value={proteinRange.max} onChange={(e) => setProteinRange({ ...proteinRange, max: e.target.value })} />
      </div>
    </div>
  )
}