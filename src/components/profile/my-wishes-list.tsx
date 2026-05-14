"use client"

import { Badge } from "@/components/ui/badge"
import type { MyWish, WishStatus } from "@/types/wish"

const STATUS_LABEL: Record<WishStatus, string> = {
  planned: "待處理",
  "in-progress": "進行中",
  completed: "已完成",
}

const STATUS_VARIANT: Record<WishStatus, "default" | "secondary" | "outline"> = {
  planned: "outline",
  "in-progress": "secondary",
  completed: "default",
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${y}/${m}/${day} ${hh}:${mm}`
}

interface MyWishesListProps {
  wishes: MyWish[]
}

export default function MyWishesList({ wishes }: MyWishesListProps) {
  if (wishes.length === 0) {
    return (
      <div className="rounded-md border bg-white p-8 text-center text-sm text-muted-foreground">
        你還沒許過願。從畫面右上角的「許願池」可以送出第一個許願。
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {wishes.map((wish) => (
        <div
          key={wish.id}
          className="rounded-md border bg-white p-4 space-y-2"
        >
          <div className="flex items-start justify-between gap-3">
            <Badge variant={STATUS_VARIANT[wish.status]}>
              {STATUS_LABEL[wish.status]}
            </Badge>
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatDateTime(wish.created_at)}
            </span>
          </div>

          <div className="text-sm whitespace-pre-wrap">{wish.content}</div>

          {wish.admin_note && (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                管理員回覆
              </div>
              <div className="whitespace-pre-wrap">{wish.admin_note}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
