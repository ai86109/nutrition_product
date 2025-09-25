import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import InfoPopover from "./info-popover";
import { TDEEEditDialog } from "../dialogs/tdee-edit-dialog";
import { useTdeeSettings, type TDEEList } from "@/hooks/useTdeeSettings";
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations";
import { useBioInfo } from "@/contexts/BioInfoContext";
import ConditionalContent from "./conditional-content";

export default function TdeeCard() {
  const { tdeeList, addList, deleteList }: { tdeeList: TDEEList[], addList: (item: TDEEList) => void, deleteList: (index: number) => void } = useTdeeSettings();
  const { calculatePBW, calculateTDEE, rounding } = useNutritionCalculations()
  const { submittedValues } = useBioInfo()
  const { height, age } = submittedValues
  const isValidPBW = calculatePBW() > 0

  const adjustmentFactor = (item: TDEEList): number => {
    const { activityFactor, stressFactor } = item
    if (!activityFactor || !stressFactor) return 1
    if (isNaN(Number(activityFactor)) || isNaN(Number(stressFactor))) return 1
    return rounding(Math.abs(Number(activityFactor)) * Math.abs(Number(stressFactor)), 2)
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-1">
          <p>TDEE</p>
          <InfoPopover>
            <p>TDEE = BEE * 調整係數</p>
            <p>男性 BEE = 13.7 * 實際體重 + 5 * 身高 - 6.8 * 年齡 + 66</p>
            <p>女性 BEE = 9.6 * 實際體重 + 1.8 * 身高 - 4.7 * 年齡 + 655</p>
            <p className="text-sm font-bold">＊調整係數（括號中的數字）：壓力因子 * 活動因子</p>
          </InfoPopover>
        </CardTitle>
        <TDEEEditDialog tdeeList={tdeeList} addList={addList} deleteList={deleteList} />
      </CardHeader>
      <CardContent>
        <ConditionalContent condition={isValidPBW && height > 0 && age > 0} fallback="請先填寫數值來計算 TDEE">
          <ConditionalContent condition={tdeeList.length > 0} fallback="尚未設定 TDEE 參數，請先設定">
            {tdeeList.map((item, index) => (
              <div key={`${item.name}-${index}`}>
                <span className="font-bold">- {item.name}（{adjustmentFactor(item)}）：</span>
                <span>{calculateTDEE(adjustmentFactor(item))}</span>
              </div>
            ))}
          </ConditionalContent>
        </ConditionalContent>
      </CardContent>
    </Card>
  )
}