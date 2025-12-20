import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import InfoPopover from "../info-popover";
import { ProteinEditDialog } from "../dialogs/protein-edit-dialog";
import { useBioInfo } from "@/contexts/BioInfoContext";
import CalorieTypesBlock from "./calorie-types-block";
import { useBioInfoCalculations } from "@/hooks/useBioInfoCalculations";
import ConditionalContent from "@/components/conditional-content";
import CalculationTable from "./calculation-table";
import { ProteinList } from "@/types";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

export default function ProteinCard() {
  const { proteinFactors } = useUserPreferences();
  const { calorieTypeLists } = useBioInfo()
  const { pbw, ibw } = useBioInfoCalculations()

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
        <ProteinEditDialog />
      </CardHeader>
      <CardContent>
        <ConditionalContent condition={pbw > 0 || ibw > 0} fallback="請先填寫數值來計算蛋白質需求量">
          <CalorieTypesBlock />
          <ConditionalContent condition={calorieTypeLists.length > 0 && calorieTypeLists.some(item => item.checked)} fallback="請至少選擇一個熱量類型">
            <ConditionalContent condition={proteinFactors.length > 0 && proteinFactors.some(item => item.checked)} fallback="尚未勾選任何蛋白質參數">
              <CalculationTable
                factors={proteinFactors}
                valueDigits={1}
              />
            </ConditionalContent>
          </ConditionalContent>
        </ConditionalContent>
      </CardContent>
    </Card>
  )
}