"use client"

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAuth } from '@/contexts/AuthContext'
import { MAX_CUSTOM_PRODUCTS } from '@/utils/constants'
import {
  parseImportFile,
  previewImport,
  runImport,
  type ConflictStrategy,
  type ImportPreview,
} from '@/lib/custom-products/import'
import type { CustomProductExportFile } from '@/lib/custom-products/schema'
import type { CustomProductWithVariants } from '@/types/custom-product'

interface ImportCustomProductsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 目前未刪除的自訂產品，用於衝突偵測與 cap 計算 */
  existingProducts: CustomProductWithVariants[]
  /** 匯入完成後通知外層重新撈清單 */
  onImported?: () => void
}

const STRATEGY_LABELS: Record<ConflictStrategy, string> = {
  skip: '跳過（保留現有的，不動）',
  overwrite: '覆蓋（用檔案內容更新現有的）',
  copy: '建立副本（另存一筆，名稱加「（副本）」）',
}

const STRATEGY_ORDER: ConflictStrategy[] = ['skip', 'overwrite', 'copy']

export default function ImportCustomProductsDialog({
  open,
  onOpenChange,
  existingProducts,
  onImported,
}: ImportCustomProductsDialogProps) {
  const { session } = useAuth()
  const userId = session?.user?.id
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<CustomProductExportFile | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [strategy, setStrategy] = useState<ConflictStrategy>('skip')
  const [importing, setImporting] = useState(false)

  const reset = () => {
    setFile(null)
    setPreview(null)
    setStrategy('skip')
    setImporting(false)
  }

  const handleDialogChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = '' // 清掉才能再次選同一個檔
    if (!f) return

    let text: string
    try {
      text = await f.text()
    } catch {
      toast.error('讀取檔案失敗')
      return
    }

    const res = parseImportFile(text)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    setFile(res.file)
    setPreview(previewImport(res.file.products, existingProducts))
  }

  const handleConfirm = async () => {
    if (!file) return
    if (!userId) {
      toast.error('請先登入後再使用自訂營養品功能')
      return
    }

    setImporting(true)
    try {
      const r = await runImport(userId, file.products, existingProducts, strategy)
      const parts: string[] = []
      if (r.added) parts.push(`新增 ${r.added}`)
      if (r.overwritten) parts.push(`覆蓋 ${r.overwritten}`)
      if (r.skippedConflict) parts.push(`略過(同名) ${r.skippedConflict}`)
      if (r.skippedCap) parts.push(`略過(已達上限) ${r.skippedCap}`)
      if (r.failed) parts.push(`失敗 ${r.failed}`)
      const msg = parts.length ? parts.join('、') : '沒有可匯入的項目'

      if (r.failed > 0) toast.error(`匯入完成（部分失敗）：${msg}`)
      else toast.success(`匯入完成：${msg}`)

      onImported?.()
      handleDialogChange(false)
    } catch (err) {
      console.error('Import failed:', err)
      toast.error('匯入失敗，請稍後再試')
    } finally {
      setImporting(false)
    }
  }

  const remaining = Math.max(0, MAX_CUSTOM_PRODUCTS - existingProducts.length)

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>匯入自訂營養品</DialogTitle>
          <DialogDescription>
            選擇先前匯出的 .nutribase.json 檔。目前 {existingProducts.length} /{' '}
            {MAX_CUSTOM_PRODUCTS} 筆，還可新增 {remaining} 筆。
          </DialogDescription>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handlePick}
        />

        {!file ? (
          <div className="py-4">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="size-4" />
              選擇檔案
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
              <p>
                檔案共 <b>{preview?.total ?? 0}</b> 筆
              </p>
              <p>
                其中 <b>{preview?.conflicts ?? 0}</b> 筆與現有同名、
                <b>{preview?.newItems ?? 0}</b> 筆為新項目
              </p>
              {(preview?.newItems ?? 0) > remaining && (
                <p className="text-destructive">
                  新項目超過剩餘額度（{remaining} 筆），超出的會被略過。
                </p>
              )}
            </div>

            {(preview?.conflicts ?? 0) > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">同名項目的處理方式</Label>
                <RadioGroup
                  value={strategy}
                  onValueChange={(v) => setStrategy(v as ConflictStrategy)}
                  className="space-y-1.5"
                  disabled={importing}
                >
                  {STRATEGY_ORDER.map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <RadioGroupItem value={s} id={`strategy-${s}`} />
                      <Label
                        htmlFor={`strategy-${s}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {STRATEGY_LABELS[s]}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={reset} disabled={importing}>
                重新選擇
              </Button>
              <Button onClick={handleConfirm} disabled={importing}>
                {importing ? '匯入中...' : '確認匯入'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
