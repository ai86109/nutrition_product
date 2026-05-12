"use client"

import { Columns2, X as XIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { ApiProductListData } from "@/types"
import { cn } from "@/lib/utils"

interface CompareTriggerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  query: string
  setQuery: (q: string) => void
  options: ApiProductListData[]
  onSelect: (product: ApiProductListData) => void
}

/** 單品模式右上角的「比較搜尋」按鈕 + 下拉選單 */
export function CompareTrigger({
  open,
  onOpenChange,
  query,
  setQuery,
  options,
  onSelect,
}: CompareTriggerProps) {
  return (
    <div className="relative group/tip shrink-0">
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-state={open ? "open" : "closed"}
            className={cn(
              "inline-flex items-center justify-center rounded-md p-1",
              "text-muted-foreground hover:text-foreground hover:bg-muted",
              "data-[state=open]:bg-muted data-[state=open]:text-foreground",
              "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-label="與其他營養品比較"
          >
            <Columns2 className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={6}
          className="w-[300px] p-0 overflow-hidden"
        >
          <div className="p-2 border-b border-border/60">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋營養品名稱..."
              className="h-8 text-sm"
            />
          </div>
          {/* onWheel / onTouchMove stopPropagation 防止 Dialog scroll lock 攔截滾輪與觸控事件 */}
          <ul
            className="max-h-[280px] overflow-y-auto py-1"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {options.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                找不到符合的營養品
              </li>
            )}
            {options.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelect(p)}
                  className="w-full text-left px-3 py-2 hover:bg-muted/60 focus:bg-muted/60 focus:outline-none transition-colors"
                >
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  {p.engName && (
                    <p className="text-xs text-muted-foreground truncate">{p.engName}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {p.brand && <span className="text-[10px] text-muted-foreground">{p.brand}</span>}
                    {p.type && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-4 border-transparent",
                          p.type === "液劑" && "bg-blue-50 text-blue-600 hover:bg-blue-50",
                          p.type === "粉劑" && "bg-amber-50 text-amber-600 hover:bg-amber-50",
                        )}
                      >
                        {p.type}
                      </Badge>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>

      {/* CSS-only tooltip。popover 開啟時隱藏。 */}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute right-0 bottom-full mb-1.5 z-10",
          "px-2 py-0.5 rounded bg-foreground text-background text-xs whitespace-nowrap shadow-sm",
          "opacity-0 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100",
          "transition-opacity",
          open && "!opacity-0",
        )}
      >
        與其他營養品比較
      </span>
    </div>
  )
}

/** 比較模式 panel header 上的膠囊型移除按鈕（與 dialog 關閉叉叉明顯區分） */
export function PanelRemoveButton({
  onClick,
  label,
}: {
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full shrink-0",
        "border border-border/60 px-1.5 h-4",
        "text-[10px] text-muted-foreground",
        "hover:border-destructive/60 hover:text-destructive hover:bg-destructive/5",
        "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      aria-label={label}
      title={label}
    >
      <XIcon className="h-2.5 w-2.5" />
      移除
    </button>
  )
}
