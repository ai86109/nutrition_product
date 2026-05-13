import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import InfoPopover from "../info-popover"
import ConditionalContent from "@/components/conditional-content"
import { useBioInfoCalculations } from "@/hooks/useBioInfoCalculations"

interface BioMetricRowProps {
  label: string
  value: number
  unit?: string
  fallback: string
  popover: React.ReactNode
}

function BioMetricRow({ label, value, unit, fallback, popover }: BioMetricRowProps) {
  const isValid = value > 0
  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-border/60 last:border-b-0">
      <ConditionalContent
        condition={isValid}
        fallback={<span className="text-sm text-muted-foreground">{fallback}</span>}
      >
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">{label}</span>
          <InfoPopover>{popover}</InfoPopover>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-semibold text-primary tabular-nums">{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
      </ConditionalContent>
      {!isValid && (
        <InfoPopover>{popover}</InfoPopover>
      )}
    </div>
  )
}

export default function BioCard() {
  const { bmi, ibw, abw } = useBioInfoCalculations()

  return (
    <Card>
      <CardHeader>
        <CardTitle>生理數值</CardTitle>
      </CardHeader>
      <CardContent>
        <BioMetricRow
          label="BMI"
          value={bmi}
          fallback="請填寫身高、體重來計算 BMI"
          popover={<p>BMI = 體重（公斤）/ 身高²（公尺）</p>}
        />
        <BioMetricRow
          label="理想體重"
          value={ibw}
          unit="kg"
          fallback="請填寫身高來計算理想體重"
          popover={<p>理想體重 = 身高²（公尺）× 22</p>}
        />
        <BioMetricRow
          label="調整體重"
          value={abw}
          unit="kg"
          fallback="請填寫身高、體重來計算調整體重"
          popover={<p>調整體重 = 理想體重 + 0.25 × (實際體重 - 理想體重)</p>}
        />
      </CardContent>
    </Card>
  )
}
