import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import InfoPopover from "../info-popover";
import { CalorieCountingEditDialog } from "../dialogs/calorie-counting-edit-dialog";
import { useBioInfoCalculations } from "@/hooks/useBioInfoCalculations";
import { useCalorieSettings } from "@/hooks/localStorage-related/useCalorieSettings";
import { useBioInfo } from "@/contexts/BioInfoContext";
import CalorieTypesBlock from "./calorie-types-block";
import ConditionalContent from "./conditional-content";
import CalculationTable from "./calculation-table";
import { CalorieFactorList } from "@/types";

export default function CalorieCard() {
  const { calorieFactorLists, updateChecked: updateCalorieChecked, updateValue: updateCalorieValue }: { calorieFactorLists: CalorieFactorList[], updateChecked: (checked: boolean, index: number) => void, updateValue: (id: string, value: string) => void } = useCalorieSettings();
  const { pbw, ibw } = useBioInfoCalculations()
  const { calorieTypeLists } = useBioInfo()

  return (
    <Card className="overflow-auto">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-1">
          <p>熱量計算</p>
          <InfoPopover>
            <p className="font-bold">熱量需求（kcal）</p>
            <p>PBW = 實際體重* 係數</p>
            <p>IBW = 理想體重* 係數</p>
            <p>ABW = (理想體重+ 0.25 * (實際體重 - 理想體重)) * 係數</p>
          </InfoPopover>
        </CardTitle>
        <CalorieCountingEditDialog calorieFactorLists={calorieFactorLists} updateChecked={updateCalorieChecked} updateValue={updateCalorieValue} />
      </CardHeader>
      <CardContent>
        <ConditionalContent condition={pbw > 0 || ibw > 0} fallback="請先填寫數值來計算熱量">
          <ConditionalContent condition={calorieFactorLists.length > 0 && calorieFactorLists.some(item => item.checked)} fallback="尚未勾選熱量參數，請先設定">
            <CalorieTypesBlock />
            <ConditionalContent condition={calorieTypeLists.length > 0 && calorieTypeLists.some(item => item.checked)} fallback="請至少選擇一個熱量類型">
              <CalculationTable
                factors={calorieFactorLists}
                valueDigits={1}
              />
            </ConditionalContent>
          </ConditionalContent>
        </ConditionalContent>
      </CardContent>
    </Card>
  )
}