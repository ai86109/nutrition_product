"use client"

import { cn } from "@/lib/utils"

// 「數據有誤？點我回報」小字按鈕，點擊後由父層開啟 ProductReportDialog。
// 不論是否登入皆可使用。
interface ReportTriggerProps {
  onClick: () => void
  /** 比較模式時用來標示「回報 A / B 錯誤」；單品模式不傳 */
  panelLabel?: string
  className?: string
}

export function ReportTrigger({ onClick, panelLabel, className }: ReportTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-xs text-muted-foreground hover:text-foreground transition-colors",
        "underline-offset-2 hover:underline",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
        className,
      )}
    >
      {panelLabel ? `回報 ${panelLabel} 錯誤` : "數據有誤？點我回報"}
    </button>
  )
}
