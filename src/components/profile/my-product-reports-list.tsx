"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import MessageButton from "@/components/conversation/message-button"
import ConversationSheet from "@/components/conversation/conversation-sheet"
import type {
  MyProductReport,
  ProductReportCategory,
  ProductReportStatus,
} from "@/types/product-report"

const STATUS_LABEL: Record<ProductReportStatus, string> = {
  planned: "待處理",
  "in-progress": "進行中",
  completed: "已完成",
}

const STATUS_VARIANT: Record<
  ProductReportStatus,
  "default" | "secondary" | "outline"
> = {
  planned: "outline",
  "in-progress": "secondary",
  completed: "default",
}

const CATEGORY_LABEL: Record<ProductReportCategory, string> = {
  nutrition: "成分有誤",
  spec: "包裝/容量/匙數",
  classification: "分類有誤",
  other: "其他",
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

interface MyProductReportsListProps {
  reports: MyProductReport[]
  /** 訊息抽屜開啟並標讀後立即把該筆 unread_count 設為 0（optimistic UI） */
  onMarkRead?: (id: string) => void
}

export default function MyProductReportsList({
  reports,
  onMarkRead,
}: MyProductReportsListProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const openReport = reports.find((r) => r.id === openId) ?? null

  if (reports.length === 0) {
    return (
      <div className="rounded-md border bg-white p-8 text-center text-sm text-muted-foreground">
        你還沒回報過任何問題。在產品詳細資料中可以送出錯誤回報。
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className="rounded-md border bg-white p-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={STATUS_VARIANT[report.status]}>
                  {STATUS_LABEL[report.status]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {CATEGORY_LABEL[report.category]}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatDateTime(report.created_at)}
                </span>
                <MessageButton
                  unreadCount={report.unread_count}
                  onClick={() => setOpenId(report.id)}
                  ariaLabel="查看此回報的訊息"
                />
              </div>
            </div>

            <div className="text-sm">
              <div className="font-medium">
                {report.product_name ?? (
                  <span className="italic text-muted-foreground">
                    （產品已下架）
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground tabular-nums mt-0.5">
                {report.product_id}
              </div>
            </div>

            <div className="text-sm whitespace-pre-wrap">
              {report.description}
            </div>

            {report.admin_note && (
              <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  管理員回覆
                </div>
                <div className="whitespace-pre-wrap">{report.admin_note}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {openReport && (
        <ConversationSheet
          open={!!openId}
          onOpenChange={(o) => {
            if (!o) setOpenId(null)
          }}
          kind="report"
          id={openReport.id}
          viewerRole="user"
          locked={openReport.status === "completed"}
          title={openReport.product_name ?? "錯誤回報對話"}
          subtitle={`【${CATEGORY_LABEL[openReport.category]}】${openReport.description}`}
          onUnreadCleared={() => onMarkRead?.(openReport.id)}
        />
      )}
    </>
  )
}
