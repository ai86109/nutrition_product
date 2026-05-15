"use client"

import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  /** 是否為「我」發的訊息（決定靠左還是靠右、配色） */
  isMine: boolean
  /** 對方的稱謂（例如 admin 端看見的「使用者 email」、user 端看見的「管理員」） */
  senderLabel?: string
  content: string
  /** ISO timestamp */
  createdAt: string
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${y}/${m}/${day} ${hh}:${mm}`
}

export default function MessageBubble({
  isMine,
  senderLabel,
  content,
  createdAt,
}: MessageBubbleProps) {
  return (
    <div className={cn("flex flex-col gap-1", isMine ? "items-end" : "items-start")}>
      {senderLabel && !isMine && (
        <span className="text-xs text-muted-foreground px-1">{senderLabel}</span>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words",
          isMine
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm",
        )}
      >
        {content}
      </div>
      <span className="text-[10px] text-muted-foreground px-1 tabular-nums">
        {formatTime(createdAt)}
      </span>
    </div>
  )
}
