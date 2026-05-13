import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import InfoPopover from "../info-popover";
import { TDEEEditDialog } from "../dialogs/tdee-edit-dialog";
import { useBioInfoCalculations } from "@/hooks/useBioInfoCalculations";
import { useBioInfo } from "@/contexts/BioInfoContext";
import ConditionalContent from "@/components/conditional-content";
import { TDEEList } from "@/types";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Zap } from "lucide-react";

export default function TdeeCard() {
  const { tdeeFactors } = useUserPreferences();
  const { pbw, calculateTDEE, rounding } = useBioInfoCalculations()
  const { submittedValues } = useBioInfo()
  const { height, age } = submittedValues

  const adjustmentFactor = (item: TDEEList): number => {
    const { activityFactor, stressFactor } = item
    if (!activityFactor || !stressFactor) return 1
    if (isNaN(Number(activityFactor)) || isNaN(Number(stressFactor))) return 1
    return rounding(Math.abs(Number(activityFactor)) * Math.abs(Number(stressFactor)), 2)
  }

  return (
    <Card className="transition-all hover:border-violet-500/40 hover:shadow-md">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <span className="flex items-center justify-center rounded-md bg-violet-500/10 p-1.5 text-violet-600 dark:text-violet-400">
            <Zap className="size-4" />
          </span>
          <p>TDEE</p>
          <InfoPopover>
            <p>TDEE = BEE * 調整係數</p>
            <p>男性 BEE = 13.7 * 實際體重 + 5 * 身高 - 6.8 * 年齡 + 66</p>
            <p>女性 BEE = 9.6 * 實際體重 + 1.8 * 身高 - 4.7 * 年齡 + 655</p>
            <p className="text-sm font-bold">＊調整係數（括號中的數字）：壓力因子 * 活動因子</p>
          </InfoPopover>
        </CardTitle>
        <TDEEEditDialog />
      </CardHeader>
      <CardContent>
        <ConditionalContent condition={pbw > 0 && height > 0 && age > 0} fallback="請先填寫數值來計算 TDEE">
          <ConditionalContent condition={tdeeFactors.length > 0} fallback="尚未設定 TDEE 參數，請先設定">
            <div className="flex flex-col gap-2">
              {tdeeFactors.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 ring-1 ring-border/50 px-3 py-2 transition-colors hover:bg-muted/60"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate">{item.name}</span>
                    <span className="shrink-0 inline-flex items-center rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2 py-0.5 text-[10px] font-medium tabular-nums">
                      ×{adjustmentFactor(item)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="text-base font-semibold text-violet-600 dark:text-violet-400 tabular-nums">{calculateTDEE(adjustmentFactor(item))}</span>
                    <span className="text-xs text-muted-foreground">kcal</span>
                  </div>
                </div>
              ))}
            </div>
          </ConditionalContent>
        </ConditionalContent>
      </CardContent>
    </Card>
  )
}