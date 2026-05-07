'use client'

import { useMemo, useState } from 'react'
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
import { updateWishStatus } from '@/lib/supabase/mutations/wishes'
import type { WishStatus, WishWithUser } from '@/types/wish'

const STATUS_LABEL: Record<WishStatus, string> = {
  planned: '待處理',
  'in-progress': '進行中',
  completed: '已完成',
}

const STATUS_VARIANT: Record<WishStatus, 'default' | 'secondary' | 'outline'> = {
  planned: 'outline',
  'in-progress': 'secondary',
  completed: 'default',
}

const STATUS_FILTERS: { value: WishStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'planned', label: '待處理' },
  { value: 'in-progress', label: '進行中' },
  { value: 'completed', label: '已完成' },
]

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}/${m}/${day} ${hh}:${mm}`
}

interface WishPoolTableProps {
  wishes: WishWithUser[]
}

export default function WishPoolTable({ wishes: initialWishes }: WishPoolTableProps) {
  const [wishes, setWishes] = useState<WishWithUser[]>(initialWishes)
  const [statusFilter, setStatusFilter] = useState<WishStatus | 'all'>('all')

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return wishes
    return wishes.filter((w) => w.status === statusFilter)
  }, [wishes, statusFilter])

  const handleStatusChange = async (id: string, newStatus: WishStatus) => {
    const target = wishes.find((w) => w.id === id)
    if (!target || target.status === newStatus) return

    const prev = wishes
    setWishes((list) =>
      list.map((w) => (w.id === id ? { ...w, status: newStatus } : w)),
    )

    try {
      await updateWishStatus(id, newStatus, target.admin_note)
    } catch (err) {
      console.error('Failed to update wish status:', err)
      setWishes(prev)
      alert('更新狀態失敗，請稍後再試')
    }
  }

  const handleAdminNoteSave = async (id: string, note: string) => {
    const target = wishes.find((w) => w.id === id)
    if (!target) return

    const trimmed = note.trim() === '' ? null : note
    if (trimmed === target.admin_note) return

    const prev = wishes
    setWishes((list) =>
      list.map((w) => (w.id === id ? { ...w, admin_note: trimmed } : w)),
    )

    try {
      await updateWishStatus(id, target.status, trimmed)
    } catch (err) {
      console.error('Failed to update admin note:', err)
      setWishes(prev)
      alert('更新備註失敗，請稍後再試')
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
                  {wishes.filter((w) => w.status === f.value).length}
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
              <TableHead className="w-[160px]">許願者</TableHead>
              <TableHead>內容</TableHead>
              <TableHead className="w-[140px]">狀態</TableHead>
              <TableHead className="w-[260px]">後台備註</TableHead>
              <TableHead className="w-[140px]">送出時間</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  目前沒有符合條件的許願
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((wish) => (
                <TableRow key={wish.id}>
                  <TableCell className="text-sm text-muted-foreground align-top pt-3">
                    {wish.user_email ?? <span className="italic">（已刪除帳號）</span>}
                  </TableCell>
                  <TableCell className="whitespace-pre-wrap text-sm align-top pt-3">
                    {wish.content}
                  </TableCell>
                  <TableCell className="align-top pt-2">
                    <Select
                      value={wish.status}
                      onValueChange={(v) => handleStatusChange(wish.id, v as WishStatus)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue>
                          <Badge variant={STATUS_VARIANT[wish.status]}>
                            {STATUS_LABEL[wish.status]}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(STATUS_LABEL) as [WishStatus, string][]).map(
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
                      initialNote={wish.admin_note ?? ''}
                      onSave={(note) => handleAdminNoteSave(wish.id, note)}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground align-top pt-3">
                    {formatDateTime(wish.created_at)}
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
