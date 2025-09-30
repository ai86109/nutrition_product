import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import InfoPopover from "../info-popover";
import { ProteinEditDialog } from "../dialogs/protein-edit-dialog";
import { useProteinSettings, type ProteinList } from "@/hooks/useProteinSettings"
import { useBioInfo } from "@/contexts/BioInfoContext";
import CalorieTypesBlock from "./calorie-types-block";
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations";
import ConditionalContent from "./conditional-content";
import CalculationTable from "./calculation-table";

export default function ProteinCard() {
  const { proteinList, updateChecked: updateProteinChecked, updateValue: updateProteinValue, resetToDefault }: { proteinList: ProteinList[], updateChecked: (checked: boolean, index: number) => void, updateValue: (id: string, value: string) => void, resetToDefault: () => void } = useProteinSettings();
  const { calorieTypeLists } = useBioInfo()
  const { pbw, ibw } = useNutritionCalculations()

  return (
    <Card className="overflow-auto">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-1">
          <p>蛋白質需求</p>
          <InfoPopover>
            <p className="font-bold">蛋白質需求（g）</p>
            <p>PBW = 實際體重 * 蛋白質係數</p>
            <p>IBW = 理想體重 * 蛋白質係數</p>
            <p>ABW = 調整體重 * 蛋白質係數</p>
          </InfoPopover>
        </CardTitle>
        <ProteinEditDialog proteinList={proteinList} updateChecked={updateProteinChecked} updateValue={updateProteinValue} resetToDefault={resetToDefault}/>
      </CardHeader>
      <CardContent>
        <ConditionalContent condition={pbw > 0 || ibw > 0} fallback="請先填寫數值來計算蛋白質需求量">
          <CalorieTypesBlock />
          <ConditionalContent condition={calorieTypeLists.length > 0 && calorieTypeLists.some(item => item.checked)} fallback="請至少選擇一個熱量類型">
            <ConditionalContent condition={proteinList.length > 0 && proteinList.some(item => item.checked)} fallback="尚未勾選任何蛋白質參數">
              <CalculationTable
                factors={proteinList}
                valueDigits={1}
              />
            </ConditionalContent>
          </ConditionalContent>
        </ConditionalContent>
      </CardContent>
    </Card>
  )
}