"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { createProductReport } from "@/lib/supabase/mutations/product-reports"
import type { ProductReportCategory } from "@/types/product-report"

const MAX_DESCRIPTION_LENGTH = 2000
const MAX_NAME_LENGTH = 50

const CATEGORY_OPTIONS: { value: ProductReportCategory; label: string }[] = [
  { value: "nutrition", label: "營養品成分有誤" },
  { value: "spec", label: "包裝 / 容量 / 匙數有誤" },
  { value: "classification", label: "營養品分類有誤" },
  { value: "other", label: "其他問題" },
]

interface ProductReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  productName: string
}

export default function ProductReportDialog({
  open,
  onOpenChange,
  productId,
  productName,
}: ProductReportDialogProps) {
  const { session, isLoggedIn } = useAuth()
  const userId = session?.user?.id ?? null

  const [reporterName, setReporterName] = useState("")
  const [category, setCategory] = useState<ProductReportCategory | "">("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 每次開啟（或切換產品）時重置狀態，避免上次填的內容洩漏到不同產品
  useEffect(() => {
    if (open) {
      setReporterName("")
      setCategory("")
      setDescription("")
      setError(null)
      setSubmitting(false)
    }
  }, [open, productId])

  const trimmedNameLength = reporterName.trim().length
  const trimmedDescLength = description.trim().length
  const overNameLimit = reporterName.length > MAX_NAME_LENGTH
  const overDescLimit = description.length > MAX_DESCRIPTION_LENGTH

  const canSubmit =
    !!category &&
    trimmedDescLength > 0 &&
    !overNameLimit &&
    !overDescLimit &&
    !submitting

  const handleSubmit = async () => {
    if (!category) {
      setError("請選擇問題種類")
      return
    }
    if (trimmedDescLength === 0) {
      setError("請描述問題")
      return
    }
    if (overDescLimit) {
      setError(`問題描述請控制在 ${MAX_DESCRIPTION_LENGTH} 字以內`)
      return
    }
    if (overNameLimit) {
      setError(`大名請控制在 ${MAX_NAME_LENGTH} 字以內`)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await createProductReport({
        product_id: productId,
        user_id: userId,
        // 登入用戶不送 reporter_name（DB 端 user_id join 出來的 email 就足夠識別）
        reporter_name: isLoggedIn ? null : reporterName,
        category,
        description,
      })
      onOpenChange(false)
      toast.success("已收到你的回報，謝謝！")
    } catch (err) {
      console.error(err)
      setError("送出失敗，請稍後再試")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>回報資料錯誤</DialogTitle>
          <DialogDescription>
            發現營養品資料有誤嗎？告訴我們是哪裡不對，我們會盡快查證並修正。
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* 您的大名（僅未登入顯示） */}
          {!isLoggedIn && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-reporter-name" className="text-sm">
                您的大名
                <span className="ml-1 text-xs text-muted-foreground font-normal">
                  （選填）
                </span>
              </Label>
              <Input
                id="report-reporter-name"
                placeholder="可留下稱呼讓我們聯絡你，或直接留空"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                disabled={submitting}
                maxLength={MAX_NAME_LENGTH + 10}
              />
              {overNameLimit && (
                <p className="text-xs text-destructive">
                  大名請控制在 {MAX_NAME_LENGTH} 字以內
                </p>
              )}
            </div>
          )}

          {/* 產品（自動帶入，唯讀） */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">產品</Label>
            <div
              className="rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-foreground/80"
              aria-readonly
            >
              {productName}
            </div>
          </div>

          {/* 問題種類 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-category" className="text-sm">
              問題種類
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as ProductReportCategory)}
              disabled={submitting}
            >
              <SelectTrigger id="report-category" className="w-full">
                <SelectValue placeholder="請選擇問題種類" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 問題描述 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-description" className="text-sm">
              問題描述
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <textarea
              id="report-description"
              className="border-input flex w-full min-h-[120px] rounded-md border bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              placeholder="例如：成分表裡的鈣含量單位應該是 mg 不是 g / 包裝規格應該是 250ml 不是 240ml..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className={error ? "text-destructive" : ""}>
                {error ?? "盡量描述清楚是哪個欄位、正確的內容是什麼"}
              </span>
              <span className={overDescLimit ? "text-destructive" : ""}>
                {description.length} / {MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? "送出中..." : "送出回報"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
