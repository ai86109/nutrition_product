import { Card, CardContent } from "@/components/ui/card"
import InfoPopover from "./info-popover"
import ConditionalContent from "./conditional-content"
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations"

export default function BmiCard() {
  const { calculateBMI } = useNutritionCalculations()
  const bmi = calculateBMI()
  const isValidBMI = bmi > 0
  
  return (
    <Card className="max-h-[80px]">
      <CardContent>
        <div className="flex items-center gap-1">
          <ConditionalContent condition={isValidBMI} fallback="請填寫數值來計算 BMI">
            <span className="font-bold">BMI：</span>
            <span>{bmi}</span>
          </ConditionalContent>
          <InfoPopover>
            <p>BMI = 體重（公斤）/ 身高²（公尺）</p>
          </InfoPopover>
        </div>
      </CardContent>
    </Card>
  )
}