'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateProductReportStatus } from '@/lib/supabase/mutations/product-reports'
import type {
  ProductReportCategory,
  ProductReportStatus,
  ProductReportWithMeta,
} from '@/types/product-report'

const STATUS_LABEL: Record<ProductReportStatus, string> = {
  planned: '待處理',
  'in-progress': '進行中',
  completed: '已完成',
}

const STATUS_VARIANT: Record<ProductReportStatus, 'default' | 'secondary' | 'outline'> = {
  planned: 'outline',
  'in-progress': 'secondary',
  completed: 'default',
}

const STATUS_FILTERS: { value: ProductReportStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'planned', label: '待處理' },
  { value: 'in-progress', label: '進行中' },
  { value: 'completed', label: '已完成' },
]

const CATEGORY_LABEL: Record<ProductReportCategory, string> = {
  nutrition: '成分有誤',
  spec: '包裝/容量/匙數',
  classification: '分類有誤',
  other: '其他',
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}/${m}/${day} ${hh}:${mm}`
}

interface ProductReportTableProps {
  reports: ProductReportWithMeta[]
}

export default function ProductReportTable({
  reports: initialReports,
}: ProductReportTableProps) {
  const [reports, setReports] = useState<ProductReportWithMeta[]>(initialReports)
  const [statusFilter, setStatusFilter] = useState<ProductReportStatus | 'all'>('all')

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return reports
    return reports.filter((r) => r.status === statusFilter)
  }, [reports, statusFilter])

  const handleStatusChange = async (id: string, newStatus: ProductReportStatus) => {
    const target = reports.find((r) => r.id === id)
    if (!target || target.status === newStatus) return

    const prev = reports
    setReports((list) =>
      list.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
    )

    try {
      await updateProductReportStatus(id, newStatus, target.admin_note)
    } catch (err) {
      console.error('Failed to update report status:', err)
      setReports(prev)
      toast.error('更新狀態失敗，請稍後再試')
    }
  }

  const handleAdminNoteSave = async (id: string, note: string) => {
    const target = reports.find((r) => r.id === id)
    if (!target) return

    const trimmed = note.trim() === '' ? null : note
    if (trimmed === target.admin_note) return

    const prev = reports
    setReports((list) =>
      list.map((r) => (r.id === id ? { ...r, admin_note: trimmed } : r)),
    )

    try {
      await updateProductReportStatus(id, target.status, trimmed)
    } catch (err) {
      console.error('Failed to update admin note:', err)
      setReports(prev)
      toast.error('更新備註失敗，請稍後再試')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => {
          const isSelected = statusFilter === f.value
          return (
            <Button
              key={f.value}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              className="cursor-pointer"
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
              {f.value !== 'all' && (
                <Badge
                  variant="outline"
                  className={cn(
                    'ml-2',
                    isSelected && 'border-primary-foreground/40 text-primary-foreground',
                  )}
                >
                  {reports.filter((r) => r.status === f.value).length}
                </Badge>
              )}
            </Button>
          )
        })}
        <div className="ml-auto text-sm text-muted-foreground">
          共 {filtered.length} 筆
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[160px]">回報者</TableHead>
              <TableHead className="w-[180px]">產品</TableHead>
              <TableHead className="w-[120px]">種類</TableHead>
              <TableHead>內容</TableHead>
              <TableHead className="w-[140px]">狀態</TableHead>
              <TableHead className="w-[240px]">後台備註</TableHead>
              <TableHead className="w-[140px]">送出時間</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  目前沒有符合條件的回報
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="text-sm text-muted-foreground align-top pt-3">
                    {report.user_email ? (
                      report.user_email
                    ) : report.reporter_name ? (
                      <span>
                        {report.reporter_name}
                        <span className="ml-1 text-xs italic">（訪客）</span>
                      </span>
                    ) : (
                      <span className="italic">（匿名訪客）</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm align-top pt-3">
                    <div className="font-medium">
                      {report.product_name ?? <span className="italic text-muted-foreground">（已刪除）</span>}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums mt-0.5">
                      {report.product_id}
                    </div>
                  </TableCell>
                  <TableCell className="align-top pt-3">
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABEL[report.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-pre-wrap text-sm align-top pt-3 max-w-[400px]">
                    {report.description}
                  </TableCell>
                  <TableCell className="align-top pt-2">
                    <Select
                      value={report.status}
                      onValueChange={(v) =>
                        handleStatusChange(report.id, v as ProductReportStatus)
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue>
                          <Badge variant={STATUS_VARIANT[report.status]}>
                            {STATUS_LABEL[report.status]}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(STATUS_LABEL) as [ProductReportStatus, string][]).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="align-top pt-2">
                    <AdminNoteCell
                      initialNote={report.admin_note ?? ''}
                      onSave={(note) => handleAdminNoteSave(report.id, note)}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground align-top pt-3">
                    {formatDateTime(report.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

interface AdminNoteCellProps {
  initialNote: string
  onSave: (note: string) => Promise<void> | void
}

function AdminNoteCell({ initialNote, onSave }: AdminNoteCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initialNote)
  const [saving, setSaving] = useState(false)

  if (!editing) {
    return (
      <div className="flex items-start gap-2 group">
        <div className="flex-1 text-sm whitespace-pre-wrap min-h-[24px]">
          {initialNote === '' ? (
            <span className="text-muted-foreground italic">（無）</span>
          ) : (
            initialNote
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 cursor-pointer opacity-0 group-hover:opacity-100"
          onClick={() => {
            setDraft(initialNote)
            setEditing(true)
          }}
          aria-label="編輯後台備註"
        >
          <Pencil className="size-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        className="border-input flex w-full min-h-[60px] rounded-md border bg-background px-2 py-1.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoFocus
        disabled={saving}
      />
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 cursor-pointer"
          onClick={() => setEditing(false)}
          disabled={saving}
          aria-label="取消"
        >
          <X className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 cursor-pointer"
          onClick={async () => {
            setSaving(true)
            try {
              await onSave(draft)
              setEditing(false)
            } finally {
              setSaving(false)
            }
          }}
          disabled={saving}
          aria-label="儲存"
        >
          <Check className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
