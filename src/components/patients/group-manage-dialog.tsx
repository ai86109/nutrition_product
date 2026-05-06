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
import { Input } from "@/components/ui/input"
import { Check, Pencil, Trash2, X } from "lucide-react"
import ConfirmDialog from "./confirm-dialog"
import {
  deletePatientGroup,
  renamePatientGroup,
} from "@/lib/supabase/mutations/patient-groups"
import type { PatientGroup } from "@/types/patient-group"

interface GroupManageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: PatientGroup[]
  onChanged: () => void
}

/**
 * 列出所有群組，支援 inline rename 與刪除（二次確認）。
 */
export default function GroupManageDialog({
  open,
  onOpenChange,
  groups,
  onChanged,
}: GroupManageDialogProps) {
  // 正在編輯哪一個群組
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState("")
  const [editError, setEditError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // 待確認刪除的群組
  const [pendingDelete, setPendingDelete] = useState<PatientGroup | null>(null)
  const [deleting, setDeleting] = useState(false)

  // 開關 dialog 時，重置編輯狀態
  useEffect(() => {
    if (!open) {
      setEditingId(null)
      setDraftName("")
      setEditError(null)
      setPendingDelete(null)
    }
  }, [open])

  const startEdit = (group: PatientGroup) => {
    setEditingId(group.id)
    setDraftName(group.name)
    setEditError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraftName("")
    setEditError(null)
  }

  const saveEdit = async (group: PatientGroup) => {
    const trimmed = draftName.trim()
    if (!trimmed) {
      setEditError("群組名稱不可為空")
      return
    }
    if (trimmed === group.name) {
      cancelEdit()
      return
    }

    setSaving(true)
    try {
      await renamePatientGroup(group.id, trimmed)
      onChanged()
      cancelEdit()
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === "23505") {
        setEditError("已存在同名群組")
      } else {
        setEditError("重新命名失敗，請稍後再試")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deletePatientGroup(pendingDelete.id)
      onChanged()
      setPendingDelete(null)
    } catch (err) {
      console.error(err)
      alert("刪除群組失敗，請稍後再試")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[440px]">
          <DialogHeader>
            <DialogTitle>管理群組</DialogTitle>
            <DialogDescription>
              重新命名或刪除群組。刪除群組不會刪除底下的病人。
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-80 overflow-y-auto rounded-md border">
            {groups.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                尚未建立任何群組
              </p>
            ) : (
              groups.map((g) => {
                const isEditing = editingId === g.id
                return (
                  <div
                    key={g.id}
                    className="flex items-center gap-2 border-b px-3 py-2 last:border-b-0"
                  >
                    {isEditing ? (
                      <>
                        <div className="flex-1 min-w-0">
                          <Input
                            value={draftName}
                            onChange={(e) => {
                              setDraftName(e.target.value)
                              setEditError(null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                saveEdit(g)
                              } else if (e.key === "Escape") {
                                e.preventDefault()
                                cancelEdit()
                              }
                            }}
                            disabled={saving}
                            autoFocus
                            className="h-8"
                          />
                          {editError && (
                            <p className="mt-1 text-xs text-red-500">
                              {editError}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0"
                          onClick={() => saveEdit(g)}
                          disabled={saving}
                          title="儲存"
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0"
                          onClick={cancelEdit}
                          disabled={saving}
                          title="取消"
                        >
                          <X className="size-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 min-w-0 truncate text-sm">
                          {g.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0"
                          onClick={() => startEdit(g)}
                          title="重新命名"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 text-destructive hover:text-destructive"
                          onClick={() => setPendingDelete(g)}
                          title="刪除群組"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                )
              })
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>關閉</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => {
          if (!o) setPendingDelete(null)
        }}
        title={
          pendingDelete
            ? `你要刪除群組「${pendingDelete.name}」嗎？`
            : ""
        }
        description="底下的病人不會被刪除，只會從這個群組移除。"
        confirmText="刪除"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  )
}
