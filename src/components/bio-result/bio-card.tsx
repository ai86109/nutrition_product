import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import InfoPopover from "../info-popover"
import { useBioInfoCalculations } from "@/hooks/useBioInfoCalculations"
import { HeartPulse } from "lucide-react"

interface BioMetricTileProps {
  label: string
  value: number
  unit?: string
  fallback: string
  popover: React.ReactNode
}

function BioMetricTile({ label, value, unit, fallback, popover }: BioMetricTileProps) {
  const isValid = value > 0
  return (
    <div className="rounded-lg bg-muted/40 ring-1 ring-border/50 px-3 py-2.5 transition-colors hover:bg-muted/60">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <InfoPopover>{popover}</InfoPopover>
      </div>
      {isValid ? (
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-semibold text-sky-600 dark:text-sky-400 tabular-nums leading-none">{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
      ) : (
        <span className="text-xs text-muted-foreground/80 leading-tight">{fallback}</span>
      )}
    </div>
  )
}

export default function BioCard() {
  const { bmi, ibw, abw } = useBioInfoCalculations()

  return (
    <Card className="transition-all hover:border-sky-500/40 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex items-center justify-center rounded-md bg-sky-500/10 p-1.5 text-sky-600 dark:text-sky-400">
            <HeartPulse className="size-4" />
          </span>
          生理數值
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <BioMetricTile
          label="BMI"
          value={bmi}
          fallback="請填寫身高、體重"
          popover={<p>BMI = 體重（公斤）/ 身高²（公尺）</p>}
        />
        <BioMetricTile
          label="理想體重"
          value={ibw}
          unit="kg"
          fallback="請填寫身高"
          popover={<p>理想體重 = 身高²（公尺）× 22</p>}
        />
        <BioMetricTile
          label="調整體重"
          value={abw}
          unit="kg"
          fallback="請填寫身高、體重"
          popover={<p>調整體重 = 理想體重 + 0.25 × (實際體重 - 理想體重)</p>}
        />
      </CardContent>
    </Card>
  )
}
