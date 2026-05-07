"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { createWish } from "@/lib/supabase/mutations/wishes"

const MAX_LENGTH = 1000

interface WishPoolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function WishPoolDialog({ open, onOpenChange }: WishPoolDialogProps) {
  const { session } = useAuth()
  const userId = session?.user?.id

  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 每次開啟 Dialog 都重置狀態
  useEffect(() => {
    if (open) {
      setContent("")
      setError(null)
      setSubmitting(false)
    }
  }, [open])

  const trimmedLength = content.trim().length
  const overLimit = content.length > MAX_LENGTH
  const canSubmit = !!userId && trimmedLength > 0 && !overLimit && !submitting

  const handleSubmit = async () => {
    if (!userId) {
      setError("請先登入後再許願")
      return
    }
    if (trimmedLength === 0) {
      setError("請輸入想許的願望")
      return
    }
    if (overLimit) {
      setError(`內容請控制在 ${MAX_LENGTH} 字以內`)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await createWish(userId, content)
      onOpenChange(false)
      // 簡單的成功提示，後續若引入 toast 元件可改成 toast
      alert("已收到你的許願，謝謝！")
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
          <DialogTitle>許願池</DialogTitle>
          <DialogDescription>
            有想要的功能、改善建議或任何想法都歡迎告訴我，收到的建議都是產品進步的動力！
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <textarea
            className="border-input flex w-full min-h-[140px] rounded-md border bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            placeholder="例如：希望可以新增 XX 功能 / 表格匯出 / 計算公式可以調整成..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
            autoFocus
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className={error ? "text-destructive" : ""}>
              {error ?? "收到的建議我都會親自看過唷"}
            </span>
            <span className={overLimit ? "text-destructive" : ""}>
              {content.length} / {MAX_LENGTH}
            </span>
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
            {submitting ? "送出中..." : "送出許願"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
