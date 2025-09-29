import { Input } from "@/components/ui/input";
import { useBioInfo } from "@/contexts/BioInfoContext"

export default function BioSettings() {
  const { tdee, setTdee, proteinRange, setProteinRange } = useBioInfo();

  const isTdeeInvalid = isNaN(Number(tdee)) || Number(tdee) < 0;
  
  return (
    <div>
      <h2 className="font-bold mb-2">輸入病人所需熱量與蛋白質區間</h2>

      <div className="flex items-center space-x-2 mb-2">
        <span className="text-sm">熱量(kcal)：</span>
        <Input className="w-[100px]" type="number" placeholder="輸入熱量" value={tdee} onChange={(e) => setTdee(e.target.value)} />
        {isTdeeInvalid && <span className="text-sm text-red-500">請輸入可計算的數值</span>}
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