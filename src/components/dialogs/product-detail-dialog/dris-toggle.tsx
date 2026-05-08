"use client"

// 控制是否顯示每個營養素下方的 DRIs 文字。
// 點擊時若未登入或缺 gender/age，用 controlled popover 顯示提示，state 不變動。
// 用 PopoverAnchor（而不是 PopoverTrigger）避免點 checkbox 同時觸發 popover。

import { useId, useState } from "react"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/AuthContext"
import { useBioInfo } from "@/contexts/BioInfoContext"
import { cn } from "@/lib/utils"

interface DrisToggleProps {
  showDris: boolean
  onShowDrisChange: (next: boolean) => void
  className?: string
}

export function DrisToggle({ showDris, onShowDrisChange, className }: DrisToggleProps) {
  const { isLoggedIn } = useAuth()
  const { submittedValues } = useBioInfo()
  const hasBioInfo = !!submittedValues.gender && submittedValues.age > 0

  const [popoverOpen, setPopoverOpen] = useState(false)
  const [message, setMessage] = useState("")

  const handleCheckedChange = (next: boolean | "indeterminate") => {
    if (!isLoggedIn) {
      setMessage("此功能請登入後使用")
      setPopoverOpen(true)
      return
    }
    if (!hasBioInfo) {
      setMessage("請於計算機填寫年齡、性別送出後查看")
      setPopoverOpen(true)
      return
    }
    onShowDrisChange(next === true)
  }

  // checkboxId 讓原生 <label htmlFor> 連結到 Radix Checkbox（內部會渲染 button）
  const checkboxId = "dris-toggle-" + useId()

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverAnchor asChild>
        <div className={cn("flex items-center gap-1.5", className)}>
          <Checkbox
            id={checkboxId}
            checked={showDris}
            onCheckedChange={handleCheckedChange}
            className="size-3.5"
          />
          <label
            htmlFor={checkboxId}
            className="text-xs text-muted-foreground cursor-pointer select-none"
          >
            顯示 DRIs
          </label>
        </div>
      </PopoverAnchor>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-auto p-2 text-xs"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {message}
      </PopoverContent>
    </Popover>
  )
}
