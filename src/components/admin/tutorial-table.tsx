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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Pencil,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  ExternalLink,
} from 'lucide-react'
import {
  createTutorial,
  deleteTutorial,
  swapTutorialOrder,
  updateTutorial,
} from '@/lib/supabase/mutations/tutorials'
import type { Tutorial, TutorialDirection } from '@/types/tutorial'

const TITLE_MAX = 200
const DESCRIPTION_MAX = 1000
const HREF_MAX = 2000

interface TutorialTableProps {
  initialTutorials: Tutorial[]
}

export default function TutorialTable({ initialTutorials }: TutorialTableProps) {
  const [tutorials, setTutorials] = useState<Tutorial[]>(initialTutorials)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Tutorial | null>(null)

  const sortedTutorials = useMemo(
    () =>
      [...tutorials].sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
        return a.created_at.localeCompare(b.created_at)
      }),
    [tutorials],
  )

  /** 由本地 list 算出某筆 tutorial 是否已在頂端 / 底端 */
  const positionMap = useMemo(() => {
    const map = new Map<string, { isFirst: boolean; isLast: boolean }>()
    sortedTutorials.forEach((t, idx) => {
      map.set(t.id, {
        isFirst: idx === 0,
        isLast: idx === sortedTutorials.length - 1,
      })
    })
    return map
  }, [sortedTutorials])

  const handleCreated = (created: Tutorial) => {
    setTutorials((list) => [...list, created])
  }

  const handleFieldSave = async (
    id: string,
    field: 'title' | 'description' | 'href',
    value: string,
  ) => {
    const target = tutorials.find((t) => t.id === id)
    if (!target) return

    const trimmed = value.trim()
    if (field !== 'description' && trimmed === '') {
      toast.error(field === 'title' ? '標題不能為空' : '連結不能為空')
      return
    }
    if (trimmed === target[field]) return

    const prev = tutorials
    const next: Tutorial = { ...target, [field]: trimmed }
    setTutorials((list) => list.map((t) => (t.id === id ? next : t)))

    try {
      await updateTutorial({
        id: next.id,
        title: next.title,
        description: next.description,
        href: next.href,
        is_published: next.is_published,
      })
    } catch (err) {
      console.error('Failed to update tutorial:', err)
      setTutorials(prev)
      toast.error('更新失敗，請稍後再試')
    }
  }

  const handleTogglePublished = async (id: string, isPublished: boolean) => {
    const target = tutorials.find((t) => t.id === id)
    if (!target || target.is_published === isPublished) return

    const prev = tutorials
    setTutorials((list) =>
      list.map((t) => (t.id === id ? { ...t, is_published: isPublished } : t)),
    )

    try {
      await updateTutorial({
        id: target.id,
        title: target.title,
        description: target.description,
        href: target.href,
        is_published: isPublished,
      })
    } catch (err) {
      console.error('Failed to toggle is_published:', err)
      setTutorials(prev)
      toast.error('更新發布狀態失敗，請稍後再試')
    }
  }

  const handleSwap = async (id: string, direction: TutorialDirection) => {
    const sorted = sortedTutorials
    const idx = sorted.findIndex((t) => t.id === id)
    if (idx === -1) return
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === sorted.length - 1) return

    const otherIdx = direction === 'up' ? idx - 1 : idx + 1
    const curr = sorted[idx]
    const other = sorted[otherIdx]

    // 本地立即互換 sort_order
    const prev = tutorials
    setTutorials((list) =>
      list.map((t) => {
        if (t.id === curr.id) return { ...t, sort_order: other.sort_order }
        if (t.id === other.id) return { ...t, sort_order: curr.sort_order }
        return t
      }),
    )

    try {
      await swapTutorialOrder(id, direction)
    } catch (err) {
      console.error('Failed to swap tutorial order:', err)
      setTutorials(prev)
      toast.error('調整順序失敗，請稍後再試')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    const prev = tutorials
    setTutorials((list) => list.filter((t) => t.id !== id))
    setDeleteTarget(null)

    try {
      await deleteTutorial(id)
      toast.success('已刪除')
    } catch (err) {
      console.error('Failed to delete tutorial:', err)
      setTutorials(prev)
      toast.error('刪除失敗，請稍後再試')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">共 {tutorials.length} 筆</div>
        <Button className="cursor-pointer" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="size-4" />
          新增教學
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">順序</TableHead>
              <TableHead className="w-[200px]">標題</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="w-[260px]">連結</TableHead>
              <TableHead className="w-[100px]">已發布</TableHead>
              <TableHead className="w-[80px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTutorials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  尚無教學，點擊右上「新增教學」開始建立
                </TableCell>
              </TableRow>
            ) : (
              sortedTutorials.map((tutorial) => {
                const pos = positionMap.get(tutorial.id) ?? { isFirst: false, isLast: false }
                return (
                  <TableRow key={tutorial.id}>
                    <TableCell className="align-top pt-2">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 cursor-pointer"
                          disabled={pos.isFirst}
                          onClick={() => handleSwap(tutorial.id, 'up')}
                          aria-label="上移"
                        >
                          <ArrowUp className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 cursor-pointer"
                          disabled={pos.isLast}
                          onClick={() => handleSwap(tutorial.id, 'down')}
                          aria-label="下移"
                        >
                          <ArrowDown className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="align-top pt-3">
                      <EditableTextCell
                        initialValue={tutorial.title}
                        placeholder="標題"
                        maxLength={TITLE_MAX}
                        onSave={(v) => handleFieldSave(tutorial.id, 'title', v)}
                      />
                    </TableCell>
                    <TableCell className="align-top pt-3">
                      <EditableTextCell
                        initialValue={tutorial.description}
                        placeholder="（無描述）"
                        maxLength={DESCRIPTION_MAX}
                        multiline
                        onSave={(v) => handleFieldSave(tutorial.id, 'description', v)}
                      />
                    </TableCell>
                    <TableCell className="align-top pt-3">
                      <EditableTextCell
                        initialValue={tutorial.href}
                        placeholder="https://..."
                        maxLength={HREF_MAX}
                        renderDisplay={(v) => (
                          <a
                            href={v}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline break-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="truncate max-w-[200px]">{v}</span>
                            <ExternalLink className="size-3 shrink-0" />
                          </a>
                        )}
                        onSave={(v) => handleFieldSave(tutorial.id, 'href', v)}
                      />
                    </TableCell>
                    <TableCell className="align-top pt-3">
                      <Switch
                        checked={tutorial.is_published}
                        onCheckedChange={(v) => handleTogglePublished(tutorial.id, v)}
                        aria-label="切換上下架"
                      />
                    </TableCell>
                    <TableCell className="align-top pt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 cursor-pointer text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(tutorial)}
                        aria-label="刪除"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CreateTutorialDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleCreated}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              要刪除「{deleteTarget?.title}」嗎？刪除後無法復原。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Inline 編輯欄位                                                             */
/* -------------------------------------------------------------------------- */

interface EditableTextCellProps {
  initialValue: string
  placeholder: string
  maxLength: number
  multiline?: boolean
  /** 自訂顯示模式渲染（例如連結要顯示成 <a>）。預設顯示純文字。 */
  renderDisplay?: (value: string) => React.ReactNode
  onSave: (value: string) => Promise<void> | void
}

function EditableTextCell({
  initialValue,
  placeholder,
  maxLength,
  multiline = false,
  renderDisplay,
  onSave,
}: EditableTextCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initialValue)
  const [saving, setSaving] = useState(false)

  if (!editing) {
    return (
      <div className="flex items-start gap-2 group">
        <div className="flex-1 text-sm whitespace-pre-wrap min-w-0 min-h-[24px]">
          {initialValue === '' ? (
            <span className="text-muted-foreground italic">{placeholder}</span>
          ) : renderDisplay ? (
            renderDisplay(initialValue)
          ) : (
            initialValue
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 cursor-pointer opacity-0 group-hover:opacity-100 shrink-0"
          onClick={() => {
            setDraft(initialValue)
            setEditing(true)
          }}
          aria-label="編輯"
        >
          <Pencil className="size-3.5" />
        </Button>
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(draft)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const overLimit = draft.length > maxLength

  return (
    <div className="flex flex-col gap-2">
      {multiline ? (
        <textarea
          className="border-input flex w-full min-h-[60px] rounded-md border bg-background px-2 py-1.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          disabled={saving}
        />
      ) : (
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          autoFocus
          disabled={saving}
        />
      )}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className={overLimit ? 'text-destructive' : ''}>
          {overLimit ? `超過 ${maxLength} 字上限` : ''}
        </span>
        <div className="flex gap-1">
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
            onClick={handleSave}
            disabled={saving || overLimit}
            aria-label="儲存"
          >
            <Check className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 新增 Dialog                                                                 */
/* -------------------------------------------------------------------------- */

interface CreateTutorialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (tutorial: Tutorial) => void
}

function CreateTutorialDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateTutorialDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [href, setHref] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 每次開啟 Dialog 都重置
  const reset = () => {
    setTitle('')
    setDescription('')
    setHref('')
    setIsPublished(true)
    setError(null)
    setSubmitting(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (next) reset()
    onOpenChange(next)
  }

  const canSubmit =
    title.trim().length > 0 &&
    title.trim().length <= TITLE_MAX &&
    href.trim().length > 0 &&
    href.trim().length <= HREF_MAX &&
    description.length <= DESCRIPTION_MAX &&
    !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const created = await createTutorial({
        title,
        description,
        href,
        is_published: isPublished,
      })
      onCreated(created)
      onOpenChange(false)
      toast.success('已新增教學')
    } catch (err) {
      console.error(err)
      setError('新增失敗，請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>新增教學</DialogTitle>
          <DialogDescription>
            標題與連結為必填。新增後會排在現有列表的最後一筆。
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">標題</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：營養品查詢、比較"
              disabled={submitting}
              autoFocus
            />
            <div className="text-xs text-muted-foreground text-right">
              {title.length} / {TITLE_MAX}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">描述</label>
            <textarea
              className="border-input flex w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="（可空白）"
              disabled={submitting}
            />
            <div className="text-xs text-muted-foreground text-right">
              {description.length} / {DESCRIPTION_MAX}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">連結</label>
            <Input
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="https://..."
              disabled={submitting}
            />
            <div className="text-xs text-muted-foreground text-right">
              {href.length} / {HREF_MAX}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">立即發布</label>
            <Switch
              checked={isPublished}
              onCheckedChange={setIsPublished}
              disabled={submitting}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
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
            {submitting ? '新增中...' : '新增'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
