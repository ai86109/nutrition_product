import { Card, CardContent } from "@/components/ui/card"
import InfoPopover from "../info-popover"
import ConditionalContent from "@/components/conditional-content"
import { useBioInfoCalculations } from "@/hooks/useBioInfoCalculations"

export default function BioCard() {
  const { bmi, abw } = useBioInfoCalculations()
  const isValidBMI = bmi > 0
  
  return (
    <Card className="max-h-[160px]">
      <CardContent>
        <div className="flex items-center gap-1">
          <ConditionalContent condition={isValidBMI} fallback="請填寫身高、體重來計算 BMI">
            <span className="font-bold">BMI：</span>
            <span>{bmi}</span>
          </ConditionalContent>
          <InfoPopover>
            <p>BMI = 體重（公斤）/ 身高²（公尺）</p>
          </InfoPopover>
        </div>
        <div className="flex items-center gap-1 mt-4">
          <ConditionalContent condition={isValidBMI} fallback="請填寫身高、體重來計算調整體重">
            <span className="font-bold">調整體重：</span>
            <span>{abw}</span>
          </ConditionalContent>
          <InfoPopover>
            <p>調整體重 = 理想體重+ 0.25 * (實際體重 - 理想體重)</p>
          </InfoPopover>
        </div>
      </CardContent>
    </Card>
  )
}