"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MessageButtonProps {
  unreadCount: number
  onClick: () => void
  /** 是否禁用（例如 locked 但仍可開啟唯讀，這時不要禁用；保留 prop 以備擴充） */
  disabled?: boolean
  /** 是否為小尺寸（用在 admin table 列） */
  size?: "default" | "icon"
  ariaLabel?: string
  className?: string
}

/**
 * 觸發訊息抽屜的按鈕。右上角會顯示未讀紅點 + 數字。
 */
export default function MessageButton({
  unreadCount,
  onClick,
  disabled = false,
  size = "icon",
  ariaLabel = "查看訊息",
  className,
}: MessageButtonProps) {
  const hasUnread = unreadCount > 0
  return (
    <div className={cn("relative inline-block", className)}>
      <Button
        variant="outline"
        size={size}
        className="cursor-pointer"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        <MessageCircle className="size-4" />
      </Button>
      {hasUnread && (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-[18px] text-center pointer-events-none"
          aria-label={`${unreadCount} 則未讀`}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  )
}
